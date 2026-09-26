import React, { useState, useEffect, useRef, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search } from "lucide-react";
import AccountPage from "../components/AccountPage";
import BottomNav from "../components/BottomNav";
import PromoCarousel from "../components/PromoCarousel";
import ProductDetailModal from "../components/ProductDetailModal";
import NotificationModal from "../components/NotificationModal";
import CartDrawer from "../components/CartDrawer";
import GreetingCard from "../components/GreetingCard";
import { socket, API_BASE_URL } from "../services/socket";
import VoucherButton from "../components/VoucherButton";
import VoucherModal from "../components/VoucherModal";

const RANDOM_DISPLAY_COUNT = 8;

const CATEGORIES = [
  { key: "Makanan Berat", label: "Makanan Berat" },
  { key: "Makanan Ringan", label: "Makanan Ringan" },
  { key: "Coffee", label: "Coffee" },
  { key: "Non-Coffee", label: "Non-Coffee" },
];

export default function CustomerMenu() {
  const scrollContainerRef = useRef(null);
  const modalContentRef = useRef(null);
  const dragDistanceRef = useRef(0);

  const [menus, setMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [customerName, setCustomerName] = useState(
    localStorage.getItem("customerName") || "",
  );
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [hasNewVoucher, setHasNewVoucher] = useState(true); // True kalau ada voucher baru
  const isLoggedIn = Boolean(localStorage.getItem("userToken")); // Cek status login dari token
  const [cart, setCart] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customization, setCustomization] = useState({
    variant: "",
    size: "Regular",
    toppings: [],
    notes: "",
    quantity: 1,
  });

  // --- Drag horizontal untuk wadah kategori (chip) ---
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // --- Drag vertikal "grab to pan" untuk grid menu ---
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollY, setDragStartScrollY] = useState(0);

  // --- Drag vertikal untuk konten DALAM modal detail produk ---
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [modalDragStartY, setModalDragStartY] = useState(0);
  const [modalDragStartScrollTop, setModalDragStartScrollTop] = useState(0);

  const isCartOpen = activeModal === "cart";
  const isNotifOpen = activeModal === "notif";

  // --- Fetch menu saat mount ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menus`)
      .then((res) => res.json())
      .then((result) => setMenus(result.data || []))
      .catch((err) => console.error("Error fetching menus:", err));
  }, []);

  // --- Lock body scroll saat modal terbuka ---
  useEffect(() => {
    if (activeModal === null) return;

    const scrollY = window.scrollY;
    const originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
      width: document.body.style.width,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.left = originalStyle.left;
      document.body.style.right = originalStyle.right;
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.width = originalStyle.width;
      window.scrollTo(0, scrollY);
    };
  }, [activeModal]);

  // --- Socket listener: notifikasi pesanan siap ---
  useEffect(() => {
    socket.on("order-ready", (data) => {
      if (
        data.customer_name &&
        customerName &&
        data.customer_name.trim().toLowerCase() ===
          customerName.trim().toLowerCase()
      ) {
        toast.success(
          `Pesanan Siap! Pesanan untuk ${data.customer_name} sudah siap diambil di kasir!`,
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        );

        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        );
        audio.play().catch((err) => console.log("Audio play blocked:", err));
      }
    });

    return () => {
      socket.off("order-ready");
    };
  }, [customerName]);

  // --- Socket listener: update stok real-time saat ada order / perubahan stok admin ---
  useEffect(() => {
    const handleStockUpdated = (updatedItems) => {
      if (!Array.isArray(updatedItems) || updatedItems.length === 0) return;
      const updatedMap = new Map(updatedItems.map((m) => [String(m._id), m]));
      setMenus((prevMenus) =>
        prevMenus.map((item) => {
          const matched = updatedMap.get(String(item._id));
          return matched ? { ...item, stock: matched.stock } : item;
        }),
      );
    };

    socket.on("stock-updated", handleStockUpdated);
    return () => {
      socket.off("stock-updated", handleStockUpdated);
    };
  }, []);

  // --- Drag horizontal (kategori chip) ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };

  // --- Drag vertikal (grid menu) ---
  const handleGridMouseDown = (e) => {
    setIsPageDragging(true);
    setDragStartY(e.pageY);
    setDragStartScrollY(window.scrollY);
    dragDistanceRef.current = 0;
  };

  useEffect(() => {
    if (!isPageDragging) return;

    const handleWindowMouseMove = (e) => {
      const deltaY = e.pageY - dragStartY;
      dragDistanceRef.current = Math.abs(deltaY);
      window.scrollTo(0, dragStartScrollY - deltaY);
    };
    const handleWindowMouseUp = () => setIsPageDragging(false);

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isPageDragging, dragStartY, dragStartScrollY]);

  const handleCardClick = (menu) => {
    if (dragDistanceRef.current > 5) return;
    handleOpenDetail(menu);
  };

  // --- Derived state ---
  const randomMenus = useMemo(() => {
    if (menus.length === 0) return [];
    return [...menus]
      .sort(() => Math.random() - 0.5)
      .slice(0, RANDOM_DISPLAY_COUNT);
  }, [menus]);

  const filteredMenus = activeCategory
    ? menus.filter((menu) => menu.category === activeCategory)
    : randomMenus;

  // --- Handlers ---
  const handleCustomerNameChange = (e) => {
    const val = e.target.value;
    setCustomerName(val);
    localStorage.setItem("customerName", val);
  };

  const handleCloseAllModals = () => {
    setActiveModal(null);
    setSelectedProduct(null);
  };

  const handleOpenCart = () => setActiveModal("cart");
  const handleOpenNotif = () => setActiveModal("notif");
  const handleOpenAccount = () => setActiveModal("account");

  const handleOpenDetail = (menu) => {
    setSelectedProduct(menu);
    setActiveModal("detail");
    const isDrink =
      menu.category === "Coffee" || menu.category === "Non-Coffee";
    setCustomization({
      variant: isDrink ? "Normal Sugar" : "Sedang",
      size: "Regular",
      toppings: [],
      notes: "",
      quantity: 1,
    });
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateNotes = (index, value) => {
    const newCart = [...cart];
    newCart[index].notes = value;
    setCart(newCart);
  };

  const calculateTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Tolong masukkan nama pemesan terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            menu_id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || "",
          })),
          total: calculateTotal(),
          customer_name: customerName.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Pesanan berhasil dikirim ke dapur!");
        setCart([]);
        handleCloseAllModals();
      } else {
        toast.error(`Gagal memesan: ${result.message}`);
      }
    } catch (error) {
      console.error("Error checkout:", error);
      toast.error("Terjadi kesalahan koneksi saat mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c1f2e] font-sans pb-32 relative">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        theme="light"
      />

      <VoucherButton
        onClick={() => {
          setIsVoucherModalOpen(true);
          setHasNewVoucher(false);
        }}
        hasNewVoucher={hasNewVoucher}
        isLoggedIn={isLoggedIn}
      />
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        isLoggedIn={isLoggedIn}
        onNavigateLogin={() => {
          setIsVoucherModalOpen(false);
          handleOpenAccount();
        }}
      />
      {/* 1. BANNER PROMO FULL-BLEED (Mentok Kiri-Kanan Tanpa Jarak) */}
      {/* 1. PROMO CAROUSEL (Sudah full-width & ada lengkungan bawah otomatis) */}
      <PromoCarousel />

      {/* 2. GREETING CARD MENIMPA LENGKUNGAN */}
      <div className="px-4 sm:px-6 -mt-12 sm:-mt-16">
        <GreetingCard
          menus={menus}
          onSelectMenu={handleOpenDetail}
          customerName={customerName}
          onCustomerNameChange={handleCustomerNameChange}
        />
      </div>

      {/* 3. KONTEN UTAMA DI BAWAHNYA (Diberi padding lagi agar rapi) */}
      <div className="px-4 sm:px-6 pt-6">
        {/* FILTER KATEGORI */}
        <div className="relative flex items-center mb-6">
          <div className="relative mb-0 w-full select-none">
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex overflow-x-auto gap-2 scrollbar-none py-1 px-1 w-full items-center cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === cat.key ? null : cat.key,
                    )
                  }
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer flex-shrink-0 ${
                    activeCategory === cat.key
                      ? "bg-[#5c1f2e] text-white shadow-md scale-105"
                      : "bg-white text-[#5c1f2e] border border-[#e8ded2] hover:bg-[#e8ded2]/40"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold opacity-60 mb-4">
          {activeCategory
            ? `Menampilkan kategori: ${activeCategory}`
            : "Rekomendasi untuk Anda"}
        </p>

        {/* GRID MENU */}
        <div
          onMouseDown={handleGridMouseDown}
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 select-none ${
            isPageDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu, index) => (
              <div
                key={menu._id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                onClick={() => {
                  if (
                    menu.stock !== undefined &&
                    menu.stock !== -1 &&
                    menu.stock <= 0
                  ) {
                    toast.info(`Maaf, stok untuk "${menu.name}" sedang habis.`);
                    return;
                  }
                  handleCardClick(menu);
                }}
                className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e8ded2]/60 flex flex-col justify-between group ${
                  menu.stock !== undefined &&
                  menu.stock !== -1 &&
                  menu.stock <= 0
                    ? "opacity-75 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div>
                  <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                    <img
                      src={
                        menu.image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      }
                      alt={menu.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        menu.stock !== undefined &&
                        menu.stock !== -1 &&
                        menu.stock <= 0
                          ? "grayscale"
                          : "group-hover:scale-105"
                      }`}
                      draggable={false}
                    />
                    {/* Badge Habis / Status Stok di atas gambar */}
                    {menu.stock !== undefined &&
                    menu.stock !== -1 &&
                    menu.stock < 1 ? (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-3.5 py-1.5 bg-red-600/90 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-lg">
                          Stok Habis
                        </span>
                      </div>
                    ) : menu.stock !== undefined &&
                      menu.stock !== -1 &&
                      menu.stock <= 5 ? (
                      <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500 text-white rounded-md shadow-xs">
                        Sisa {menu.stock}
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wider bg-[#e8ded2]/50 text-[#5c1f2e] px-2.5 py-1 rounded-md font-semibold">
                        {menu.category}
                      </span>
                      {/* Label Status Stok */}
                      {menu.stock !== undefined && menu.stock !== -1 ? (
                        menu.stock >= 1 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Menu Tersedia
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">
                            Stok Habis
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-medium text-stone-400">
                          Stok Tersedia
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold font-serif mt-2 mb-1 line-clamp-1">
                      {menu.name}
                    </h3>
                    <p className="text-base font-bold text-[#5c1f2e]">
                      Rp {menu.price?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {menu.stock !== undefined &&
                  menu.stock !== -1 &&
                  menu.stock < 1 ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-stone-200 text-stone-400 rounded-2xl font-semibold cursor-not-allowed shadow-none text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Stok Habis</span>
                    </button>
                  ) : (
                    <button className="w-full py-2.5 bg-[#5c1f2e] text-white rounded-2xl font-semibold hover:bg-[#431420] transition-colors duration-200 cursor-pointer shadow-sm active:scale-95 text-xs flex items-center justify-center gap-1.5">
                      <span>Tambah ke Keranjang</span>
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-stone-500">
                Belum ada menu untuk kategori <strong>{activeCategory}</strong>{" "}
                di database.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL & KUSTOMISASI PRODUK */}
      {activeModal === "detail" && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseAllModals}
          onAddToCart={(newItem) => {
            const existingIndex = cart.findIndex(
              (item) =>
                item._id === newItem._id && item.notes === newItem.notes,
            );

            if (existingIndex > -1) {
              const newCart = [...cart];
              newCart[existingIndex].quantity += newItem.quantity;
              setCart(newCart);
            } else {
              setCart([...cart, newItem]);
            }

            handleCloseAllModals();
            toast.success("Berhasil ditambahkan ke keranjang!", {
              style: {
                background: "#fcf9f5",
                color: "#5c1f2e",
                fontWeight: "bold",
              },
            });
          }}
        />
      )}

      {/* HALAMAN AKUN / PROFIL & RIWAYAT PESANAN */}
      {activeModal === "account" && (
        <AccountPage
          isOpen={activeModal === "account"}
          onClose={() => setActiveModal(null)}
          onReorder={(reorderItems) => {
            setCart((prevCart) => [...prevCart, ...reorderItems]);
          }}
        />
      )}

      {/* HALAMAN NOTIFIKASI */}
      <NotificationModal isOpen={isNotifOpen} onClose={handleCloseAllModals} />

      {/* CART DRAWER */}
      <div className="relative z-40">
        <CartDrawer
          isOpen={isCartOpen}
          onClose={handleCloseAllModals}
          cart={cart}
          customerName={customerName}
          onCustomerNameChange={handleCustomerNameChange}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* BOTTOM NAVIGATION */}
      {/* BOTTOM NAVIGATION (Disembunyikan otomatis saat mode Detail Produk aktif) */}
      {activeModal !== "detail" && (
        <div className="relative z-50">
          <BottomNav
            cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onOpenCart={handleOpenCart}
            onOpenNotif={handleOpenNotif}
            onOpenAccount={handleOpenAccount}
            onGoHome={handleCloseAllModals}
            activeMenu={activeModal || "home"}
          />
        </div>
      )}
    </div>
  );
}
