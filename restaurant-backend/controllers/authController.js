import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 📝 Register Controller (Pastikan ada kata 'export')
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah terdaftar!" });
    }

    // Hash password agar aman
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil! Silakan masuk.",
    });
  } catch (error) {
    console.error("Error register:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// 🔑 Login Controller (Pastikan ada kata 'export')
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak ditemukan!" });
    }

    // Validasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password salah!" });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "rahasia_jwt_lu",
      { expiresIn: "7d" },
    );

    // Kirim respons lengkap beserta tokennya
    res.status(200).json({
      success: true,
      message: "Berhasil masuk!",
      token: token, // 👈 Token dikirim ke frontend di sini
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};
