import express from "express";
import Menu from "../models/menu.js";
import AuditLog from "../models/AuditLog.js";
import {
  verifyTokenMiddleware,
  requireRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper untuk escape karakter spesial regex agar aman dari injection / ReDoS
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// 1. GET: Ambil daftar menu dengan filter pencarian aman (NoSQL Injection Prevention)
router.get("/", async (req, res) => {
  try {
    const rawKeyword = req.query.keyword ?? req.query.search ?? req.query.q;
    
    if (rawKeyword !== undefined && rawKeyword !== null) {
      // 🛡️ SANITASI KETAT: String casting dan trim mutlak mencegah payload objek NoSQL
      const sanitizedKeyword = String(rawKeyword).trim();
      
      if (sanitizedKeyword) {
        const safeRegex = new RegExp(escapeRegex(sanitizedKeyword), "i");
        const menus = await Menu.find({
          $or: [
            { name: { $regex: safeRegex } },
            { category: { $regex: safeRegex } },
            { description: { $regex: safeRegex } },
          ],
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: menus.length, data: menus });
      }
    }

    const menus = await Menu.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint spesifik /search untuk pencarian menu
router.get("/search", async (req, res) => {
  try {
    const rawKeyword = req.query.keyword ?? req.query.search ?? req.query.q ?? "";
    const sanitizedKeyword = String(rawKeyword).trim();

    if (!sanitizedKeyword) {
      const menus = await Menu.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: menus.length, data: menus });
    }

    const safeRegex = new RegExp(escapeRegex(sanitizedKeyword), "i");
    const menus = await Menu.find({
      $or: [
        { name: { $regex: safeRegex } },
        { category: { $regex: safeRegex } },
        { description: { $regex: safeRegex } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST: Tambah menu baru (Khusus Admin)
router.post(
  "/",
  verifyTokenMiddleware,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const { name, category, price, image_url, description, stock } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Nama menu wajib diisi!",
        });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Harga menu harus berupa angka lebih dari 0!",
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Kategori menu wajib dipilih!",
        });
      }

      // Validasi stok: jika tidak diisi, gunakan default 10
      let numStock = 10;
      if (stock !== undefined && stock !== null && stock !== "") {
        numStock = Number(stock);
        if (isNaN(numStock) || numStock < -1) {
          return res.status(400).json({
            success: false,
            message: "Nilai stok tidak valid! Isi angka >= 0 atau kosongkan untuk menggunakan stok default (10).",
          });
        }
        numStock = Math.floor(numStock); // Pastikan bulat
      }

      const newMenu = new Menu({
        name: name.trim(),
        category: category.trim(),
        price: numPrice,
        image_url: image_url || "",
        description: description || "",
        stock: numStock,
      });

      const savedMenu = await newMenu.save();

      // 📜 Catat ke Audit Trail
      await AuditLog.create({
        user_id: req.user?.id || null,
        user_email: req.user?.email || "ADMIN",
        action: "CREATE_MENU",
        target_resource: "Menu",
        resource_id: savedMenu._id.toString(),
        new_values: {
          name: savedMenu.name,
          price: savedMenu.price,
          category: savedMenu.category,
          stock: savedMenu.stock,
        },
        ip_address: req.ip,
      });

      res.status(201).json({
        success: true,
        data: savedMenu,
        message: "Menu berhasil ditambahkan!",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// 3. PUT: Edit menu (Khusus Admin)
router.put(
  "/:id",
  verifyTokenMiddleware,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, image_url, description, stock } = req.body;

      const oldMenu = await Menu.findById(id);
      if (!oldMenu) {
        return res.status(404).json({
          success: false,
          message: "Menu tidak ditemukan!",
        });
      }

      const updateData = {};
      if (name) updateData.name = name.trim();
      if (category) updateData.category = category.trim();
      if (price !== undefined) {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: "Harga menu harus berupa angka lebih dari 0!",
          });
        }
        updateData.price = numPrice;
      }
      if (image_url !== undefined) updateData.image_url = image_url;
      if (description !== undefined) updateData.description = description;

      // Update stok: -1 = unlimited, >= 0 = stok terbatas
      if (stock !== undefined && stock !== null && stock !== "") {
        const numStock = Math.floor(Number(stock));
        if (isNaN(numStock) || numStock < -1) {
          return res.status(400).json({
            success: false,
            message: "Nilai stok tidak valid!",
          });
        }
        updateData.stock = numStock;
      }

      const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      // 📜 Catat ke Audit Trail
      await AuditLog.create({
        user_id: req.user?.id || null,
        user_email: req.user?.email || "ADMIN",
        action: "UPDATE_MENU",
        target_resource: "Menu",
        resource_id: id,
        old_values: {
          name: oldMenu.name,
          price: oldMenu.price,
          category: oldMenu.category,
          stock: oldMenu.stock,
        },
        new_values: {
          name: updatedMenu.name,
          price: updatedMenu.price,
          category: updatedMenu.category,
          stock: updatedMenu.stock,
        },
        ip_address: req.ip,
      });

      res.status(200).json({
        success: true,
        data: updatedMenu,
        message: "Menu berhasil diperbarui!",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// 3b. PATCH: Update stok menu saja (Khusus Admin) — endpoint dedicated stok
router.patch(
  "/:id/stock",
  verifyTokenMiddleware,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      // mode: "set" (ganti nilai), "add" (tambah), "subtract" (kurangi), "reset" (unlimited/-1)
      const { mode = "set", amount } = req.body;

      const menu = await Menu.findById(id);
      if (!menu) {
        return res.status(404).json({ success: false, message: "Menu tidak ditemukan!" });
      }

      const oldStock = menu.stock;
      let newStock;

      if (mode === "reset") {
        newStock = -1; // Ubah menjadi unlimited
      } else {
        const numAmount = Math.floor(Number(amount));
        if (isNaN(numAmount)) {
          return res.status(400).json({ success: false, message: "Nilai amount harus berupa angka!" });
        }

        if (mode === "set") {
          newStock = Math.max(-1, numAmount);
        } else if (mode === "add") {
          newStock = oldStock === -1 ? -1 : Math.max(0, oldStock + numAmount);
        } else if (mode === "subtract") {
          newStock = oldStock === -1 ? -1 : Math.max(0, oldStock - numAmount);
        } else {
          return res.status(400).json({ success: false, message: "Mode tidak valid! Gunakan: set, add, subtract, reset" });
        }
      }

      menu.stock = newStock;
      await menu.save();

      // 📜 Audit Trail
      await AuditLog.create({
        user_id: req.user?.id || null,
        user_email: req.user?.email || "ADMIN",
        action: "UPDATE_STOCK",
        target_resource: "Menu",
        resource_id: id,
        old_values: { stock: oldStock },
        new_values: { stock: newStock, mode },
        ip_address: req.ip,
      });

      // ⚡ Emit event WebSocket pembaruan stok real-time
      if (req.io) {
        req.io.emit("stock-updated", [menu]);
      }

      res.status(200).json({
        success: true,
        data: menu,
        message: `Stok "${menu.name}" berhasil diperbarui: ${oldStock === -1 ? "∞" : oldStock} → ${newStock === -1 ? "∞" : newStock}`,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 4. DELETE: Hapus menu (Khusus Admin)
router.delete(
  "/:id",
  verifyTokenMiddleware,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const oldMenu = await Menu.findById(id);
      if (!oldMenu) {
        return res.status(404).json({
          success: false,
          message: "Menu tidak ditemukan!",
        });
      }

      await Menu.findByIdAndDelete(id);

      // 📜 Catat ke Audit Trail
      await AuditLog.create({
        user_id: req.user?.id || null,
        user_email: req.user?.email || "ADMIN",
        action: "DELETE_MENU",
        target_resource: "Menu",
        resource_id: id,
        old_values: { name: oldMenu.name, price: oldMenu.price },
        ip_address: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Menu "${oldMenu.name}" berhasil dihapus!`,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
