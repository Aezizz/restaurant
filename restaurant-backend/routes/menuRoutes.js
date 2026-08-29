import express from "express";
import Menu from "../models/menu.js";

const router = express.Router();

// 1. GET: Ambil semua daftar menu
router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find();
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST: Tambah menu baru (opsional buat admin/testing)
router.post("/", async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    const savedMenu = await newMenu.save();
    res.status(201).json({ success: true, data: savedMenu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
