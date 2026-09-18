import React, { useState } from "react";
import { Lock, Mail, KeyRound, X, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../services/socket";

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const token = data.token;
        const role = data.user?.role || "customer";

        localStorage.setItem("userToken", token);
        localStorage.setItem("userName", data.user?.name || "Admin");
        localStorage.setItem("userRole", role);

        if (role === "admin") {
          onLoginSuccess(token, data.user);
          onClose();
        } else if (role === "cashier") {
          window.location.href = "/cashier";
        } else {
          window.location.href = "/menu";
        }
      } else {
        setError(data.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#e8ded2] relative animate-zoom-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#5c1f2e] p-1 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#5c1f2e]/10 text-[#5c1f2e] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#5c1f2e]">
            Autentikasi Akun Admin
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Masuk dengan kredensial staf/admin untuk mengelola data POS
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vynacoffee.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs hover:bg-[#431420] transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Memverifikasi Kredensial..." : "Masuk sebagai Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
