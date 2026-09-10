// app.js
import express from "express";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/db.js";
import { configureSocket } from "./config/socket.js";
import { corsMiddleware } from "./middleware/cors.js";
import { socketMiddleware } from "./middleware/socketMiddleware.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Server
const server = http.createServer(app);

// Socket.io
const io = configureSocket(server);
app.use(socketMiddleware(io));


// ✅ ROUTES - Pastikan ini benar
app.use("/api", routes); // Ini akan menangani semua route /api/*

// ✅ TAMBAHKAN: Route langsung untuk testing
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    availableRoutes: [
      "GET /api/orders",
      "POST /api/orders",
      "POST /api/orders/export",
      "POST /api/orders/reset-queue",
      "PATCH /api/orders/:id/status",
      "DELETE /api/orders/completed",
    ],
  });
});
// Pasang di bawah middleware/routes yang lain
app.use("/api/auth", authRoutes);
// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app, server, PORT };
