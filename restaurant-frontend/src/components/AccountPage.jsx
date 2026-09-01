import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../services/socket";
import AuthForm from "./account/AuthForm";
import OrderHistoryTab from "./account/OrderHistoryTab";
import AccountSettingsTab from "./account/AccountSettingsTab";
import RatingModal from "./account/RatingModal";

export default function AccountPage({ isOpen, onClose, onReorder }) {
  if (!isOpen) return null;

  const [token, setToken] = useState(localStorage.getItem("userToken") || "");
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    phone: "",
    currentPassword: "",
    newPassword: "",
  });
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoadingOrders(true);

    fetch(`${API_BASE_URL}/api/orders/my-history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setOrderHistory(result.data || []);
      })
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoadingOrders(false));
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        if (isLoginMode) {
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
        `${API_BASE_URL}/api/orders/${selectedOrderForRating._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: ratingScore, comment: ratingComment }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Terima kasih! Ulasan berhasil disimpan ⭐");
        setRatingModalOpen(false);
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

  const handleReorder = (orderItems) => {
    if (onReorder) onReorder(orderItems);
    toast.success(
      "Menu dari pesanan sebelumnya berhasil dimasukkan ke keranjang! 🛒",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 pb-24 md:pb-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
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
            <AuthForm
              isLoginMode={isLoginMode}
              setIsLoginMode={setIsLoginMode}
              formData={formData}
              setFormData={setFormData}
              handleAuthSubmit={handleAuthSubmit}
              loading={loading}
            />
          ) : (
            <div className="space-y-5">
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

              {activeTab === "history" && (
                <OrderHistoryTab
                  loadingOrders={loadingOrders}
                  orderHistory={orderHistory}
                  handleOpenRatingModal={handleOpenRatingModal}
                  handleReorder={handleReorder}
                />
              )}

              {activeTab === "settings" && (
                <AccountSettingsTab
                  profileData={profileData}
                  setProfileData={setProfileData}
                />
              )}
            </div>
          )}
        </div>

        <div className="text-center text-stone-400 text-[11px] pt-4 border-t border-[#e8ded2]">
          Vyna Coffee & Restaurant • Member Area
        </div>
      </div>

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        selectedOrderForRating={selectedOrderForRating}
        ratingScore={ratingScore}
        setRatingScore={setRatingScore}
        ratingComment={ratingComment}
        setRatingComment={setRatingComment}
        submitRating={submitRating}
        submittingRating={submittingRating}
      />
    </div>
  );
}
