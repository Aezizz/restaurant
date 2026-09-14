import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ShoppingBag,
  User,
  Plus,
  Minus,
  Send,
  ArrowLeft,
  Search,
} from "lucide-react";
import { socket, API_BASE_URL } from "../services/socket";

export default function CashierOrderPage() {
  const [menus, setMenus] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch daftar menu dari backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menus`)
      .then((res) => res.json())
      .then((result) => setMenus(result.data || []))
      .catch((err) => console.error("Error fetching menus:", err));
  }, []);

  // Filter menu berdasarkan input search bar
  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Tambah menu ke keranjang kasir
  const handleAddToCart = (menu) => {
    const existingIndex = cart.findIndex((item) => item._id === menu._id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...menu, quantity: 1, notes: "" }]);
    }
  };

  // Update jumlah item
  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  // Hitung total harga
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Kirim pesanan kasir ke dapur via API
  const handleCashierCheckout = async () => {
    if (!customerName.trim()) {
      toast.error("Nama pemesan wajib diisi!");
      return;
    }
    if (cart.length === 0) {
      toast.error("Keranjang kasir masih kosong!");
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
            notes: item.notes || "Walk-in Kasir",
          })),
          total: calculateTotal(),
          customer_name: customerName.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Pesanan untuk ${customerName} berhasil dikirim ke dapur! 🚀`,
        );
        setCart([]);
        setCustomerName("");
      } else {
        toast.error(`Gagal membuat pesanan: ${result.message}`);
      }
    } catch (error) {
      console.error("Error cashier checkout:", error);
      toast.error("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c1f2e] p-4 md:p-8 font-sans flex flex-col md:flex-row gap-6">
      <ToastContainer position="top-center" autoClose={3000} theme="light" />

      {/* SISI KIRI: KATALOG MENU & SEARCH BAR */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#e8ded2] pb-4">
          <div>
            <h1 className="text-xl font-serif font-bold">
              Vyna POS - Kasir On-the-Spot
            </h1>
            <p className="text-xs text-stone-500">
              Pencatatan pesanan langsung untuk tamu walk-in
            </p>
          </div>
          <a
            href="/kitchen"
            className="flex items-center gap-2 text-xs font-semibold bg-white border border-[#e8ded2] px-4 py-2 rounded-xl hover:bg-[#e8ded2]/40 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Layar Dapur</span>
          </a>
        </div>

        {/* SEARCH BAR INPUT */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu kopi atau makanan..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e8ded2] rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] shadow-xs"
          />
        </div>

        {/* Grid Menu yang sudah ter-filter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[68vh] pr-2">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <div
                key={menu._id}
                onClick={() => handleAddToCart(menu)}
                className="bg-white p-3 rounded-2xl border border-[#e8ded2]/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-28 rounded-xl overflow-hidden bg-stone-100 mb-2">
                    <img
                      src={
                        menu.image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      }
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-xs line-clamp-1">
                    {menu.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#5c1f2e] mt-1">
                    Rp {menu.price?.toLocaleString("id-ID")}
                  </p>
                </div>
                <button className="mt-3 w-full bg-[#5c1f2e]/10 text-[#5c1f2e] group-hover:bg-[#5c1f2e] group-hover:text-white py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-stone-400 text-xs">
              Menu "{searchQuery}" tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* SISI KANAN: PANEL KERANJANG & INPUT NAMA KASIR */}
      <div className="w-full md:w-96 bg-white rounded-3xl p-6 border border-[#e8ded2] shadow-sm flex flex-col justify-between h-[85vh] sticky top-6">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#e8ded2]">
            <ShoppingBag className="w-5 h-5 text-[#5c1f2e]" />
            <h2 className="font-serif font-bold text-base">Pesanan Kasir</h2>
          </div>

          {/* Input Nama Tamu */}
          <div className="my-4">
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Nama Pemesan / Tamu:
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Kak Budi"
                className="w-full pl-9 pr-3 py-2 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
          </div>

          {/* List Item Keranjang */}
          <div className="overflow-y-auto max-h-[38vh] space-y-2 pr-1">
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#fcf9f5] p-3 rounded-xl border border-[#e8ded2]"
                >
                  <div className="flex-1 pr-2">
                    <h4 className="text-xs font-bold line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(idx, -1)}
                      className="p-1 bg-white border border-[#e8ded2] rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, 1)}
                      className="p-1 bg-white border border-[#e8ded2] rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs">
                Belum ada menu yang dipilih.
              </div>
            )}
          </div>
        </div>

        {/* Footer Checkout Kasir */}
        <div className="pt-4 border-t border-[#e8ded2] flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Total Pembayaran:</span>
            <span className="text-[#5c1f2e]">
              Rp {calculateTotal().toLocaleString("id-ID")}
            </span>
          </div>
          <button
            disabled={isSubmitting || cart.length === 0 || !customerName.trim()}
            onClick={handleCashierCheckout}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isSubmitting || cart.length === 0 || !customerName.trim()
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-[#5c1f2e] text-white hover:bg-[#431420] cursor-pointer shadow-sm active:scale-95"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesanan ke Dapur</span>
          </button>
        </div>
      </div>
    </div>
  );
}
