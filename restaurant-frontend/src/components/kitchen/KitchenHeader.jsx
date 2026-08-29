import React from "react";

export default function KitchenHeader({
  onResetQueue,
  onResetDailyOrders,
  onExportSheets,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <h1>Dashboard Dapur / Kasir - Daftar Pesanan Masuk 👨‍🍳</h1>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={onExportSheets}
          style={{
            background: "#2b8a3e",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📊 Rekap Harian (Google Sheets)
        </button>
        <button
          onClick={onResetQueue}
          style={{
            background: "#1971c2",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔢 Reset Nomor Antrian (#001)
        </button>
        <button
          onClick={onResetDailyOrders}
          style={{
            background: "#c92a2a",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🧹 Reset Pesanan Selesai (Tutup Toko)
        </button>
      </div>
    </div>
  );
}
