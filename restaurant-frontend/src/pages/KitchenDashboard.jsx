import React, { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReceiptTemplate from "../components/ReceiptTemplate";
import KitchenHeader from "../components/kitchen/KitchenHeader";
import OrderGrid from "../components/kitchen/OrderGrid";
import { useKitchenOrders } from "../hooks/useKitchenOrders";

function StatCard({ label, value, accentColor }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${accentColor} px-5 py-4 flex-1 min-w-[220px]`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}

export default function KitchenDashboard() {
  const {
    orders,
    updateStatus,
    resetQueue,
    resetCompletedOrders,
    exportOrdersToSheets,
    reNotifyCustomer,
    dailyStats,
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
    setTimeout(() => window.print(), 200);
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
    <div className="p-5">
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

      <div className="flex gap-4 my-5 flex-wrap">
        <StatCard
          label="Total Pesanan Hari Ini"
          value={`${dailyStats?.totalOrders || 0} Transaksi`}
          accentColor="border-indigo-500"
        />
        <StatCard
          label="Estimasi Pendapatan"
          value={`Rp ${dailyStats?.totalRevenue?.toLocaleString("id-ID") || 0}`}
          accentColor="border-emerald-500"
        />
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
