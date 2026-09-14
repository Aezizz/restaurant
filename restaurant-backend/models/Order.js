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
    enum: ["pending", "cooking", "completed"],
    default: "pending",
  },
  review: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: "" },
    rated_at: { type: Date, default: null },
  },
  created_at: { type: Date, default: Date.now },
});

// ⏰ TTL Index: Otomatis hapus dokumen setelah 3 hari (3 hari * 24 jam * 60 menit * 60 detik = 259200 detik)
// Catatan: TTL index biasanya hanya aktif jika status pesanan sudah 'completed' atau 'cancelled' agar pesanan yang masih aktif tidak ikut terhapus.
// Tapi karena secara default MongoDB menghapus semua dokumen berdasarkan field waktu, kita bisa atur partialFilterExpression khusus status 'completed'.
orderSchema.index(
  { created_at: 1 },
  {
    expireAfterSeconds: 259200,
    partialFilterExpression: { status: "completed" },
  },
);

const Order = mongoose.model("Order", orderSchema);
export default mongoose.models.Order || Order;
