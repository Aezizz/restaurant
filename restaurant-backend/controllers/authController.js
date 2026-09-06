import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

// 🔑 Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak terdaftar!" });
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

    res.status(200).json({
      success: true,
      message: "Berhasil masuk!",
      token: token,
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

// 📧 Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("➡️ [FORGOT PASSWORD] Menerima request untuk email:", email);

    // 1. Cek Email & Konfigurasi Transporter
    console.log("🔍 [FORGOT PASSWORD] Memeriksa konfigurasi EMAIL_USER:", process.env.EMAIL_USER || "BELUM DISET");

    // 2. Cari user berdasarkan email
    console.log("🔍 [FORGOT PASSWORD] Mencari user di database MongoDB...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ [FORGOT PASSWORD] Email tidak ditemukan di database:", email);
      return res
        .status(404)
        .json({ success: false, message: "Email tidak terdaftar!" });
    }
    console.log("✅ [FORGOT PASSWORD] User ditemukan ID:", user._id);

    // 3. Buat reset token acak dan tentukan masa aktif 15 menit
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
    console.log("🔑 [FORGOT PASSWORD] Token berhasil dibuat.");

    // 4. Simpan token dan masa berlaku ke database
    console.log("💾 [FORGOT PASSWORD] Menyimpan resetToken ke database...");
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpire,
    });
    console.log("✅ [FORGOT PASSWORD] Token berhasil disimpan di database.");

    // 5. Buat link verifikasi & Kirim Email
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log("✉️ [FORGOT PASSWORD] Mengirim email melalui Nodemailer...");

    await transporter.sendMail({
      from: `"Vyna Coffee" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Password Vyna Coffee",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #6B3F1E;">Reset Password Vyna Coffee ☕</h2>
          <p>Hai <strong>${user.name}</strong>,</p>
          <p>Kami menerima permintaan reset password untuk akunmu. Klik tombol di bawah untuk membuat password baru:</p>
          <a href="${resetLink}"
             style="display:inline-block; padding:12px 24px; background-color:#6B3F1E; color:#fff; text-decoration:none; border-radius:6px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px;">Link ini hanya berlaku selama <strong>15 menit</strong>. Jika kamu tidak meminta reset password, abaikan email ini.</p>
          <hr style="border:none; border-top:1px solid #eee; margin: 24px 0;">
          <p style="color: #bbb; font-size: 12px;">Vyna Coffee POS System</p>
        </div>
      `,
    });
    console.log("🎉 [FORGOT PASSWORD] Email berhasil dikirim ke:", user.email);

    res.status(200).json({
      success: true,
      message: "Link reset password telah dikirim ke email kamu.",
    });
  } catch (error) {
    console.error("❌ [FORGOT PASSWORD ERROR]:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server.", error: error.message });
  }
};

// 🔐 Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Cari user dengan token yang cocok dan masih berlaku
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa.",
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus token reset
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: { resetToken: "", resetTokenExpire: "" },
    });

    res.status(200).json({
      success: true,
      message: "Password berhasil direset. Silakan masuk dengan password baru.",
    });
  } catch (error) {
    console.error("Error reset-password:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};
