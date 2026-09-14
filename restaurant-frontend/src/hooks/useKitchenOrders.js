import { useState, useEffect, useCallback } from "react";
import { socket } from "../services/socket";
import {
  fetchOrdersApi,
  updateOrderStatusApi,
  resetQueueApi,
  resetCompletedOrdersApi,
  exportOrdersApi,
  getDailyStatsApi, // 👈 Jangan lupa import ini di file api.js nanti
} from "../services/api";
import { toast } from "react-toastify";

export function useKitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
  }); // 👈 State statistik harian

  const fetchOrders = useCallback(async () => {
    try {
      const result = await fetchOrdersApi();
      if (result.success) {
        // ✅ Ubah: Jangan filter out "completed" secara permanen dari UI,
        // biarkan tetap tampil di grid supaya tombol cetak bill masih bisa diakses.
        // Nanti pesanan baru akan benar-benar bersih dari UI saat fitur "Tutup Toko" dijalankan.
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pesanan:", error);
    }
  }, []);

  // 📊 Fungsi untuk mengambil statistik harian
  const fetchDailyStats = useCallback(async () => {
    try {
      const result = await getDailyStatsApi();
      if (result.success) {
        setDailyStats(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat statistik harian:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchDailyStats(); // 👈 Panggil saat komponen pertama kali dimuat

    const handleNewOrder = (newOrder) => {
      if (newOrder.status !== "completed") {
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
      }
      // Refresh statistik harian saat ada pesanan baru masuk
      fetchDailyStats();
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
      );
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-status-update", handleStatusUpdate);

    const interval = setInterval(() => {
      fetchOrders();
      fetchDailyStats(); // 👈 Ikut direfresh periodik
    }, 5000);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-status-update", handleStatusUpdate);
      clearInterval(interval);
    };
  }, [fetchOrders, fetchDailyStats]);

  const updateStatus = async (orderId, newStatus, customerName) => {
    try {
      const result = await updateOrderStatusApi(orderId, newStatus);
      if (result.success) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === orderId ? result.data : o)),
        );

        socket.emit("update-order-status", {
          customer_name: customerName,
          status: newStatus,
          ...result.data,
        });

        if (newStatus === "completed") {
          socket.emit("finish-order", {
            orderId: orderId,
            customer_name: customerName,
          });
        }

        // Update statistik seketika setelah status berubah
        fetchDailyStats();
        return true;
      } else {
        toast.error("Gagal mengubah status: " + result.message);
        return false;
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Terjadi kesalahan saat memperbarui status.");
      return false;
    }
  };

  const resetQueue = async () => {
    try {
      const result = await resetQueueApi();
      if (result.success) {
        toast.success(result.message);
        return true;
      } else {
        toast.error("Gagal mereset nomor antrian.");
        return false;
      }
    } catch (error) {
      console.error("Error resetting queue:", error);
      toast.error("Terjadi kesalahan saat mereset nomor antrian.");
      return false;
    }
  };

  const exportOrdersToSheets = async () => {
    try {
      const completedOrders = orders.filter((o) => o.status === "completed");
      const ordersToExport =
        completedOrders.length > 0 ? completedOrders : orders;
      const result = await exportOrdersApi(ordersToExport);
      if (result.success) {
        toast.success(
          result.message || "Rekap berhasil dikirim ke Google Sheets!",
        );
        return true;
      } else {
        toast.error("Gagal ekspor ke Google Sheets: " + result.message);
        return false;
      }
    } catch (error) {
      console.error("Error exporting to sheets:", error);
      toast.error("Terjadi kesalahan saat ekspor ke Google Sheets.");
      return false;
    }
  };

  const resetCompletedOrders = async () => {
    try {
      await exportOrdersToSheets();

      const result = await resetCompletedOrdersApi();
      if (result.success) {
        toast.success(result.message);
        fetchOrders();
        fetchDailyStats(); // 👈 Refresh statistik setelah reset
        return true;
      } else {
        toast.error("Gagal mereset pesanan.");
        return false;
      }
    } catch (error) {
      console.error("Error resetting orders:", error);
      toast.error("Terjadi kesalahan saat mereset pesanan.");
      return false;
    }
  };

  const reNotifyCustomer = (orderId, customerName) => {
    socket.emit("finish-order", {
      orderId: orderId,
      customer_name: customerName,
    });
    toast.success(
      `Notifikasi berhasil dikirim ulang ke ${customerName}!`,
    );
  };

  return {
    orders,
    dailyStats, // 👈 Diekspor agar bisa dipakai di KitchenDashboard.jsx
    fetchOrders,
    fetchDailyStats,
    updateStatus,
    resetQueue,
    resetCompletedOrders,
    exportOrdersToSheets,
    reNotifyCustomer,
  };
}
