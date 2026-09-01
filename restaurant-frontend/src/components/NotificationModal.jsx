import React, { useState, useEffect } from "react";
import { socket, API_BASE_URL } from "../services/socket";

export default function NotificationModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [alertBanner, setAlertBanner] = useState(null);
  const tableNumber = localStorage.getItem("tableNumber");

  useEffect(() => {
    if (!isOpen) return;

    if (tableNumber) {
      fetch(`${API_BASE_URL}/api/orders/table/${tableNumber}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setOrders(result.data);
          } else {
            setOrders([]);
          }
        })
        .catch((err) => console.error("Gagal ambil status:", err));
    }

    socket.on("order-status-update", (updatedOrder) => {
      if (Number(updatedOrder.table_number) === Number(tableNumber)) {
        setOrders((prevOrders) =>
          prevOrders.map((ord) => {
            if (ord._id === updatedOrder._id) {
              if (
                ord.status !== updatedOrder.status &&
                (updatedOrder.status === "completed" ||
                  updatedOrder.status === "ready")
              ) {
                setAlertBanner({
                  queue: updatedOrder.queue_number || "---",
                  status: updatedOrder.status,
                });
                setTimeout(() => setAlertBanner(null), 6000);
              }
              return updatedOrder;
            }
            return ord;
          }),
        );
      }
    });

    return () => {
      socket.off("order-status-update");
    };
  }, [isOpen, tableNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      {alertBanner && (
        <div className="absolute top-4 left-4 right-4 z-50 max-w-md mx-auto bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-bounce-short">
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <h4 className="font-bold text-xs text-[#5c1f2e] uppercase tracking-wider">
              Pesanan Siap!
            </h4>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Yeay! Pesanan untuk Meja #{tableNumber} (No. Antrean #
              {alertBanner.queue}) sudah siap diambil di kasir! ☕🚀
            </p>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold px-2 py-1 rounded-lg bg-stone-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white h-full p-6 pb-24 md:pb-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-[#e8ded2] pb-4 mb-6">
            <h2 className="text-xl font-bold font-serif text-[#5c1f2e]">
              Notifikasi Pesanan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-stone-100 w-8 h-8 rounded-full flex items-center justify-center border border-[#e8ded2]"
            >
              ✕
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center mt-20 text-stone-500">
              <span className="text-4xl mb-4 block">🔔</span>
              <p className="text-sm">
                Belum ada riwayat pesanan aktif untuk Meja #{tableNumber}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((orderStatus, index) => (
                <div
                  key={orderStatus._id || index}
                  className="bg-[#fcf9f5] p-5 rounded-3xl border border-[#e8ded2] shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#5c1f2e]">
                      Pesanan #
                      {orderStatus.queue_number
                        ? orderStatus.queue_number.toString().padStart(3, "0")
                        : "---"}
                    </h3>
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
                  <p className="text-xs text-stone-500">
                    Meja Nomor: #{tableNumber}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    {orderStatus.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs text-stone-700"
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between font-bold text-sm">
                    <span>Total:</span>
                    <span className="text-[#5c1f2e]">
                      Rp{" "}
                      {orderStatus.total?.toLocaleString("id-ID") ||
                        orderStatus.total_price?.toLocaleString("id-ID") ||
                        "0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-stone-400 text-[11px] pt-4 border-t border-[#e8ded2]">
          Vyna Coffee & Restaurant • Real-time Status
        </div>
      </div>
    </div>
  );
}
