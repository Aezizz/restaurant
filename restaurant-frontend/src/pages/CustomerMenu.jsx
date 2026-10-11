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
import { isAuthenticated, clearAuthSession, getAuthToken } from "../utils/auth";

const RANDOM_DISPLAY_COUNT = 8;

const CATEGORIES = [
  { key: "Rekomendasi", label: "Rekomendasi" },
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

  // Status autentikasi & identitas pengguna
  const isAuthInitial = isAuthenticated();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthInitial);
  const [userName, setUserName] = useState(
    isAuthInitial ? localStorage.getItem("userName") || "" : "",
  );
  const [customerName, setCustomerName] = useState(
    isAuthInitial ? localStorage.getItem("customerName") || "" : "",
  );

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [hasNewVoucher, setHasNewVoucher] = useState(true); // True kalau ada voucher baru
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

  // --- Validasi & Sinkronisasi Sesi Autentikasi Real-Time ---
  useEffect(() => {
    const syncAuth = () => {
      const valid = isAuthenticated();
      if (!valid) {
        // Jika token tidak valid / sudah expired
        clearAuthSession();
        setIsLoggedIn(false);
        setUserName("");
        setCustomerName("");
      } else {
        setIsLoggedIn(true);
        setUserName(localStorage.getItem("userName") || "");
        setCustomerName(localStorage.getItem("customerName") || "");
      }
    };

    // Validasi langsung saat komponen dimuat
    syncAuth();

    // Dengarkan perubahan localStorage atau saat jendela kembali aktif (focus)
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

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

  // Daftar produk rekomendasi (berdasarkan flag isRecommended atau fallback produk unggulan/teratas yang tersedia)
  const recommendedMenus = useMemo(() => {
    if (menus.length === 0) return [];
    // 1. Cek apakah ada menu dengan properti isRecommended / is_recommended
    const explicitlyRecommended = menus.filter(
      (menu) => menu.isRecommended === true || menu.is_recommended === true
    );
    if (explicitlyRecommended.length > 0) {
      return explicitlyRecommended;
    }
    // 2. Fallback kurasi: ambil produk unggulan yang ada stoknya (kopi andalan & makanan berat teratas)
    const inStock = menus.filter(
      (menu) => menu.stock === undefined || menu.stock === -1 || menu.stock > 0
    );
    return inStock.slice(0, RANDOM_DISPLAY_COUNT);
  }, [menus]);

  const filteredMenus = useMemo(() => {
    if (!activeCategory) {
      return randomMenus;
    }
    if (activeCategory === "Rekomendasi") {
      return recommendedMenus;
    }
    return menus.filter((menu) => menu.category === activeCategory);
  }, [activeCategory, menus, randomMenus, recommendedMenus]);

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
          userName={userName}
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

        {/* GRID / DAFTAR MENU (Horizontal Compact List) */}
        <div
          onMouseDown={handleGridMouseDown}
          className={`grid grid-cols-1 md:grid-cols-2 gap-3.5 select-none ${
            isPageDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu, index) => {
              const isOutOfStock =
                menu.stock !== undefined &&
                menu.stock !== -1 &&
                menu.stock < 1;

              return (
                <div
                  key={menu._id}
                  data-aos="fade-up"
                  data-aos-delay={index * 30}
                  onClick={() => {
                    if (isOutOfStock) {
                      toast.info(`Maaf, stok untuk "${menu.name}" sedang habis.`);
                      return;
                    }
                    handleCardClick(menu);
                  }}
                  className={`bg-white rounded-2xl p-3 border border-[#e8ded2]/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-row items-center justify-between gap-3 group relative overflow-hidden ${
                    isOutOfStock
                      ? "opacity-70 cursor-not-allowed bg-stone-50"
                      : "cursor-pointer hover:border-[#5c1f2e]/40 hover:bg-[#fffdfa]"
                  }`}
                >
                  {/* SISI KIRI: Gambar Produk Ringkas Proporsional */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-[#e8ded2]/60">
                    <img
                      src={
                        menu.image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      }
                      alt={menu.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isOutOfStock ? "grayscale" : "group-hover:scale-105"
                      }`}
                      draggable={false}
                    />

                    {/* Badge Overlay jika Stok Habis */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-1">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-red-600/90 px-1.5 py-0.5 rounded shadow">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SISI TENGAH: Info Produk (Kategori/Status, Nama, Deskripsi, Harga) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    {/* Baris Kategori & Status Stok */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider bg-[#e8ded2]/60 text-[#5c1f2e] px-2 py-0.5 rounded-md font-semibold">
                        {menu.category}
                      </span>

                      {/* Label Status Stok: Hanya menampilkan 'Menu Tersedia' atau 'Stok Habis' tanpa angka stok */}
                      {isOutOfStock ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                          Stok Habis
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Menu Tersedia
                        </span>
                      )}
                    </div>

                    {/* Nama Produk */}
                    <h3 className="text-sm sm:text-base font-bold font-serif text-stone-800 line-clamp-1 group-hover:text-[#5c1f2e] transition-colors">
                      {menu.name}
                    </h3>

                    {/* Deskripsi Singkat */}
                    {menu.description && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 leading-snug">
                        {menu.description}
                      </p>
                    )}

                    {/* Harga Produk */}
                    <p className="text-xs sm:text-sm font-bold text-[#5c1f2e] mt-1.5">
                      Rp {menu.price?.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* SISI KANAN: Tombol / Aksi Pilih Menu Ringkas */}
                  <div className="flex-shrink-0 flex items-center pr-1">
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-200 text-stone-400 rounded-xl font-bold text-[11px] cursor-not-allowed"
                      >
                        Habis
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(menu);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-[#5c1f2e] text-white rounded-xl text-xs font-semibold hover:bg-[#431420] transition-colors shadow-xs active:scale-95 cursor-pointer"
                        title="Pilih & Atur Kustomisasi Menu"
                      >
                        <span className="hidden sm:inline">Pilih</span>
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-[#e8ded2]">
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
