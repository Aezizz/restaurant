import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Calendar,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import ConfirmModal from "../ConfirmModal";
import {
  updateOrderStatusApi,
  exportOrdersApi,
  resetCompletedOrdersApi,
  resetQueueApi,
} from "../../services/api";
import { toast } from "react-toastify";

const STATUS_FILTERS = ["Semua", "pending", "cooking", "completed", "cancelled"];

export default function OrderHistoryView({
  orders,
  onRefreshOrders,
  token,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const queueStr = String(order.queue_number || "");
    const customerStr = order.customer_name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      customerStr.includes(query) || queueStr.includes(query);
    const matchesStatus =
      selectedStatus === "Semua" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusApi(orderId, newStatus, token);
      if (res.success) {
        toast.success(`Status pesanan diubah ke "${newStatus}"`);
        onRefreshOrders();
      } else {
        toast.error(res.message || "Gagal memperbarui status pesanan.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Gagal memperbarui status pesanan.");
    }
  };

  const handleExportSheets = async () => {
    setIsExporting(true);
    try {
      const res = await exportOrdersApi(filteredOrders, token);
      if (res.success) {
        toast.success(res.message || "Berhasil ekspor ke Google Sheets! 📊");
      } else {
        toast.error(res.message || "Gagal ekspor ke Google Sheets.");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal melakukan ekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTriggerResetQueue = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Nomor Antrian?",
      message:
        "Nomor antrian akan di-reset kembali ke #001. Aksi ini akan dicatat ke Audit Trail.",
      onConfirm: async () => {
        try {
          const res = await resetQueueApi(token);
          if (res.success) {
            toast.success("Antrian berhasil di-reset ke #001!");
            onRefreshOrders();
          } else {
            toast.error(res.message || "Gagal reset antrian.");
          }
        } catch (err) {
          toast.error("Gagal reset antrian.");
        }
      },
    });
  };

  const handleTriggerCleanCompleted = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Bersihkan Pesanan Selesai?",
      message:
        "Semua pesanan dengan status 'completed' akan dibersihkan dari daftar aktif.",
      onConfirm: async () => {
        try {
          const res = await resetCompletedOrdersApi(token);
          if (res.success) {
            toast.success("Pesanan selesai berhasil dibersihkan!");
            onRefreshOrders();
          } else {
            toast.error(res.message || "Gagal membersihkan pesanan.");
          }
        } catch (err) {
          toast.error("Gagal membersihkan pesanan.");
        }
      },
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cooking":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Action Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-3xl border border-[#e8ded2] shadow-xs">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex items-center min-w-[240px]">
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pemesan atau #antrian..."
              className="w-full pl-10 pr-3 py-2 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex overflow-x-auto gap-1.5 scrollbar-none py-1">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize cursor-pointer ${
                  selectedStatus === st
                    ? "bg-[#5c1f2e] text-white shadow-xs"
                    : "bg-[#fcf9f5] text-stone-600 hover:bg-[#e8ded2]/50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Export & Maintenance */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportSheets}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            title="Ekspor ke Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? "Mengekspor..." : "Export Sheets"}</span>
          </button>

          <button
            onClick={handleTriggerResetQueue}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Reset Antrian Harian"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Antrian</span>
          </button>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-white rounded-3xl border border-[#e8ded2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8ded2] bg-[#fcf9f5]/60 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                <th className="py-3.5 px-4">No. Antrian</th>
                <th className="py-3.5 px-4">Pemesan</th>
                <th className="py-3.5 px-4">Item Pesanan</th>
                <th className="py-3.5 px-4">Total Harga</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-[#fcf9f5]/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#5c1f2e]">
                      #{String(order.queue_number || 0).padStart(3, "0")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {order.customer_name || "Guest"}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-xs">
                      <span className="line-clamp-1">
                        {order.items
                          ?.map((it) => `${it.name} (${it.quantity})`)
                          .join(", ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      Rp {(order.total_price || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusClass(
                          order.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="cooking">Cooking</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px] whitespace-nowrap">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-stone-500 hover:text-[#5c1f2e] hover:bg-[#5c1f2e]/10 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-stone-400 text-xs"
                  >
                    Tidak ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />

      {/* Modal Konfirmasi Tindakan */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onClose={() =>
          setConfirmConfig({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: () => {},
          })
        }
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  );
}
