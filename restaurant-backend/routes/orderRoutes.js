// routes/orderRoutes.js
import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrdersByTable,
  updateOrderStatus,
  deleteCompletedOrders,
  resetQueue,
  exportToSheets,
  getMyOrderHistory,
  rateOrder, // 👈 Import controller baru
  getAverageRating, // 👈 Import controller baru
} from "../controllers/orderController.js";

import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// 📋 GET routes
router.get("/", getAllOrders);
router.get("/table/:tableNumber", getOrdersByTable);
router.get("/my-history", verifyTokenMiddleware, getMyOrderHistory);
router.get("/stats/rating", getAverageRating);
// 📤 POST routes
router.post("/", createOrder);
router.post("/reset-queue", resetQueue);
router.post("/export", exportToSheets);
router.post("/:orderId/rate", verifyTokenMiddleware, rateOrder);
// 🔄 PATCH routes
router.patch("/:id/status", updateOrderStatus);
router.put("/:orderId/status", updateOrderStatus);

// 🗑️ DELETE routes
router.delete("/completed", deleteCompletedOrders);

export default router;
