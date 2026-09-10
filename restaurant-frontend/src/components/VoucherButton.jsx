import React from "react";
import { Ticket } from "lucide-react";

export default function VoucherButton({ onClick, hasNewVoucher, isLoggedIn }) {
  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={onClick}
        className="relative bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-[#e8ded2] text-[#5c1f2e] hover:bg-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        title="Voucher Diskon"
      >
        {/* Ikon Voucher / Diskon */}
        <Ticket className="w-5 h-5 text-[#5c1f2e]" />

        {/* Badge Notifikasi Merah jika ada voucher baru */}
        {hasNewVoucher && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
            !
          </span>
        )}
      </button>
    </div>
  );
}
