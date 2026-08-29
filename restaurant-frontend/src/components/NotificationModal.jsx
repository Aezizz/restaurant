import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function NotificationModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const tableNumber = localStorage.getItem("tableNumber");

  useEffect(() => {
    if (!isOpen) return;

    if (tableNumber) {
      fetch(`http://localhost:3000/api/orders/table/${tableNumber}`)
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
          prevOrders.map((ord) =>
            ord._id === updatedOrder._id ? updatedOrder : ord,
          ),
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
      <div className="w-full max-w-md bg-white h-full p-6 pb-24 md:pb-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-[#e8ded2] pb-4 mb-6">
            <h2 className="text-xl font-bold font-serif">Notifikasi Pesanan</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer"
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
                    <h3 className="font-bold text-sm">
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
