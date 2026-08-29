import React from "react";
import OrderCard from "./OrderCard";

export default function OrderGrid({
  orders,
  onUpdateStatus,
  onReNotify,
  onPrintReceipt,
}) {
  if (!orders || orders.length === 0) {
    return <p>Belum ada pesanan yang masuk.</p>;
  }

  return (
    <div
      className="orders-grid"
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginTop: "20px",
      }}
    >
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          onReNotify={onReNotify}
          onPrintReceipt={onPrintReceipt}
        />
      ))}
    </div>
  );
}
