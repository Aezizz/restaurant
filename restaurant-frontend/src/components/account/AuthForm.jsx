import React from "react";
import { Link } from "react-router-dom"; // Pastikan sudah import Link atau gunakan navigasi yang sesuai

export default function AuthForm({
  isLoginMode,
  setIsLoginMode,
  formData,
  setFormData,
  handleAuthSubmit,
  loading,
}) {
  return (
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

        {/* Tombol Lupa Password (Hanya muncul saat mode login) */}
        {isLoginMode && (
          <div className="flex justify-end mt-1.5">
            <Link
              to="/reset-password"
              className="text-[11px] font-semibold text-stone-500 hover:text-[#5c1f2e] transition-colors"
            >
              Lupa kata sandi? 🔑
            </Link>
          </div>
        )}
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
  );
}
