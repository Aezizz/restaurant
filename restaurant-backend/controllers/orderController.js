import Order from "../models/Order.js";
import Menu from "../models/menu.js";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";
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
      orders = await Order.find({ status: "completed" }).sort({
        created_at: -1,
      });

      if (orders.length === 0) {
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

    // 📜 Pencatatan Audit Trail
    await AuditLog.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "SYSTEM/GUEST",
      action: "EXPORT_TO_SHEETS",
      target_resource: "Order",
      new_values: { count: orders.length },
      ip_address: req.ip,
    });

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

// 🆕 Create new order (Dengan Server-Side Validation Mutlak & Rekalkulasi Harga)
export const createOrder = async (req, res) => {
  try {
    const { items, customer_name } = req.body;

    // 1. Validasi Input Nama Pemesan
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama pemesan wajib diisi!",
      });
    }

    // 2. Validasi Array Items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pesanan harus memiliki minimal 1 menu!",
      });
    }

    // 3. Ambil Menu Asli dari Database (Server-Side Price Lookup)
    const menuIds = items.map((item) => item.menu_id || item._id);
    const dbMenus = await Menu.find({ _id: { $in: menuIds } });
    const menuMap = new Map(dbMenus.map((m) => [m._id.toString(), m]));

    let calculatedTotal = 0;
    const validatedItems = [];

    // 4. Validasi Kuantitas & Rekalkulasi Total Harga Mutlak di Server
    for (const item of items) {
      const targetId = (item.menu_id || item._id)?.toString();
      const dbMenu = menuMap.get(targetId);

      if (!dbMenu) {
        return res.status(400).json({
          success: false,
          message: `Menu dengan ID '${targetId}' tidak ditemukan di database.`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0 || qty > 100) {
        return res.status(400).json({
          success: false,
          message: `Jumlah kuantitas untuk '${dbMenu.name}' harus angka bulat positif (1-100).`,
        });
      }

      // 📦 Cek stok: -1 = unlimited; 0 = habis; > 0 = ada stok
      if (dbMenu.stock !== undefined && dbMenu.stock !== -1) {
        if (dbMenu.stock <= 0) {
          return res.status(400).json({
            success: false,
            message: `Menu '${dbMenu.name}' sedang habis stok. Silakan pilih menu lain.`,
          });
        }
        if (dbMenu.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `Stok '${dbMenu.name}' tidak mencukupi. Tersisa ${dbMenu.stock} porsi, Anda memesan ${qty}.`,
          });
        }
      }

      // Hitung subtotal menggunakan HARGA RESMI dari database
      const itemSubtotal = dbMenu.price * qty;
      calculatedTotal += itemSubtotal;

      validatedItems.push({
        menu_id: dbMenu._id,
        name: dbMenu.name,
        price: dbMenu.price, // Gunakan harga resmi DB
        quantity: qty,
        notes: (item.notes || "").substring(0, 200), // Batasi catatan max 200 karakter
      });
    }

    const queueNumber = await getNextQueueNumber();

    let userId = null;
    let userEmail = "GUEST";

    // 🔍 Cek token di header Authorization tanpa fallback string rahasia
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret);
          userId = decoded.id || decoded.userId;
          userEmail = decoded.email || "LOGGED_USER";
        } catch (err) {
          console.log("Token checkout tidak valid, pesanan dicatat sebagai guest.");
        }
      }
    }

    const newOrder = new Order({
      user_id: userId,
      queue_number: queueNumber,
      customer_name: customer_name.trim().substring(0, 50),
      items: validatedItems,
      total_price: calculatedTotal, // Kunci: Dihitung mutlak oleh Server
      status: "pending",
    });

    await newOrder.save();

    // 📦 Kurangi stok secara atomis setelah order tersimpan
    const updatedMenusForSocket = [];
    for (const item of validatedItems) {
      const updated = await Menu.findOneAndUpdate(
        { _id: item.menu_id, stock: { $gt: 0 } }, // Hanya kurangi jika stok aktif (> 0), lewati jika -1
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (updated) {
        updatedMenusForSocket.push(updated);
      }
    }

    // 📜 Log Audit Trail untuk pembuatan order baru
    await AuditLog.create({
      user_id: userId,
      user_email: userEmail,
      action: "CREATE_ORDER",
      target_resource: "Order",
      resource_id: newOrder._id.toString(),
      new_values: {
        queue_number: queueNumber,
        total_price: calculatedTotal,
        items_count: validatedItems.length,
      },
      ip_address: req.ip,
    });

    // Emit socket events
    if (req.io) {
      req.io.emit("new-order", newOrder);
      req.io.emit("order-status-update", newOrder);
      // ⚡ Emit event pembaruan stok real-time ke kasir, customer, & admin
      if (updatedMenusForSocket.length > 0) {
        req.io.emit("stock-updated", updatedMenusForSocket);
      }
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

// 🍳 Update Status Pesanan di Kitchen (dengan Audit Log & RBAC Check)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "cooking", "completed", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan: ${allowedStatuses.join(", ")}`,
      });
    }

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true },
    );

    // 📜 Pencatatan Audit Log saat status pesanan diubah
    await AuditLog.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "SYSTEM/STAFF",
      action: "UPDATE_ORDER_STATUS",
      target_resource: "Order",
      resource_id: orderId,
      old_values: { status: oldOrder.status },
      new_values: { status: updatedOrder.status },
      ip_address: req.ip,
    });

    // Emit socket update
    if (req.io) {
      req.io.emit("order-status-update", updatedOrder);
      if (status === "completed" || status === "cooking") {
        req.io.emit("order-ready", updatedOrder);
      }
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

// 🗑️ Delete completed orders (Dengan Audit Log)
export const deleteCompletedOrders = async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: "completed" });
    const result = await Order.deleteMany({ status: "completed" });

    // 📜 Pencatatan Audit Log
    await AuditLog.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "ADMIN",
      action: "DELETE_COMPLETED_ORDERS",
      target_resource: "Order",
      old_values: { deleted_count: result.deletedCount },
      ip_address: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Berhasil membersihkan ${result.deletedCount} pesanan yang selesai.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔄 Reset queue (Dengan Audit Log)
export const resetQueue = async (req, res) => {
  try {
    await resetQueueApi();

    // 📜 Pencatatan Audit Log
    await AuditLog.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "ADMIN",
      action: "RESET_QUEUE",
      target_resource: "Queue",
      new_values: { queue_number: 0 },
      ip_address: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Antrian harian berhasil di-reset ke 0.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📜 Get my order history
export const getMyOrderHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Silakan login terlebih dahulu.",
      });
    }

    const orders = await Order.find({ user_id: userId }).sort({
      created_at: -1,
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

    if (order.user_id && order.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Anda tidak berhak mengulas pesanan ini.",
      });
    }

    order.review = {
      rating: Number(rating),
      comment: comment ? String(comment).substring(0, 500) : "",
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
      { $match: { "review.rating": { $ne: null } } },
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
        averageRating: Number(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews,
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

// 📊 Ambil Statistik Pesanan Harian
export const getDailyStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

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

// 📊 Ambil Statistik Penjualan 7 Hari Terakhir untuk Grafik Mingguan Dashboard
export const getWeeklyStats = async (req, res) => {
  try {
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weeklyData = [];

    // Hitung 7 hari terakhir (dari 6 hari lalu sampai hari ini)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const orders = await Order.find({
        created_at: { $gte: dayStart, $lte: dayEnd },
      });

      const dayRevenue = orders.reduce(
        (acc, curr) => acc + (curr.total_price || 0),
        0
      );

      weeklyData.push({
        date: dayStart.toISOString().split("T")[0],
        day: dayNames[dayStart.getDay()],
        totalRevenue: dayRevenue,
        orderCount: orders.length,
      });
    }

    const maxRevenue = Math.max(...weeklyData.map((w) => w.totalRevenue), 1);

    const formattedData = weeklyData.map((item) => {
      let amountFormatted = "Rp 0";
      if (item.totalRevenue >= 1000000) {
        amountFormatted = `Rp ${(item.totalRevenue / 1000000).toFixed(1)}jt`;
      } else if (item.totalRevenue >= 1000) {
        amountFormatted = `Rp ${Math.round(item.totalRevenue / 1000)}rb`;
      }

      // Persentase tinggi batang grafik
      const heightPercent =
        item.totalRevenue > 0
          ? Math.max(15, Math.round((item.totalRevenue / maxRevenue) * 100))
          : 8;

      return {
        ...item,
        amount: amountFormatted,
        val: `${heightPercent}%`,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error getWeeklyStats:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memuat statistik mingguan." });
  }
};

