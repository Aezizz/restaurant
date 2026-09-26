import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check, UtensilsCrossed, Package } from "lucide-react";

const CATEGORIES = [
  "Coffee",
  "Non-Coffee",
  "Makanan Berat",
  "Makanan Ringan",
];

export default function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Coffee",
    price: "",
    image_url: "",
    description: "",
    stock: "",
  });

  const isEditMode = Boolean(initialData?._id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "Coffee",
        price: initialData.price || "",
        image_url: initialData.image_url || "",
        description: initialData.description || "",
        // stock: -1 berarti unlimited, tampilkan kosong di input
        stock: initialData.stock !== undefined && initialData.stock !== -1 ? String(initialData.stock) : "",
      });
    } else {
      setFormData({
        name: "",
        category: "Coffee",
        price: "",
        image_url: "",
        description: "",
        stock: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      // Kosong = unlimited (-1), isi angka = stok terbatas
      stock: formData.stock === "" || formData.stock === null ? -1 : Math.max(-1, Math.floor(Number(formData.stock))),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-[#e8ded2] relative my-8">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#5c1f2e] p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#5c1f2e]/10 text-[#5c1f2e] rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#5c1f2e]">
              {isEditMode ? "Edit Menu Produk" : "Tambah Menu Baru"}
            </h3>
            <p className="text-xs text-stone-500">
              {isEditMode
                ? "Perbarui informasi dan harga menu produk"
                : "Masukkan detail produk untuk ditambahkan ke katalog"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Menu */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Kopi Susu Aren Spesial"
              className="w-full text-xs p-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] font-medium"
            />
          </div>

          {/* Kategori & Harga (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full text-xs p-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="500"
                step="500"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="25000"
                className="w-full text-xs p-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] font-medium"
              />
            </div>
          </div>

          {/* Stok Produk */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Stok Produk
              <span className="ml-2 text-[10px] font-normal text-stone-400 normal-case tracking-normal">
                (kosongkan = tak terbatas)
              </span>
            </label>
            <div className="relative flex items-center">
              <Package className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="Contoh: 50  (kosongkan = ∞ tak terbatas)"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
            {/* Indikator visual stok */}
            <p className="mt-1.5 text-[10px] text-stone-400">
              {formData.stock === "" || formData.stock === null
                ? "✅ Stok: Tak terbatas (unlimited)"
                : Number(formData.stock) === 0
                  ? "🔴 Stok: Habis — pelanggan tidak bisa memesan menu ini"
                  : Number(formData.stock) > 0
                    ? `📦 Stok tersedia: ${formData.stock} porsi`
                    : "⚠️ Masukkan angka 0 atau lebih"}
            </p>
          </div>

          {/* URL Gambar Produk */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              URL Gambar Produk
            </label>
            <div className="relative flex items-center">
              <ImageIcon className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
              />
            </div>
            {formData.image_url && (
              <div className="mt-2 w-full h-28 rounded-xl overflow-hidden bg-stone-100 border border-[#e8ded2]">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Deskripsi Menu */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Deskripsi Singkat
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Deskripsi racikan kopi atau bahan makanan..."
              className="w-full text-xs p-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] font-medium resize-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs hover:bg-[#431420] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditMode
                    ? "Perbarui Menu"
                    : "Simpan Menu"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
