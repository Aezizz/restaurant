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
      const { name, category, price, image_url, description } = req.body;

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

      const newMenu = new Menu({
        name: name.trim(),
        category: category.trim(),
        price: numPrice,
        image_url: image_url || "",
        description: description || "",
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
      const { name, category, price, image_url, description } = req.body;

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
        },
        new_values: {
          name: updatedMenu.name,
          price: updatedMenu.price,
          category: updatedMenu.category,
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
