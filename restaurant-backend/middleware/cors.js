import cors from "cors";

// Whitelist domain resmi yang diperbolehkan mengakses API
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // 1. Izinkan request tanpa origin (seperti curl, mobile app, postman, server-to-server)
    if (!origin) return callback(null, true);

    // 2. Cek apakah origin ada di whitelist resmi
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // 3. Izinkan VS Code Port Forwarding (*.devtunnels.ms) & tunnel dev lainnya
    if (
      origin.includes("devtunnels.ms") ||
      origin.includes("ngrok-free.app") ||
      origin.includes("loca.lt")
    ) {
      return callback(null, true);
    }

    // 4. Izinkan IP LAN lokal (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const isLocalNetwork = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (isLocalNetwork) {
      return callback(null, true);
    }

    // 5. Izinkan di mode development agar testing mobile via berbagai IP/tunnel tidak terhambat
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    callback(new Error(`Akses ditolak oleh Kebijakan CORS untuk origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
