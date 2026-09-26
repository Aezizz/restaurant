import { io } from "socket.io-client";

// Helper untuk menentukan URL backend secara dinamis & cerdas
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    // Jika diakses melalui tunneling (seperti VS Code Dev Tunnels, ngrok, dsb)
    // ATAU diakses melalui perangkat eksternal (HP):
    // Gunakan relative path "" agar request ke /api otomatis melewati Vite proxy.
    // Ini menyelesaikan:
    // 1. Masalah Mixed Content (HTTPS Dev Tunnel memanggil HTTP)
    // 2. Masalah port 3000 terpisah di Dev Tunnels yang butuh public auth
    // 3. Masalah CORS antar domain
    if (
      hostname.includes("devtunnels.ms") ||
      hostname.includes("ngrok") ||
      hostname.includes("loca.lt")
    ) {
      return "";
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }

    // Default untuk akses HP via IP LAN (misal: 192.168.x.x)
    return "";
  }

  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();

export const socket = io(API_BASE_URL || undefined, {
  transports: ["websocket", "polling"],
  path: "/socket.io",
});

