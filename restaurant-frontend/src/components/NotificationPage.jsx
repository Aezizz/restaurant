import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { io } from "socket.io-client";

// Base URL API, diambil dari .env (VITE_API_URL). Kalau .env gak ada / lupa
// di-set, fallback ke localhost:3000 biar dev di laptop sendiri tetep jalan.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const socket = io(API_URL);

export default function NotificationPage({ onClose }) {
  const [orderStatus, setOrderStatus] = useState(null);
  const tableNumber = localStorage.getItem("tableNumber");

  useEffect(() => {
    // Fetch status terakhir dari API saat halaman dibuka
    if (tableNumber) {
      fetch(`${API_URL}/api/orders/table/${tableNumber}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) setOrderStatus(result.data);
        })
        .catch((err) => console.error("Gagal ambil status:", err));
    }

    // Listener Real-time
    socket.on("order-status-update", (data) => {
      if (Number(data.table_number) === Number(tableNumber)) {
        setOrderStatus(data);
      }
    });

    return () => socket.off("order-status-update");
  }, [tableNumber]);

  return (
    <div className="fixed inset-0 z-50 bg-[#fcf9f5] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-serif text-[#5c1f2e] flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <span>Notifikasi Pesanan</span>
        </h2>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-[#5c1f2e] p-1 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!orderStatus ? (
        <div className="text-center mt-20 text-stone-400 flex flex-col items-center">
          <Bell className="w-12 h-12 mb-3 text-stone-300 stroke-[1.5]" />
          <p className="text-sm">Belum ada riwayat pesanan aktif.</p>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm">
          {/* NOMOR ANTRIAN HARIAN MENCUKUP */}
          <div className="bg-[#5c1f2e] text-white p-4 rounded-2xl mb-4 text-center shadow-md">
            <span className="text-xs uppercase tracking-widest block opacity-80 font-medium">
              Nomor Antrian Anda
            </span>
            <span className="text-4xl font-extrabold block font-mono mt-1">
              #{orderStatus.queue_number ? orderStatus.queue_number.toString().padStart(3, "0") : "---"}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Meja #{tableNumber}</h3>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                orderStatus.status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {orderStatus.status}
            </span>
          </div>
          <div className="space-y-2">
            {orderStatus.items.map((item, i) => (
              <p key={i} className="text-sm text-stone-700">
                {item.quantity}x {item.name}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-stone-100 text-right font-bold">
            Total: Rp {orderStatus.total_price.toLocaleString("id-ID")}
          </div>
        </div>
      )}
    </div>
  );
}
