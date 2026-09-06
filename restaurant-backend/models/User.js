import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    resetToken: { type: String, default: null },
    resetTokenExpire: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
