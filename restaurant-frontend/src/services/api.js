import { API_BASE_URL } from "./socket";

// Helper untuk mengambil token dan membentuk headers autentikasi
export const getAuthHeaders = (token = null) => {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("userToken") : null);
  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

// 📋 Ambil semua pesanan (Khusus Cashier, Kitchen, Admin)
export const fetchOrdersApi = async (token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// 🔄 Update status pesanan
export const updateOrderStatusApi = async (orderId, status, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 🔄 Reset nomor antrian harian (Admin)
export const resetQueueApi = async (token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/reset-queue`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    console.error("Error resetting queue:", error);
    throw error;
  }
};

// 🗑️ Bersihkan pesanan yang selesai (Admin)
export const resetCompletedOrdersApi = async (token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/completed`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting completed orders:", error);
    throw error;
  }
};

// 📤 Ekspor pesanan ke Google Sheets (Admin & Cashier)
export const exportOrdersApi = async (ordersData = null, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/export`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(ordersData ? { orders: ordersData } : {}),
    });
    return await response.json();
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};

// 📊 Statistik Pesanan Harian (Admin, Cashier, Kitchen)
export const getDailyStatsApi = async (token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/daily-stats`, {
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    throw error;
  }
};

// 📊 Statistik Penjualan 7 Hari Terakhir untuk Grafik Mingguan (Admin)
export const getWeeklyStatsApi = async (token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/weekly-stats`, {
      headers: getAuthHeaders(token),
    });
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
export const createMenuApi = async (menuData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menus`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(menuData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating menu:", error);
    throw error;
  }
};

// 3. Update menu (Khusus Admin)
export const updateMenuApi = async (menuId, menuData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menus/${menuId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(menuData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating menu:", error);
    throw error;
  }
};

// 4. Hapus menu (Khusus Admin)
export const deleteMenuApi = async (menuId, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menus/${menuId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting menu:", error);
    throw error;
  }
};
