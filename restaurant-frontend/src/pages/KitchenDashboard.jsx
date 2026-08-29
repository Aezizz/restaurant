import React, { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReceiptTemplate from "../components/ReceiptTemplate";
import KitchenHeader from "../components/kitchen/KitchenHeader";
import OrderGrid from "../components/kitchen/OrderGrid";
import { useKitchenOrders } from "../hooks/useKitchenOrders";

export default function KitchenDashboard() {
  const {
    orders,
    updateStatus,
    resetQueue,
    resetCompletedOrders,
    exportOrdersToSheets,
    reNotifyCustomer,
    dailyStats, // 👈 Ambil dailyStats dari hook
  } = useKitchenOrders();

  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya",
    onConfirm: () => {},
  });

  const handlePrintReceipt = (order) => {
    setSelectedOrderToPrint(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleTriggerResetQueue = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Nomor Antrian?",
      message: "Yakin ingin mereset nomor antrian harian kembali ke #001?",
      confirmText: "Ya, Reset",
      onConfirm: async () => {
        await resetQueue();
      },
    });
  };

  const handleTriggerExportSheets = async () => {
    await exportOrdersToSheets();
  };

  const handleTriggerResetDailyOrders = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Rekap & Tutup Toko?",
      message:
        "Data akan disimpan ke Google Sheets dan riwayat pesanan selesai akan dihapus. Yakin?",
      confirmText: "Ya, Rekap & Hapus",
      onConfirm: async () => {
        try {
          await resetCompletedOrders();
        } catch (error) {
          console.error("Error:", error);
          toast.error("Gagal melakukan proses tutup toko.");
        }
      },
    });
  };

  return (
    <div className="kitchen-dashboard" style={{ padding: "20px" }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        theme="light"
      />

      <KitchenHeader
        onResetQueue={handleTriggerResetQueue}
        onResetDailyOrders={handleTriggerResetDailyOrders}
        onExportSheets={handleTriggerExportSheets}
      />

      {/* 📊 Kotak Indikator Total Pesanan & Pendapatan Harian */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          margin: "20px 0",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #4f46e5",
            minWidth: "220px",
            flex: "1",
          }}
        >
          <p
            style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6b7280" }}
          >
            Total Pesanan Hari Ini
          </p>
          <h3 style={{ margin: 0, fontSize: "24px", color: "#1f2937" }}>
            {dailyStats?.totalOrders || 0} Transaksi
          </h3>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderLeft: "5px solid #10b981",
            minWidth: "220px",
            flex: "1",
          }}
        >
          <p
            style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6b7280" }}
          >
            Estimasi Pendapatan
          </p>
          <h3 style={{ margin: 0, fontSize: "24px", color: "#1f2937" }}>
            Rp {dailyStats?.totalRevenue?.toLocaleString("id-ID") || 0}
          </h3>
        </div>
      </div>

      <OrderGrid
        orders={orders}
        onUpdateStatus={updateStatus}
        onReNotify={reNotifyCustomer}
        onPrintReceipt={handlePrintReceipt}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
      />

      <ReceiptTemplate order={selectedOrderToPrint} />
    </div>
  );
}
