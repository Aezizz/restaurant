import React, { useState, useEffect, useRef, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Pastikan path import komponen di bawah sesuai dengan struktur folder lu
import AccountPage from "../components/AccountPage";
import BottomNav from "../components/BottomNav";
import PromoCarousel from "../components/PromoCarousel";
import ProductDetailModal from "../components/ProductDetailModal";
import NotificationModal from "../components/NotificationModal";
import CartDrawer from "../components/CartDrawer";
import { socket, API_BASE_URL as API_URL } from "../services/socket"; // Sesuaikan path socket lu
import GreetingCard from "../components/GreetingCard";
const RANDOM_DISPLAY_COUNT = 8;

export default function CustomerMenu() {
  const scrollContainerRef = useRef(null);

  const [menus, setMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [tableNumber, setTableNumber] = useState(
    localStorage.getItem("tableNumber") || "",
  );
  const [cart, setCart] = useState([]);
  // Single active modal state: 'cart' | 'notif' | 'detail' | null
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const isCartOpen = activeModal === "cart";
  const isNotifOpen = activeModal === "notif";
  // Tambahkan fungsi ini di dalam komponen CustomerMenu (misal di bawah deklarasi state lainnya)
  const handleSelectCategory = (categoryName) => {
    setActiveCategory(categoryName);
  };
  // State untuk Modal Detail Produk & Kustomisasi
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customization, setCustomization] = useState({
    variant: "",
    size: "Regular",
    toppings: [],
    notes: "",
    quantity: 1,
  });

  // State untuk logika Click & Drag Mouse pada wadah kategori (horizontal)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // State + ref untuk logika Click & Drag Mouse pada grid menu (vertikal, "grab to pan")
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollY, setDragStartScrollY] = useState(0);
  const dragDistanceRef = useRef(0);

  // State + ref untuk drag-scroll di DALAM modal detail produk
  const modalContentRef = useRef(null);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [modalDragStartY, setModalDragStartY] = useState(0);
  const [modalDragStartScrollTop, setModalDragStartScrollTop] = useState(0);

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // --- Drag horizontal untuk wadah kategori (chip) ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- Drag vertikal "grab to pan" untuk grid menu ---
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

    const handleWindowMouseUp = () => {
      setIsPageDragging(false);
    };

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

  // --- Drag vertikal untuk konten DALAM modal detail produk ---
  const handleModalMouseDown = (e) => {
    if (e.target.closest("button, input")) return;
    setIsModalDragging(true);
    setModalDragStartY(e.pageY);
    setModalDragStartScrollTop(modalContentRef.current.scrollTop);
  };

  useEffect(() => {
    if (!isModalDragging) return;

    const handleModalMouseMove = (e) => {
      if (!modalContentRef.current) return;
      const deltaY = e.pageY - modalDragStartY;
      modalContentRef.current.scrollTop = modalDragStartScrollTop - deltaY;
    };

    const handleModalMouseUp = () => {
      setIsModalDragging(false);
    };

    window.addEventListener("mousemove", handleModalMouseMove);
    window.addEventListener("mouseup", handleModalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleModalMouseMove);
      window.removeEventListener("mouseup", handleModalMouseUp);
    };
  }, [isModalDragging, modalDragStartY, modalDragStartScrollTop]);

  useEffect(() => {
    fetch(`${API_URL}/api/menus`)
      .then((res) => res.json())
      .then((result) => setMenus(result.data || []))
      .catch((err) => console.error("Error fetching menus:", err));
  }, []);

  useEffect(() => {
    const isModalOpen = activeModal !== null;
    if (!isModalOpen) return;

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

  useEffect(() => {
    socket.on("order-ready", (data) => {
      if (Number(data.table_number) === Number(tableNumber)) {
        toast.success(
          `🔔 Pesanan Siap! Yeay! Pesanan untuk Meja #${data.table_number} sudah siap diambil di kasir! ☕🚀`,
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
  }, [tableNumber]);

  const categories = [
    { key: "Makanan Berat", label: "Makanan Berat" },
    { key: "Makanan Ringan", label: "Makanan Ringan" },
    { key: "Coffee", label: "Coffee" },
    { key: "Non-Coffee", label: "Non-Coffee" },
  ];

  const randomMenus = useMemo(() => {
    if (menus.length === 0) return [];
    const shuffled = [...menus].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, RANDOM_DISPLAY_COUNT);
  }, [menus]);

  const filteredMenus = activeCategory
    ? menus.filter((menu) => menu.category === activeCategory)
    : randomMenus;

  const handleTableChange = (e) => {
    const val = e.target.value;
    setTableNumber(val);
    localStorage.setItem("tableNumber", val);
  };

  const handleCloseAllModals = () => {
    setActiveModal(null);
    setSelectedProduct(null);
  };

  const handleOpenCart = () => {
    setActiveModal("cart");
  };

  const handleOpenNotif = () => {
    setActiveModal("notif");
  };

  const handleOpenAccount = () => {
    setActiveModal("account");
  };

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
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const updateNotes = (index, value) => {
    const newCart = [...cart];
    newCart[index].notes = value;
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }
    if (!tableNumber) {
      toast.error("Tolong masukkan nomor meja terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/orders`, {
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
          table_number: Number(tableNumber),
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
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c1f2e] p-4 md:p-10 font-sans pb-32 relative">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        theme="light"
      />

      {/* HEADER & NOMOR MEJA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#e8ded2] pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-wide">
            Vyna Coffee & Restaurant
          </h1>
          {/* Greeting cards */}
          <GreetingCard menus={menus} onSelectMenu={handleOpenDetail} />
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-[#e8ded2]">
          <span className="text-sm font-semibold">Nomor Meja:</span>
          <input
            type="number"
            min="1"
            max="100"
            value={tableNumber}
            onChange={handleTableChange}
            placeholder="No. Meja"
            className="w-20 px-3 py-1.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
          />
        </div>
      </div>

      {/* BANNER advertisement */}
      <PromoCarousel />

      {/* FILTER KATEGORI */}
      <div className="relative flex items-center mb-8">
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
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() =>
                  setActiveCategory(activeCategory === cat.key ? null : cat.key)
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

      <p className="text-xs font-semibold opacity-60 mb-4 -mt-4">
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
              onClick={() => handleCardClick(menu)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e8ded2]/60 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      menu.image_url ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                    }
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    draggable={false}
                  />
                </div>

                <div className="p-5">
                  <span className="text-xs uppercase tracking-wider bg-[#e8ded2]/50 text-[#5c1f2e] px-2.5 py-1 rounded-md font-semibold">
                    {menu.category}
                  </span>
                  <h3 className="text-lg font-bold font-serif mt-2 mb-1">
                    {menu.name}
                  </h3>
                  <p className="text-base font-bold text-[#5c1f2e]">
                    Rp {menu.price?.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button className="w-full py-2.5 bg-[#5c1f2e] text-white rounded-2xl font-semibold hover:bg-[#431420] transition-colors duration-200 cursor-pointer shadow-sm active:scale-95 text-xs">
                  Pilih Menu 🔍
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-stone-500">
              Belum ada menu untuk kategori <strong>{activeCategory}</strong> di
              database.
            </p>
          </div>
        )}
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
            toast.success("Berhasil ditambahkan ke keranjang! 🛒", {
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
            setCart((prevCart) => {
              // Gabungkan atau tambahkan item reorder ke keranjang
              return [...prevCart, ...reorderItems];
            });
          }}
        />
      )}
      {/* HALAMAN NOTIFIKASI */}
      <NotificationModal isOpen={isNotifOpen} onClose={handleCloseAllModals} />

      {/* CART MODAL / DRAWER (Z-Index di bawah BottomNav agar BottomNav tetap stay di depan) */}
      <div className="relative z-40">
        <CartDrawer
          isOpen={isCartOpen}
          onClose={handleCloseAllModals}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* BOTTOM NAVIGATION BAR (Z-Index 50 agar selalu stay paling depan dan bisa diklik) */}
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
    </div>
  );
}
