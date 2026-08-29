import jwt from "jsonwebtoken";

export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Akses ditolak, token tidak ditemukan!",
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "rahasia_jwt_lu",
    );
    req.user = decoded; // Menyimpan data user ke req.user
    next();
  } catch (err) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa.",
      });
  }
};
