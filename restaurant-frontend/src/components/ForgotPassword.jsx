import React, { useState } from "react";
import { KeyRound, Send } from "lucide-react";
import { API_BASE_URL } from "../services/socket";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center p-4 font-sans text-[#5c1f2e]">
      <div className="bg-white p-8 rounded-3xl border border-[#e8ded2] shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-xl font-bold font-serif text-center flex items-center justify-center gap-2">
          <span>Lupa Password?</span>
          <KeyRound className="w-5 h-5 text-[#5c1f2e]" />
        </h2>
        <p className="text-xs text-stone-500 text-center">
          Masukkan email yang terdaftar, kami akan mengirimkan tautan untuk
          mereset password kamu.
        </p>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Email
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
            className="w-full py-3.5 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#431420] transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Mengirim..."
            ) : (
              <>
                <span>Kirim Tautan Reset</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
