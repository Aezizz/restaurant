import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/socket";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  // 1. Handler untuk minta link reset (jika belum punya token di URL)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Masukkan email kamu terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message || "Link reset password telah dikirim ke email!",
        );
        setIsRequested(true);
      } else {
        toast.error(data.message || "Gagal mengirim permintaan.");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handler untuk submit password baru (jika sudah buka link ber-token)
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Semua kolom password wajib diisi!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password berhasil diubah!");
        setTimeout(() => navigate("/"), 2000); // Balik ke halaman login/home setelah 2 detik
      } else {
        toast.error(data.message || "Token tidak valid atau kedaluwarsa.");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center p-4 font-sans text-[#5c1f2e]">
      <div className="bg-white p-8 rounded-3xl border border-[#e8ded2] shadow-xl max-w-md w-full space-y-6">
        {/* Tombol Kembali ke Halaman Utama / Login */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate("/")} // Mengarahkan kembali ke halaman awal/login
            className="text-xs text-stone-500 hover:text-[#5c1f2e] font-semibold cursor-pointer transition-colors"
          >
            ← Kembali ke Beranda / Masuk
          </button>
        </div>
        {/* KONDISI A: Jika user belum klik link dari email (Form Request Email) */}
        {!token ? (
          <div>
            <h2 className="text-xl font-bold font-serif text-center mb-2">
              Lupa Password? 🔑
            </h2>
            <p className="text-xs text-stone-500 text-center mb-6">
              Masukkan email terdaftar, kami akan kirimkan tautan pemulihan ke
              inbox kamu.
            </p>

            {isRequested ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-amber-800">
                  Email Berhasil Dikirim! ✉️
                </p>
                <p className="text-[11px] text-stone-600">
                  Cek kotak masuk atau folder spam di email{" "}
                  <span className="font-semibold">{email}</span>. Klik link di
                  dalam email untuk melanjutkan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs text-[#5c1f2e] focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#431420] transition-colors cursor-pointer shadow-md"
                >
                  {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* KONDISI B: Jika user sudah klik link dari email dan membawa token (Form Password Baru) */
          <div>
            <h2 className="text-xl font-bold font-serif text-center mb-2">
              Buat Password Baru 🔒
            </h2>
            <p className="text-xs text-stone-500 text-center mb-6">
              Silakan masukkan password baru untuk akun Vyna Coffee kamu.
            </p>

            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs text-[#5c1f2e] focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs text-[#5c1f2e] focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#431420] transition-colors cursor-pointer shadow-md"
              >
                {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
