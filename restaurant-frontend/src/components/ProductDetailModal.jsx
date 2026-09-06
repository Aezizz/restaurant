import React, { useState } from "react";

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const isDrink =
    product.category === "Coffee" || product.category === "Non-Coffee";

  const [size, setSize] = useState("Regular");
  const [variant, setVariant] = useState(isDrink ? "Normal Sugar" : "Sedang");

  // State untuk menyimpan pilihan modifier dinamis dari database (contoh: { "Ice Cube": "Less Ice", "Dairy": ["Oat Milk."] })
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const basePrice = product.price || 0;
  const sizeExtra = size === "Large" ? 4000 : 0;

  // Hitung tambahan harga dari modifier dinamis di database
  const calculateModifierExtra = () => {
    let extra = 0;
    if (!product.modifier_groups) return extra;

    product.modifier_groups.forEach((group) => {
      const selected = selectedModifiers[group.title];
      const opts = group.options || group.option || [];

      if (group.type === "single" && selected) {
        const found = opts.find((o) => o.name === selected);
        if (found) extra += found.price || 0;
      } else if (group.type === "multiple" && Array.isArray(selected)) {
        selected.forEach((selName) => {
          const found = opts.find((o) => o.name === selName);
          if (found) extra += found.price || 0;
        });
      }
    });
    return extra;
  };

  const totalPrice =
    (basePrice + sizeExtra + calculateModifierExtra()) * quantity;

  // Handler pemilihan modifier dinamis
  const handleSelectOption = (groupTitle, type, optionName) => {
    if (type === "single") {
      setSelectedModifiers((prev) => ({
        ...prev,
        [groupTitle]: optionName,
      }));
    } else if (type === "multiple") {
      setSelectedModifiers((prev) => {
        const currentList = prev[groupTitle] || [];
        if (currentList.includes(optionName)) {
          return {
            ...prev,
            [groupTitle]: currentList.filter((item) => item !== optionName),
          };
        } else {
          return {
            ...prev,
            [groupTitle]: [...currentList, optionName],
          };
        }
      });
    }
  };

  // Daftar opsi varian bawaan yang aman berdasarkan kategori
  const variantOptions = isDrink
    ? ["Less Sugar", "Normal Sugar", "No Sugar"]
    : ["Tidak Pedas", "Sedang", "Pedas"];

  const handleAdd = () => {
    // Rangkum modifier dinamis untuk dimasukkan ke ringkasan catatan
    const modifierSummary = Object.entries(selectedModifiers)
      .map(([group, val]) => {
        if (Array.isArray(val)) return `${group}: ${val.join(", ")}`;
        return `${group}: ${val}`;
      })
      .filter(Boolean);

    const customizedItem = {
      ...product,
      price: basePrice + sizeExtra + calculateModifierExtra(),
      quantity,
      notes: [
        `Ukuran: ${size}`,
        isDrink ? `Gula: ${variant}` : `Level Rasa: ${variant}`,
        ...modifierSummary,
        notes ? `Catatan: ${notes}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    };
    onAddToCart(customizedItem);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fcf9f5] text-[#5c1f2e] flex flex-col overflow-y-auto font-sans animate-fadeIn">
      {/* 1. TOP HEADER */}
      <div className="sticky top-0 z-20 bg-[#fcf9f5]/90 backdrop-blur-md px-4 py-3.5 border-b border-[#e8ded2] flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white border border-[#e8ded2] flex items-center justify-center text-[#5c1f2e] hover:bg-[#e8ded2]/30 transition-colors cursor-pointer shadow-sm"
        >
          ✕
        </button>
        <h2 className="text-sm font-bold font-serif tracking-wide truncate max-w-[70%]">
          {product.name}
        </h2>
        <div className="w-10" />
      </div>

      {/* 2. AREA KONTEN UTAMA */}
      <div className="flex-1 pb-32">
        {/* Gambar Produk Full-Width */}
        <div className="w-full h-72 sm:h-80 bg-stone-100 relative overflow-hidden shadow-inner">
          <img
            src={
              product.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md font-semibold">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif mt-1 drop-shadow-md">
              {product.name}
            </h1>
            <p className="text-lg font-bold text-amber-200 mt-0.5">
              Rp {basePrice.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Panel Form Kustomisasi */}
        <div className="p-5 sm:p-8 space-y-6 max-w-2xl mx-auto w-full">
          {/* Deskripsi Menu */}
          {product.description && (
            <div className="bg-white p-4 rounded-2xl border border-[#e8ded2] shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Deskripsi Menu
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Opsi Ukuran (Size) */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Pilih Ukuran
              </h3>
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-semibold">
                Wajib
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Regular", "Large"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex justify-between items-center ${
                    size === s
                      ? "border-[#5c1f2e] bg-[#5c1f2e] text-white shadow-md"
                      : "border-[#e8ded2] bg-[#fcf9f5] text-[#5c1f2e] hover:bg-[#e8ded2]/30"
                  }`}
                >
                  <span>{s}</span>
                  <span className="text-[10px] opacity-80">
                    {s === "Large" ? "+Rp 4.000" : "Standar"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Opsi Varian / Level Gula / Rasa Bawaan */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              {isDrink
                ? "Tingkat Manis (Sugar Level)"
                : "Tingkat Kematangan / Rasa"}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {variantOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`py-2.5 px-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                    variant === v
                      ? "border-[#5c1f2e] bg-[#5c1f2e] text-white shadow-sm"
                      : "border-[#e8ded2] bg-[#fcf9f5] text-[#5c1f2e] hover:bg-[#e8ded2]/30"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* RENDER MODIFIER GROUPS DINAMIS DARI DATABASE (Americano, dll) */}
          {product.modifier_groups &&
            product.modifier_groups.map((group, idx) => {
              const optionsList = group.options || group.option || [];
              const currentSelection = selectedModifiers[group.title];

              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      {group.title}
                    </h3>
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-semibold">
                      {group.type === "multiple"
                        ? "Pilih Banyak"
                        : "Pilih Satu"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {optionsList.map((opt, optIdx) => {
                      const isSelected =
                        group.type === "multiple"
                          ? Array.isArray(currentSelection) &&
                            currentSelection.includes(opt.name)
                          : currentSelection === opt.name;

                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            handleSelectOption(
                              group.title,
                              group.type,
                              opt.name,
                            )
                          }
                          className={`py-3 px-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex justify-between items-center ${
                            isSelected
                              ? "border-[#5c1f2e] bg-[#5c1f2e] text-white shadow-sm"
                              : "border-[#e8ded2] bg-[#fcf9f5] text-[#5c1f2e] hover:bg-[#e8ded2]/30"
                          }`}
                        >
                          <span className="truncate pr-1">{opt.name}</span>
                          <span
                            className={`text-[10px] flex-shrink-0 ${
                              isSelected ? "text-amber-200" : "text-stone-400"
                            }`}
                          >
                            {opt.price > 0
                              ? `+${opt.price.toLocaleString("id-ID")}`
                              : "Free"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Catatan Tambahan */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Catatan untuk Barista / Dapur
            </h3>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Es dipisah, jangan pakai es, dll..."
              className="w-full px-4 py-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs sm:text-sm text-[#5c1f2e] focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
            />
          </div>
        </div>
      </div>

      {/* 3. STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e8ded2] p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4 max-w-2xl mx-auto w-full rounded-t-3xl sm:rounded-t-none">
        {/* Kontrol Jumlah */}
        <div className="flex items-center gap-3 bg-[#fcf9f5] border border-[#e8ded2] p-1.5 rounded-2xl">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 bg-white rounded-xl border border-[#e8ded2] font-bold text-base flex items-center justify-center hover:bg-[#e8ded2]/50 transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-6 text-center font-bold text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 bg-white rounded-xl border border-[#e8ded2] font-bold text-base flex items-center justify-center hover:bg-[#e8ded2]/50 transition-colors cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Tombol Add to Cart */}
        <button
          onClick={handleAdd}
          className="flex-1 py-3.5 sm:py-4 bg-[#5c1f2e] hover:bg-[#431420] text-white rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all active:scale-98 flex justify-between px-6 cursor-pointer"
        >
          <span>+ Tambah ke Keranjang</span>
          <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
        </button>
      </div>
    </div>
  );
}
