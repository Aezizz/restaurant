import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 }, // Biaya tambahan jika ada (misal: +5000)
});

const modifierGroupSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Contoh: "Tingkat Kemanisan", "Porsi", "Topping"
  type: { type: String, enum: ["single", "multiple"], default: "single" }, // 'single' untuk radio/pilih satu, 'multiple' untuk checkbox/bisa banyak
  options: [optionSchema],
});

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image_url: { type: String },
    description: { type: String },
    stock: { type: Number, default: 10 }, // default stok awal 10; < 1 = habis
    modifier_groups: [modifierGroupSchema], // Di sinilah daftar kustomisasi disimpan!
  },
  { timestamps: true },
);

export default mongoose.model("Menu", menuSchema);
