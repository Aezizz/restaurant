import { API_BASE_URL } from "./socket";

export const fetchOrdersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/orders`);
  return await response.json();
};

export const updateOrderStatusApi = async (orderId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const resetQueueApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/orders/reset-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
};

export const resetCompletedOrdersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/orders/completed`, {
    method: "DELETE",
  });
  return await response.json();
};

export const exportOrdersApi = async (ordersData) => {
  const response = await fetch(`${API_BASE_URL}/api/orders/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders: ordersData }),
  });
  return await response.json();
};

export const getDailyStatsApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/daily-stats`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    throw error;
  }
};
