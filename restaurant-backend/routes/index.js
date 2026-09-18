// routes/index.js
import express from "express";
import menuRoutes from "./menuRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = express.Router();

// Routes API
router.use("/menus", menuRoutes);
router.use("/orders", orderRoutes);


// Root route
router.get("/", (req, res) => {
  res.json({
    message: "API Restoran siap digunakan dengan MongoDB & Socket.io! 🚀",
  });
});

export default router;
