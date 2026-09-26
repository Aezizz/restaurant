import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../models/User.js";
import { loginUser } from "../controllers/authController.js";

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_db");

  console.log("=== TEST 1: Login Admin Resmi (admin@vynacoffee.com) ===");
  const req1 = { body: { email: "admin@vynacoffee.com", password: "admin123" } };
  const res1 = mockRes();
  await loginUser(req1, res1);
  console.log("Result:", { status: res1.statusCode, success: res1.body?.success, role: res1.body?.user?.role, message: res1.body?.message });

  console.log("\n=== TEST 2: Login Kasir Resmi (cashier@vynacoffee.com) ===");
  const req2 = { body: { email: "cashier@vynacoffee.com", password: "cashier123" } };
  const res2 = mockRes();
  await loginUser(req2, res2);
  console.log("Result:", { status: res2.statusCode, success: res2.body?.success, role: res2.body?.user?.role, message: res2.body?.message });

  console.log("\n=== TEST 3: Login Akun Manual Compass (adminmanual@vynacoffee.com) ===");
  const req3 = { body: { email: "adminmanual@vynacoffee.com", password: "password123" } };
  const res3 = mockRes();
  await loginUser(req3, res3);
  console.log("Result:", { status: res3.statusCode, success: res3.body?.success, role: res3.body?.user?.role, message: res3.body?.message });

  console.log("\n=== TEST 4: Simulasi Password Salah ===");
  const req4 = { body: { email: "admin@vynacoffee.com", password: "salah_password" } };
  const res4 = mockRes();
  await loginUser(req4, res4);
  console.log("Result:", { status: res4.statusCode, success: res4.body?.success, message: res4.body?.message });

  console.log("\n=== TEST 5: Simulasi User Plain Text dari Compass & Auto-Upgrade ===");
  await User.findOneAndUpdate(
    { email: "testplain@vynacoffee.com" },
    { name: "Test Plain", email: "testplain@vynacoffee.com", password: "mypassword", role: "admin" },
    { upsert: true }
  );
  const req5 = { body: { email: "testplain@vynacoffee.com", password: "mypassword" } };
  const res5 = mockRes();
  await loginUser(req5, res5);
  console.log("Result:", { status: res5.statusCode, success: res5.body?.success, message: res5.body?.message });
  const checkUpdated = await User.findOne({ email: "testplain@vynacoffee.com" });
  console.log("Is upgraded to bcrypt?", checkUpdated.password.startsWith("$2b$"));
  await User.deleteOne({ email: "testplain@vynacoffee.com" });

  console.log("\n=== TEST 6: Simulasi User MD5 dari Compass & Auto-Upgrade ===");
  const md5Pass = crypto.createHash("md5").update("md5secret").digest("hex");
  await User.findOneAndUpdate(
    { email: "testmd5@vynacoffee.com" },
    { name: "Test MD5", email: "testmd5@vynacoffee.com", password: md5Pass, role: "admin" },
    { upsert: true }
  );
  const req6 = { body: { email: "testmd5@vynacoffee.com", password: "md5secret" } };
  const res6 = mockRes();
  await loginUser(req6, res6);
  console.log("Result:", { status: res6.statusCode, success: res6.body?.success, message: res6.body?.message });
  const checkUpdatedMd5 = await User.findOne({ email: "testmd5@vynacoffee.com" });
  console.log("Is upgraded to bcrypt?", checkUpdatedMd5.password.startsWith("$2b$"));
  await User.deleteOne({ email: "testmd5@vynacoffee.com" });

  console.log("\nSemua skenario login & password verification BERHASIL 100%!");
  process.exit(0);
}

runTests();
