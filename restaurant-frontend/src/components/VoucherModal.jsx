import React from "react";
import { Ticket, X, ArrowRight, ShieldAlert } from "lucide-react"; // Pakai icon lucide biar bersih

export default function VoucherModal({
  isOpen,
  onClose,
  isLoggedIn,
  onNavigateLogin,
}) {
  if (!isOpen) return null;

  const vouchers = [
    {
      code: "VYNAHEMAT30",
      title: "Diskon Spesial Kopi Pagi",
      desc: "Potongan 30% khusus semua menu Coffee.",
      minPurchase: "Min. belanja Rp 30.000",
    },
    {
      code: "VYNAHEMAT30",
      title: "Diskon Spesial Kopi Pagi",
      desc: "Potongan 30% khusus semua menu Coffee.",
      minPurchase: "Min. belanja Rp 30.000",
    },
    {
      code: "VYNAHEMAT30",
      title: "Diskon Spesial Kopi Pagi",
      desc: "Potongan 30% khusus semua menu Coffee.",
      minPurchase: "Min. belanja Rp 30.000",
    },
    {
      code: "NGOPISORE",
      title: "Diskon Teman Santai",
      desc: "Potongan Rp 10.000 untuk Makanan Ringan.",
      minPurchase: "Min. belanja Rp 25.000",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop gelap di belakang */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Konten Modal / Drawer dari Bawah */}
      <div className="absolute inset-x-0 bottom-0 top-auto md:inset-y-0 md:right-0 md:left-auto md:max-w-md w-full bg-[#fcf9f5] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-t md:border-t-0 md:border-l border-[#e8ded2] rounded-t-3xl md:rounded-none max-h-[90vh] md:max-h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#e8ded2] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#5c1f2e]/10 text-[#5c1f2e] rounded-2xl">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#5c1f2e]">
              Voucher & Promo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-[#5c1f2e] rounded-full hover:bg-[#fcf9f5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Konten */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Banner Khusus Belum Login */}
          {!isLoggedIn && (
            <div className="bg-[#5c1f2e] text-white p-5 rounded-3xl shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 text-[#e8ded2]" />
                <p className="text-xs font-medium leading-relaxed">
                  Login agar mendapatkan voucher diskon untuk menghemat
                  pengeluaran ngopi kamu :D
                </p>
              </div>
              <button
                onClick={onNavigateLogin}
                className="w-full bg-white text-[#5c1f2e] py-3 rounded-2xl font-bold hover:bg-[#fcf9f5] transition-colors cursor-pointer text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Masuk / Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* List Voucher */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Voucher Tersedia ({vouchers.length})
            </p>
            {vouchers.map((v, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-[#5c1f2e]/40 transition-colors"
              >
                <div className="absolute right-0 top-0 bg-[#5c1f2e]/10 text-[#5c1f2e] text-[10px] font-bold px-3.5 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                  {v.code}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#5c1f2e] pr-20">
                    {v.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">{v.desc}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-stone-200">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {v.minPurchase}
                  </span>
                  <button
                    disabled={!isLoggedIn}
                    onClick={() =>
                      alert(`Voucher ${v.code} berhasil disalin/digunakan!`)
                    }
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                      isLoggedIn
                        ? "bg-[#5c1f2e] text-white hover:bg-[#431420] cursor-pointer shadow-sm active:scale-95"
                        : "bg-stone-100 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    {isLoggedIn ? "Pakai Voucher" : "Login Diperlukan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-[#e8ded2] text-center">
          <p className="text-[11px] text-stone-400">
            Syarat & ketentuan berlaku untuk setiap penggunaan voucher.
          </p>
        </div>
      </div>
    </div>
  );
}
