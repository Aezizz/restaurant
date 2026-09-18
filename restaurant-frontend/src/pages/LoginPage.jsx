import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Mail,
  KeyRound,
  Lock,
  User,
  Coffee,
  ArrowRight,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../services/socket";
import {
  isAuthenticated,
  getUserRole,
  saveAuthSession,
  getRedirectPathByRole,
} from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cek jika sudah terautentikasi sebelumnya -> langsung arahkan ke rute role
  useEffect(() => {
    if (isAuthenticated()) {
      const currentRole = getUserRole();
      const targetPath = getRedirectPathByRole(currentRole);
      navigate(targetPath, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (isLoginMode) {
          const token = data.token;
          const user = data.user || {};
          const role = user.role || "customer";
          const name = user.name || "Pengguna";

          // Simpan sesi autentikasi dan role
          saveAuthSession({ token, name, role });
          localStorage.setItem("customerName", name);

          toast.success(`Selamat datang, ${name}!`);

          // 🚀 ALUR REDIRECT STRICT POST-LOGIN:
          // Admin -> /admin
          // Cashier -> /cashier
          // Customer -> /menu
          const targetUrl = getRedirectPathByRole(role);
          navigate(targetUrl, { replace: true });
        } else {
          toast.success("Registrasi berhasil! Silakan masuk dengan akun Anda.");
          setIsLoginMode(true);
          setFormData((prev) => ({ ...prev, password: "" }));
        }
      } else {
        setErrorMessage(data.message || "Gagal memproses permintaan.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage("Gagal terhubung ke server backend. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center p-4 selection:bg-[#5c1f2e] selection:text-white">
      <ToastContainer position="top-center" autoClose={3000} theme="light" />

      <div className="w-full max-w-md bg-white border border-[#e8ded2] rounded-3xl shadow-xl p-8 relative overflow-hidden">
        {/* Dekorasi Aksen Vyna Coffee */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5c1f2e]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#5c1f2e] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-7 h-7 text-amber-200" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#5c1f2e] tracking-tight">
            Vyna Coffee POS
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isLoginMode
              ? "Masuk untuk mengakses layanan sesuai peran Anda"
              : "Daftar akun pelanggan baru"}
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Login / Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Kata Sandi
              </label>
              {isLoginMode && (
                <Link
                  to="/reset-password"
                  className="text-[11px] font-semibold text-[#5c1f2e] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              )}
            </div>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#5c1f2e] text-white rounded-xl font-bold text-xs hover:bg-[#431420] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>{isLoginMode ? "Masuk ke Sistem" : "Daftar Sekarang"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Login / Register */}
        <div className="mt-6 text-center text-xs text-stone-500">
          {isLoginMode ? (
            <span>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setErrorMessage("");
                }}
                className="font-bold text-[#5c1f2e] hover:underline cursor-pointer"
              >
                Daftar Pelanggan
              </button>
            </span>
          ) : (
            <span>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setErrorMessage("");
                }}
                className="font-bold text-[#5c1f2e] hover:underline cursor-pointer"
              >
                Masuk di Sini
              </button>
            </span>
          )}
        </div>

        {/* Separator & Navigasi ke Menu Publik */}
        <div className="mt-6 pt-5 border-t border-[#e8ded2] text-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#5c1f2e] transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-50"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Lihat Menu Restoran (Tamu / Publik)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
