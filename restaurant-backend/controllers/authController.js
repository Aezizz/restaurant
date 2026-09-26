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

// 📝 Register Controller
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi!",
      });
    }

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

    // Tetapkan role default 'customer', cegah penetapan 'admin' via pendaftaran publik biasa
    const userRole = role === "admin" ? "customer" : (role || "customer");

    // Simpan user baru
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi!",
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak terdaftar!" });
    }

    // 🔐 Validasi Password Cerdas (Mendukung Bcrypt, MD5 Compass, dan Plain Text)
    let isMatch = false;
    const dbPassword = user.password || "";

    // 1. Cek apakah password di database merupakan Bcrypt hash standar ($2a$, $2b$, $2y$)
    const isBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(dbPassword);

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, dbPassword);
    } else {
      // 2. Fallback: Cek jika akun dibuat manual via MongoDB Compass dengan Plain Text
      if (dbPassword === password) {
        isMatch = true;
      }
      // 3. Fallback: Cek jika akun dibuat manual via Compass menggunakan MD5 hash (32 karakter hex)
      else if (dbPassword.length === 32) {
        const inputMd5 = crypto.createHash("md5").update(password).digest("hex");
        if (dbPassword.toLowerCase() === inputMd5.toLowerCase()) {
          isMatch = true;
        }
      }
      // 4. Fallback: Cek jika akun dibuat manual menggunakan SHA-256 (64 karakter hex)
      else if (dbPassword.length === 64) {
        const inputSha256 = crypto.createHash("sha256").update(password).digest("hex");
        if (dbPassword.toLowerCase() === inputSha256.toLowerCase()) {
          isMatch = true;
        }
      }

      // 🔄 OTOMATISASI UPGRADE: Jika cocok via Plain Text/MD5, langsung re-hash ke Bcrypt di database
      if (isMatch) {
        try {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          console.log(`✅ [AUTO-MIGRATION] Password untuk user '${user.email}' berhasil diupgrade ke Bcrypt hash!`);
        } catch (upgradeErr) {
          console.error("Gagal auto-upgrade password hash:", upgradeErr);
        }
      }
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password salah!" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET environment variable is missing!");
      return res.status(500).json({
        success: false,
        message: "Konfigurasi server tidak aman (JWT secret missing).",
      });
    }

    // Buat token JWT yang menyertakan role
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "customer" },
      jwtSecret,
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
        role: user.role || "customer",
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

    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak terdaftar!" });
    }

    // Buat reset token acak dan tentukan masa aktif 15 menit
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpire,
    });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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

// 🛠️ Seed / Reset Admin User Controller (Endpoint Bantuan Cepat)
export const seedAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};
    const targetEmail = (email || "admin@vynacoffee.com").trim().toLowerCase();
    const targetPassword = password || "admin123";
    const targetName = name || "Administrator Vyna";
    const targetRole = role || "admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(targetPassword, salt);

    let user = await User.findOne({ email: targetEmail });
    if (user) {
      user.password = hashedPassword;
      user.role = targetRole;
      user.name = targetName;
      await user.save();
    } else {
      user = new User({
        name: targetName,
        email: targetEmail,
        password: hashedPassword,
        role: targetRole,
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Akun ${targetEmail} (${targetRole}) berhasil dibuat/diperbarui dengan password Bcrypt yang valid!`,
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error seedAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
