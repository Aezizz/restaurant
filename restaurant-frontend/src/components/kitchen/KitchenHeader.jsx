import React from "react";
import { ChefHat, FileSpreadsheet, RotateCcw, Trash2 } from "lucide-react";

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
      <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Dashboard Dapur / Kasir - Daftar Pesanan Masuk</span>
        <ChefHat style={{ width: "24px", height: "24px" }} />
      </h1>
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FileSpreadsheet style={{ width: "16px", height: "16px" }} />
          <span>Rekap Harian (Google Sheets)</span>
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RotateCcw style={{ width: "16px", height: "16px" }} />
          <span>Reset Nomor Antrian (#001)</span>
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
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Trash2 style={{ width: "16px", height: "16px" }} />
          <span>Reset Pesanan Selesai (Tutup Toko)</span>
        </button>
      </div>
    </div>
  );
}
