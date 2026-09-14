import Order from "../models/Order.js";
import jwt from "jsonwebtoken"; // 🔑 Pastikan jwt diimport untuk membaca token user
import {
  getNextQueueNumber,
  resetQueueApi,
} from "../services/counterService.js";
import { exportOrdersToSheets } from "../services/googleSheetsService.js";

// 📊 Export ke Google Sheets
export const exportToSheets = async (req, res) => {
  try {
    let orders = req.body?.orders;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      console.log(
        "ℹ️ [EXPORT] Body orders kosong, mengambil data pesanan 'completed' dari database MongoDB...",
      );
      orders = await Order.find({ status: "completed" }).sort({
        created_at: -1,
      });

      if (orders.length === 0) {
        console.log(
          "ℹ️ [EXPORT] Tidak ada pesanan 'completed', mengambil semua pesanan dari database...",
        );
        orders = await Order.find().sort({ created_at: -1 });
      }
    }

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Tidak ada data pesanan yang perlu diekspor.",
        count: 0,
      });
    }

    const result = await exportOrdersToSheets(orders);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Gagal ekspor ke Google Sheets: ${error.message}`,
      error: error.stack,
    });
  }
};

// 📋 Get semua orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🆕 Create new order (Dimodifikasi untuk menangkap user_id dari token)
export const createOrder = async (req, res) => {
  try {
    const { items, total, customer_name } = req.body;
    const queueNumber = await getNextQueueNumber();

    let userId = null;

    // 🔍 Cek token di header Authorization (jika user login saat checkout)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        // Ganti "rahasia_jwt_lu" dengan secret key JWT yang lu pakai saat login (misal process.env.JWT_SECRET)
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "rahasia_jwt_lu",
        );
        userId = decoded.id || decoded.userId;
      } catch (err) {
        console.log(
          "Token tidak valid atau expired saat checkout, pesanan dicatat sebagai guest.",
        );
      }
    }

    const newOrder = new Order({
      user_id: userId, // 👈 Menyimpan ID user jika login, null jika tidak
      queue_number: queueNumber,
      customer_name: customer_name,
      items: items.map((item) => ({
        menu_id: item.menu_id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || "",
      })),
      total_price: total,
      status: "pending",
    });

    await newOrder.save();

    // Emit socket events
    if (req.io) {
      req.io.emit("new-order", newOrder);
      req.io.emit("order-status-update", newOrder);
    }

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📊 Get orders by customer name
export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerName } = req.params;
    const orders = await Order.find({ customer_name: customerName }).sort(
      { created_at: -1, _id: -1 },
    );

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memuat riwayat pesanan" });
  }
};

// 🔄 Update order status
// 🍳 Update Status Pesanan di Kitchen (misal: dari 'cooking' jadi 'completed')
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // Target status, misal: "completed"

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true },
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: `Status pesanan berhasil diubah menjadi ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updateOrderStatus:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui status pesanan." });
  }
};

// 🗑️ Delete completed orders
export const deleteCompletedOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({ status: "completed" });
    res.status(200).json({
      success: true,
      message: `Berhasil membersihkan ${result.deletedCount} pesanan yang selesai.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔄 Reset queue
export const resetQueue = async (req, res) => {
  try {
    await resetQueueApi();
    res.status(200).json({
      success: true,
      message: "Antrian harian berhasil di-reset ke 0.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📜 Get my order history (Dimodifikasi menggunakan created_at sesuai schema)
export const getMyOrderHistory = async (req, res) => {
  try {
    // Memastikan middleware auth melampirkan data user di req.user
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Silakan login terlebih dahulu.",
      });
    }

    const orders = await Order.find({ user_id: userId }).sort({
      created_at: -1, // 👈 Disesuaikan dengan schema Order.js (created_at, bukan createdAt)
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error getMyOrderHistory:", error);
    res.status(500).json({ success: false, message: "Gagal memuat riwayat" });
  }
};

// 🌟 Beri Rating & Ulasan pada Pesanan
export const rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating harus di antara 1 sampai 5!",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    // Pastikan yang memberi ulasan adalah pemilik pesanan yang sah
    if (order.user_id && order.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Anda tidak berhak mengulas pesanan ini.",
      });
    }

    // Simpan review
    order.review = {
      rating: Number(rating),
      comment: comment || "",
      rated_at: new Date(),
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Terima kasih atas ulasan Anda! ⭐",
      data: order,
    });
  } catch (error) {
    console.error("Error rateOrder:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan ulasan." });
  }
};

// 📊 Ambil Rata-Rata Rating Global Restoran
export const getAverageRating = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { "review.rating": { $ne: null } } }, // Hanya hitung pesanan yang sudah di-rate
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$review.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: Number(stats[0].averageRating.toFixed(1)), // Contoh: 4.9
        totalReviews: stats[0].totalReviews, // Contoh: 1000
      });
    } else {
      return res.status(200).json({
        success: true,
        averageRating: 5.0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error getAverageRating:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memuat statistik rating." });
  }
};
// 📊 Ambil Statistik Pesanan Harian untuk Dapur
export const getDailyStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Cari semua pesanan yang masuk hari ini
    const ordersToday = await Order.find({
      created_at: { $gte: todayStart, $lte: todayEnd },
    });

    const totalOrders = ordersToday.length;
    const totalRevenue = ordersToday.reduce(
      (acc, curr) => acc + (curr.total_price || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error getDailyStats:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memuat statistik harian." });
  }
};
