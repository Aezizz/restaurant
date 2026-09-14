import React from "react";

export default function ReceiptTemplate({ order }) {
  if (!order) return null;

  return (
    <div
      id="receipt-print-area"
      className="hidden print:block font-mono text-[11px] text-black bg-white p-4 w-[58mm] mx-auto"
    >
      {/* Header Toko */}
      <div className="text-center mb-3 border-b border-dashed border-black pb-2">
        <h2 className="font-bold text-sm">VYNA COFFEE</h2>
        <p className="text-[10px]">Jl. Kenangan No. 88, Depok</p>
        <p className="text-[10px]">Telp: 0812-3456-7890</p>
      </div>

      {/* Info Transaksi */}
      <div className="mb-2 border-b border-dashed border-black pb-2 space-y-0.5">
        <div className="flex justify-between">
          <span>No. Antrian:</span>
          <span className="font-bold">
            #
            {order.queue_number
              ? order.queue_number.toString().padStart(3, "0")
              : "---"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Nama Pemesan:</span>
          <span className="font-bold">{order.customer_name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>
            {new Date(order.created_at || Date.now()).toLocaleTimeString(
              "id-ID",
            )}
          </span>
        </div>
      </div>

      {/* Daftar Item Pesanan */}
      <div className="mb-2 border-b border-dashed border-black pb-2 space-y-1">
        {order.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between font-semibold">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </span>
            </div>
            {item.notes && (
              <div className="text-[9px] italic text-gray-700 pl-2">
                Note: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mb-4 border-b border-dashed border-black pb-2 space-y-1">
        <div className="flex justify-between font-bold text-xs">
          <span>TOTAL:</span>
          <span>
            Rp {(order.total_price || order.total || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Footer Struk */}
      <div className="text-center text-[10px] space-y-1">
        <p>Terima Kasih Atas Kunjungan Anda!</p>
        <p>Silakan Menikmati Hidangan Vyna Coffee</p>
      </div>
    </div>
  );
}
