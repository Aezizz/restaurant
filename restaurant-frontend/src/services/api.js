import { API_BASE_URL } from "./socket";
import { fetchWithAuth } from "../utils/apiHandler";

// 📋 Ambil semua pesanan (Khusus Cashier, Kitchen, Admin)
export const fetchOrdersApi = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/orders`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// 🔄 Update status pesanan
export const updateOrderStatusApi = async (orderId, status) => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/orders/${orderId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 🔄 Reset nomor antrian harian (Admin)
export const resetQueueApi = async () => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/orders/reset-queue`,
      {
        method: "POST",
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error resetting queue:", error);
    throw error;
  }
};

// 🗑️ Bersihkan pesanan yang selesai (Admin)
export const resetCompletedOrdersApi = async () => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/orders/completed`,
      {
        method: "DELETE",
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error deleting completed orders:", error);
    throw error;
  }
};

// 📤 Ekspor pesanan ke Google Sheets (Admin & Cashier)
export const exportOrdersApi = async (ordersData = null) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/export`, {
      method: "POST",
      body: JSON.stringify(ordersData ? { orders: ordersData } : {}),
    });
    return await response.json();
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};

// 📊 Statistik Pesanan Harian (Admin, Cashier, Kitchen)
export const getDailyStatsApi = async () => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/orders/daily-stats`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    throw error;
  }
};

// 📊 Statistik Penjualan 7 Hari Terakhir untuk Grafik Mingguan (Admin)
export const getWeeklyStatsApi = async () => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/orders/weekly-stats`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    throw error;
  }
};

// 🍔 CRUD MENU (Kelola Menu)

// 1. Ambil semua menu
export const fetchMenusApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menus`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching menus:", error);
    throw error;
  }
};

// 2. Tambah menu baru (Khusus Admin)
export const createMenuApi = async (menuData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/menus`, {
      method: "POST",
      body: JSON.stringify(menuData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating menu:", error);
    throw error;
  }
};

// 3. Update menu (Khusus Admin)
export const updateMenuApi = async (menuId, menuData) => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/menus/${menuId}`,
      {
        method: "PUT",
        body: JSON.stringify(menuData),
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error updating menu:", error);
    throw error;
  }
};

// 4. Hapus menu (Khusus Admin)
export const deleteMenuApi = async (menuId) => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/menus/${menuId}`,
      {
        method: "DELETE",
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error deleting menu:", error);
    throw error;
  }
};

// 5. Update stok menu (Khusus Admin)
export const updateMenuStockApi = async (menuId, mode, amount = 0) => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/menus/${menuId}/stock`,
      {
        method: "PATCH",
        body: JSON.stringify({ mode, amount }),
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error updating menu stock:", error);
    throw error;
  }
};
