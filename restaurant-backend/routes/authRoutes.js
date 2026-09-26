import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  seedAdmin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/seed-admin", seedAdmin);

export default router;
