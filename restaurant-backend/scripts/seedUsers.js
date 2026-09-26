import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedUsers = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_db";
    console.log("Menghubungkan ke database MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Terhubung ke database.");

    const salt = await bcrypt.genSalt(10);

    const defaultAccounts = [
      {
        name: "Admin Vyna",
        email: "admin@vynacoffee.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Kasir Vyna",
        email: "cashier@vynacoffee.com",
        password: "cashier123",
        role: "cashier",
      },
      {
        name: "Admin Manual",
        email: "adminmanual@vynacoffee.com",
        password: "password123",
        role: "admin",
      },
    ];

    console.log("\nMemproses seeding / reset akun resmi:");
    for (const acc of defaultAccounts) {
      const hashedPassword = await bcrypt.hash(acc.password, salt);
      const updated = await User.findOneAndUpdate(
        { email: acc.email.toLowerCase() },
        {
          name: acc.name,
          email: acc.email.toLowerCase(),
          password: hashedPassword,
          role: acc.role,
        },
        { upsert: true, new: true }
      );

      console.log(`✓ Akun berhasil disiapkan:`);
      console.log(`  - Nama:     ${updated.name}`);
      console.log(`  - Email:    ${updated.email}`);
      console.log(`  - Password: ${acc.password}`);
      console.log(`  - Role:     ${updated.role}`);
      console.log(`  - Hash:     ${updated.password.substring(0, 20)}... (Bcrypt valid)\n`);
    }

    console.log("🎉 Seeding akun berhasil! Anda sekarang bisa login dengan akun di atas.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error);
    process.exit(1);
  }
};

seedUsers();
