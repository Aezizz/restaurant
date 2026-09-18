import React from "react";
import { X, Clock, User, Hash, CheckCircle2, AlertCircle } from "lucide-react";

export default function OrderDetailModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cooking":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#e8ded2] relative animate-zoom-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#5c1f2e] p-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Pesanan */}
        <div className="border-b border-[#e8ded2] pb-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#5c1f2e] text-white text-xs font-bold rounded-lg">
              #{String(order.queue_number || 0).padStart(3, "0")}
            </span>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusBadge(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <h3 className="text-lg font-serif font-bold text-[#5c1f2e]">
            Detail Pesanan Pelanggan
          </h3>
        </div>

        {/* Info Pemesan & Waktu */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-[#fcf9f5] p-3 rounded-2xl border border-[#e8ded2] text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Pemesan
            </span>
            <span className="font-bold text-stone-800">
              {order.customer_name || "Guest"}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Waktu Transaksi
            </span>
            <span className="font-medium text-stone-700">
              {order.created_at
                ? new Date(order.created_at).toLocaleString("id-ID")
                : "-"}
            </span>
          </div>
        </div>

        {/* Daftar Item Pesanan */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-4">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs"
            >
              <div>
                <span className="font-bold text-stone-800">
                  {item.name}
                </span>
                <span className="text-stone-500 block text-[11px]">
                  {item.quantity} x Rp {(item.price || 0).toLocaleString("id-ID")}
                </span>
                {item.notes && (
                  <span className="text-stone-400 italic text-[10px] block">
                    "{item.notes}"
                  </span>
                )}
              </div>
              <span className="font-bold text-[#5c1f2e]">
                Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        {/* Total Pembayaran */}
        <div className="pt-3 border-t border-[#e8ded2] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Total Transaksi
          </span>
          <span className="text-lg font-bold text-[#5c1f2e]">
            Rp {(order.total_price || 0).toLocaleString("id-ID")}
          </span>
        </div>

        {/* Review Pelanggan jika ada */}
        {order.review?.rating && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
            <span className="font-bold text-amber-800 block mb-0.5">
              Ulasan Pelanggan ({order.review.rating} ⭐)
            </span>
            <p className="text-stone-600 italic">
              "{order.review.comment || "Tanpa komentar"}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
