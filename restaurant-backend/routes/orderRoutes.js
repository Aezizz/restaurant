import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus,
  deleteCompletedOrders,
  resetQueue,
  exportToSheets,
  getMyOrderHistory,
  rateOrder,
  getAverageRating,
  getDailyStats,
  getWeeklyStats,
} from "../controllers/orderController.js";

import {
  verifyTokenMiddleware,
  requireRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// 📋 GET routes (Dapur & Kasir & Admin)
router.get(
  "/",
  verifyTokenMiddleware,
  requireRoles("cashier", "kitchen", "admin"),
  getAllOrders
);
router.get("/customer/:customerName", getOrdersByCustomer);
router.get("/my-history", verifyTokenMiddleware, getMyOrderHistory);
router.get("/stats/rating", getAverageRating);
router.get(
  "/daily-stats",
  verifyTokenMiddleware,
  requireRoles("admin", "kitchen"),
  getDailyStats
);
router.get(
  "/weekly-stats",
  verifyTokenMiddleware,
  requireRoles("admin"),
  getWeeklyStats
);

// 📤 POST routes
router.post("/", createOrder); // Publik (Customer / Tamu buat pesanan)
router.post(
  "/reset-queue",
  verifyTokenMiddleware,
  requireRoles("admin"),
  resetQueue
);
router.post(
  "/export",
  verifyTokenMiddleware,
  requireRoles("admin"),
  exportToSheets
);
router.post("/:orderId/rate", verifyTokenMiddleware, rateOrder);

// 🔄 PATCH / PUT routes (Dapur & Kasir & Admin)
router.patch(
  "/:id/status",
  verifyTokenMiddleware,
  requireRoles("cashier", "kitchen", "admin"),
  updateOrderStatus
);
router.put(
  "/:orderId/status",
  verifyTokenMiddleware,
  requireRoles("cashier", "kitchen", "admin"),
  updateOrderStatus
);

// 🗑️ DELETE routes (Khusus Admin)
router.delete(
  "/completed",
  verifyTokenMiddleware,
  requireRoles("admin"),
  deleteCompletedOrders
);

export default router;
