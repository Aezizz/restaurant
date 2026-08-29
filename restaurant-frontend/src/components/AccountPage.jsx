import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000";

export default function AccountPage({ isOpen, onClose, onReorder }) {
  if (!isOpen) return null;

  const [token, setToken] = useState(localStorage.getItem("userToken") || "");
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Tab navigasi di dalam akun: 'history' atau 'settings'
  const [activeTab, setActiveTab] = useState("history");

  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // State untuk Update Profil / Ganti Password
  const [profileData, setProfileData] = useState({
    name: userName,
    phone: "",
    currentPassword: "",
    newPassword: "",
  });
  // State untuk Modal / Form Rating
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoadingOrders(true);

    fetch(`${API_URL}/api/orders/my-history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setOrderHistory(result.data || []);
        }
      })
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoadingOrders(false));
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("🔍 ISI OBJECT LOGIN DARI BACKEND:", result); // <-- Tambahkan baris ini// 🔍 Debugging biar kelihatan isinya di Console

      if (response.ok) {
        if (isLoginMode) {
          // 🔑 Ambil string tokennya secara spesifik dari properti objek backend
          const tokenValue =
            result.token || result.accessToken || result.data?.token;
          const nameValue = result.user?.name || result.name || "Customer";

          localStorage.setItem("userToken", tokenValue);
          localStorage.setItem("userName", nameValue);

          setToken(tokenValue);
          setUserName(nameValue);
          toast.success("Berhasil masuk! 🎉");
        } else {
          toast.success("Registrasi berhasil, silakan masuk! ✨");
          setIsLoginMode(true);
        }
      } else {
        toast.error(result.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    setToken("");
    setUserName("");
    toast.info("Berhasil keluar akun.");
  };
  const handleOpenRatingModal = (order) => {
    setSelectedOrderForRating(order);
    setRatingScore(order.review?.rating || 5);
    setRatingComment(order.review?.comment || "");
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedOrderForRating) return;
    setSubmittingRating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${selectedOrderForRating._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: ratingScore,
            comment: ratingComment,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Terima kasih! Ulasan berhasil disimpan ⭐");
        setRatingModalOpen(false);
        // Refresh riwayat pesanan
        setOrderHistory(
          orderHistory.map((ord) =>
            ord._id === selectedOrderForRating._id ? result.data : ord,
          ),
        );
      } else {
        toast.error(result.message || "Gagal menyimpan ulasan.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Fungsi Reorder: Memasukkan item pesanan lama kembali ke keranjang
  const handleReorder = (orderItems) => {
    if (onReorder) {
      onReorder(orderItems); // Mengirim item ke state cart utama
    }
    toast.success(
      "Menu dari pesanan sebelumnya berhasil dimasukkan ke keranjang! 🛒",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 pb-24 md:pb-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#e8ded2] pb-4 mb-5">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#5c1f2e]">
                {token
                  ? "Akun & Riwayat"
                  : isLoginMode
                    ? "Masuk Akun"
                    : "Daftar Akun"}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {token ? `Halo, ${userName}!` : "Vyna Coffee & Restaurant"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-stone-100 w-8 h-8 rounded-full flex items-center justify-center border border-[#e8ded2]"
            >
              ✕
            </button>
          </div>

          {!token ? (
            /* ================= FORM LOGIN / REGISTER ================= */
            <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
              {!isLoginMode && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap..."
                    className="w-full text-xs p-3 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="nama@email.com"
                  className="w-full text-xs p-3 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Kata Sandi (Password)
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full text-xs p-3 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs hover:bg-[#431420] transition-colors cursor-pointer shadow-md mt-4 flex items-center justify-center"
              >
                {loading
                  ? "Memproses..."
                  : isLoginMode
                    ? "Masuk 🚀"
                    : "Daftar Sekarang ✨"}
              </button>

              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-xs text-stone-600 hover:text-[#5c1f2e] font-semibold cursor-pointer transition-colors"
                >
                  {isLoginMode
                    ? "Belum punya akun? Daftar di sini"
                    : "Sudah punya akun? Masuk di sini"}
                </button>
              </div>
            </form>
          ) : (
            /* ================= DASHBOARD USER (PROFIL, RIWAYAT, REORDER) ================= */
            <div className="space-y-5">
              {/* Ringkasan Profil & Logout */}
              <div className="bg-[#fcf9f5] p-4 rounded-2xl border border-[#e8ded2] shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Status Member
                  </p>
                  <p className="text-sm font-bold text-[#5c1f2e]">{userName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  Keluar 🚪
                </button>
              </div>

              {/* Sub-Tabs Menu Akun */}
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-white text-[#5c1f2e] shadow-sm"
                      : "text-stone-500"
                  }`}
                >
                  📜 Riwayat Pesanan
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-white text-[#5c1f2e] shadow-sm"
                      : "text-stone-500"
                  }`}
                >
                  ⚙️ Pengaturan Akun
                </button>
              </div>

              {/* TAB 1: RIWAYAT & REORDER */}
              {activeTab === "history" && (
                <div>
                  {loadingOrders ? (
                    <p className="text-center text-xs text-stone-400 py-6">
                      Memuat riwayat...
                    </p>
                  ) : orderHistory.length > 0 ? (
                    <div className="space-y-3">
                      {orderHistory.map((order, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-2xl border border-[#e8ded2] shadow-sm space-y-3"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                            <span className="text-xs font-bold text-[#5c1f2e]">
                              Pesanan #{order.queue_number || "---"}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-amber-100 text-amber-800">
                              {/* Tombol Ulasan / Rating */}
                              {order.status === "completed" && (
                                <button
                                  onClick={() => handleOpenRatingModal(order)}
                                  className="px-3 py-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl hover:bg-amber-200 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                                >
                                  <span>
                                    {order.review?.rating
                                      ? `⭐ ${order.review.rating}/5 Ulas`
                                      : "Beri Ulasan ⭐"}
                                  </span>
                                </button>
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 space-y-1">
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex justify-between">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>
                                  Rp{" "}
                                  {(item.price * item.quantity).toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-stone-100 pt-2 flex justify-between items-center">
                            <span className="font-bold text-xs text-[#5c1f2e]">
                              Total: Rp {order.total?.toLocaleString("id-ID")}
                            </span>
                            {/* Tombol Reorder / Pesan Lagi */}
                            <button
                              onClick={() => handleReorder(order.items)}
                              className="px-3 py-1.5 bg-[#5c1f2e] text-white text-[11px] font-bold rounded-xl hover:bg-[#431420] transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <span>Pesan Lagi 🛒</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-[#e8ded2]">
                      <span className="text-3xl block mb-2">📦</span>
                      <p className="text-xs text-stone-400">
                        Belum ada riwayat pesanan tercatat di akun ini.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PENGATURAN AKUN & GANTI PASSWORD */}
              {activeTab === "settings" && (
                <div className="bg-white p-4 rounded-2xl border border-[#e8ded2] shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Ubah Informasi & Keamanan
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full text-xs p-2.5 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Password Baru (Opsional)
                    </label>
                    <input
                      type="password"
                      placeholder="Kosongkan jika tidak diubah"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full text-xs p-2.5 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                    />
                  </div>

                  <button
                    onClick={() =>
                      toast.info(
                        "Fitur pembaruan profil akan segera disinkronkan ke backend!",
                      )
                    }
                    className="w-full py-2.5 bg-stone-800 text-white rounded-xl font-bold text-xs hover:bg-stone-900 transition-colors cursor-pointer"
                  >
                    Simpan Perubahan 💾
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-stone-400 text-[11px] pt-4 border-t border-[#e8ded2]">
          Vyna Coffee & Restaurant • Member Area
        </div>
      </div>
      {/* MODAL POPUP RATING & ULASAN */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-[#e8ded2]">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-[#5c1f2e]">
                Beri Ulasan Pesanan #{selectedOrderForRating?.queue_number}
              </h3>
              <button
                onClick={() => setRatingModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pilihan Bintang */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingScore(star)}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                    star <= ratingScore ? "text-amber-400" : "text-stone-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-semibold text-stone-600">
              {ratingScore === 5
                ? "Sempurna! Luar biasa 🤩"
                : ratingScore === 4
                  ? "Puas banget! 👍"
                  : ratingScore === 3
                    ? "Cukup baik 🙂"
                    : ratingScore === 2
                      ? "Kurang memuaskan 🙁"
                      : "Buruk 😞"}
            </p>

            {/* Kolom Komentar / Kesan Pesan */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Kesan & Pesan (Opsional)
              </label>
              <textarea
                rows="3"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Bagaimana rasa kopinya? Tulis ulasanmu di sini..."
                className="w-full text-xs p-3 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] resize-none"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submittingRating}
                onClick={submitRating}
                className="flex-1 py-2.5 bg-[#5c1f2e] text-white rounded-xl font-bold text-xs hover:bg-[#431420] transition-colors cursor-pointer shadow-sm"
              >
                {submittingRating ? "Menyimpan..." : "Kirim Ulasan 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
