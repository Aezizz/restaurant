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

// 🔐 STARTUP CHECK: Pastikan JWT_SECRET terdefinisi di .env
if (!process.env.JWT_SECRET) {
  console.error(
    "❌ FATAL SECURITY ERROR: process.env.JWT_SECRET is not defined! System cannot start safely.",
  );
  process.exit(1);
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Middleware Security Headers HTTP
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  next();
});

// Middleware dasar
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Server
const server = http.createServer(app);

// Socket.io
const io = configureSocket(server);
app.use(socketMiddleware(io));

// API ROUTES
app.use("/api", routes);
app.use("/api/auth", authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app, server, PORT };
