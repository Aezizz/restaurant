import React from "react";

export default function OrderCard({
  order,
  onUpdateStatus,
  onReNotify,
  onPrintReceipt,
}) {
  const getBackgroundColor = (status) => {
    if (status === "completed") return "#e6ffed";
    if (status === "cooking") return "#fff9db";
    return "#fff";
  };

  return (
    <div
      className="order-card"
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "8px",
        width: "280px",
        background: getBackgroundColor(order.status),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#5c1f2e",
          color: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          Antrian
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: "900",
            fontFamily: "monospace",
          }}
        >
          #
          {order.queue_number
            ? order.queue_number.toString().padStart(3, "0")
            : "---"}
        </span>
      </div>
      <h3>Meja Nomor: {order.table_number}</h3>
      <p>
        <strong>Status:</strong>{" "}
        <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
          {order.status}
        </span>
      </p>
      <p>
        <small>
          Waktu: {new Date(order.created_at).toLocaleTimeString("id-ID")}
        </small>
      </p>

      <hr />
      <h4>Daftar Menu:</h4>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx} className="mb-2 border-b border-gray-100 pb-2">
            <div className="flex justify-between font-medium">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </span>
            </div>

            {item.notes && (
              <p className="text-xs text-[#5c1f2e] bg-[#e8ded2]/40 px-2 py-1 rounded-md mt-1 font-semibold">
                📝 Catatan: {item.notes}
              </p>
            )}
          </li>
        ))}
      </ul>

      <hr />
      <p>
        <strong>
          Total: Rp {order.total_price.toLocaleString("id-ID")}
        </strong>
      </p>

      {/* Tombol Aksi Berdasarkan Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginTop: "10px",
        }}
      >
        {order.status === "pending" && (
          <button
            onClick={() =>
              onUpdateStatus(order._id, "cooking", order.table_number)
            }
            style={{
              background: "#f08c00",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Masak 🍳
          </button>
        )}

        {order.status === "cooking" && (
          <button
            onClick={() =>
              onUpdateStatus(order._id, "completed", order.table_number)
            }
            style={{
              background: "#2b8a3e",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Selesai ✅
          </button>
        )}

        {order.status === "completed" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
            }}
          >
            <span
              style={{
                color: "#2b8a3e",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Pesanan Selesai 🎉
            </span>

            <button
              onClick={() => onReNotify(order._id, order.table_number)}
              style={{
                background: "#1971c2",
                color: "white",
                border: "none",
                padding: "6px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              📢 Kirim Ulang Notifikasi
            </button>
            <button
              onClick={() => onPrintReceipt(order)}
              style={{
                background: "#495057",
                color: "white",
                border: "none",
                padding: "6px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "4px",
                width: "100%",
              }}
            >
              🖨️ Cetak Struk Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
