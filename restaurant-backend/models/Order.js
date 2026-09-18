import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // 👤 Menghubungkan pesanan ke User (opsional jika tamu memesan tanpa login)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null,
  },
  queue_number: { type: Number, required: true },
  customer_name: { type: String, required: true },
  items: [
    {
      menu_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      notes: { type: String, default: "" },
    },
  ],
  total_price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "cooking", "completed", "cancelled"],
    default: "pending",
  },
  review: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: "" },
    rated_at: { type: Date, default: null },
  },
  created_at: { type: Date, default: Date.now },
});

// Catatan: TTL Index penghapusan otomatis (expireAfterSeconds) telah dihapus
// demi menjaga Immutability & Integritas Laporan Keuangan POS (Audit Trail).

const Order = mongoose.model("Order", orderSchema);
export default mongoose.models.Order || Order;
