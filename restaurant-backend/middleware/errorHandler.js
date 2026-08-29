export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server",
    error: err.message,
  });
};
