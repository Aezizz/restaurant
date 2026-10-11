import jwt from "jsonwebtoken";

export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak, token tidak ditemukan!",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET environment variable is missing!");
      return res.status(500).json({
        success: false,
        message: "Konfigurasi server tidak aman (JWT secret missing).",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Menyimpan data user (id, email, role) ke req.user
    next();
  } catch (err) {
    // Jika token kedaluwarsa, jwt.verify akan melempar err (TokenExpiredError)
    const statusCode = err.name === "TokenExpiredError" ? 401 : 403;
    const message =
      err.name === "TokenExpiredError"
        ? "Sesi Anda telah habis, silakan masuk kembali."
        : "Token tidak valid.";
    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan Role User (RBAC)
 * @param  {...string} allowedRoles Contoh: 'admin', 'cashier', 'kitchen', 'customer'
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan sebelum memverifikasi peran.",
      });
    }

    const userRole = req.user.role || "customer";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Peran '${userRole}' tidak memiliki hak akses untuk tindakan ini.`,
      });
    }

    next();
  };
};

/**
 * Middleware untuk memastikan user memiliki peran 'admin' (verifyAdmin)
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Autentikasi diperlukan sebelum memverifikasi peran.",
    });
  }

  const userRole = req.user.role || "customer";

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak: Peran '${userRole}' tidak memiliki hak akses admin.`,
    });
  }

  next();
};
