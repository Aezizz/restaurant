import { Server } from "socket.io";
import http from "http";

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
  });

  // Tangkap koneksi real-time WebSocket dari client
  io.on("connection", (socket) => {
    console.log(`🔌 Client terhubung: ${socket.id}`);

    // Event saat status pesanan diubah
    socket.on("update-order-status", (data) => {
      console.log(
        `Status Pesanan (${data.customer_name}) berubah jadi: ${data.status}`,
      );
      io.emit("order-status-update", data);
    });

    // Event notifikasi "Siap Diambil"
    socket.on("finish-order", (data) => {
      console.log(`Notifikasi selesai dikirim ke Pemesan: ${data.customer_name}`);
      io.emit("order-ready", data);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client terputus: ${socket.id}`);
    });
  });

  return io;
};
