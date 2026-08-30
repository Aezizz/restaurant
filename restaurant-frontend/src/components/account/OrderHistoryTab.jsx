import React from "react";

export default function OrderHistoryTab({
  loadingOrders,
  orderHistory,
  handleOpenRatingModal,
  handleReorder,
}) {
  if (loadingOrders) {
    return (
      <p className="text-center text-xs text-stone-400 py-6">
        Memuat riwayat...
      </p>
    );
  }

  if (orderHistory.length === 0) {
    return (
      <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-[#e8ded2]">
        <span className="text-3xl block mb-2">📦</span>
        <p className="text-xs text-stone-400">
          Belum ada riwayat pesanan tercatat di akun ini.
        </p>
      </div>
    );
  }

  return (
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
          </div>

          <div className="text-xs text-stone-600 space-y-1">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-2 flex justify-between items-center">
            <span className="font-bold text-xs text-[#5c1f2e]">
              Total: Rp {order.total?.toLocaleString("id-ID")}
            </span>
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
  );
}
