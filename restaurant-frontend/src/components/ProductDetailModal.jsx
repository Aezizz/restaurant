import React, { useState } from "react";

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  // State dinamis untuk menyimpan pilihan opsi per modifier group dari database
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Handle pemilihan opsi (support 'single' seperti radio/pilih satu atau 'multiple' seperti checkbox)
  const handleSelectOption = (groupTitle, option, type) => {
    if (type === "single") {
      setSelectedOptions({ ...selectedOptions, [groupTitle]: option });
    } else {
      const currentList = selectedOptions[groupTitle] || [];
      const exists = currentList.find((item) => item.name === option.name);

      let newList;
      if (exists) {
        newList = currentList.filter((item) => item.name !== option.name);
      } else {
        newList = [...currentList, option];
      }
      setSelectedOptions({ ...selectedOptions, [groupTitle]: newList });
    }
  };

  // Hitung total harga otomatis berdasarkan base price + tambahan harga dari modifier database
  const calculateFinalPrice = () => {
    let extraPerItem = 0;
    Object.values(selectedOptions).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((item) => (extraPerItem += item.price));
      } else if (val?.price) {
        extraPerItem += val.price;
      }
    });
    return (product.price + extraPerItem) * quantity;
  };

  const handleAdd = () => {
    // Rangkum seluruh catatan kustomisasi untuk dikirim ke keranjang & dapur
    const customizationDetails = Object.entries(selectedOptions)
      .map(([group, val]) => {
        if (Array.isArray(val)) {
          return val.map((v) => v.name).join(", ");
        }
        return val?.name ? val.name : "";
      })
      .filter(Boolean)
      .join(", ");

    let extraPerItem = 0;
    Object.values(selectedOptions).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((item) => (extraPerItem += item.price));
      } else if (val?.price) {
        extraPerItem += val.price;
      }
    });

    onAddToCart({
      ...product,
      price: product.price + extraPerItem,
      quantity: quantity,
      notes: customizationDetails
        ? `[${customizationDetails}] ${notes}`
        : notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pb-24 md:pb-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-zoom-in">
        {/* Gambar & Tombol Close */}
        <div className="relative h-48 sm:h-56 w-full bg-gray-100 flex-shrink-0">
          <img
            src={
              product.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-stone-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Konten Opsi Kustomisasi Dinamis */}
        <div
          className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1"
          style={{ touchAction: "pan-y" }}
        >
          <div>
            <span className="text-xs uppercase tracking-wider bg-[#e8ded2]/60 text-[#5c1f2e] px-2.5 py-1 rounded-md font-semibold">
              {product.category}
            </span>
            <h2 className="text-2xl font-serif font-bold mt-2">
              {product.name}
            </h2>
            <p className="text-lg font-bold text-[#5c1f2e] mt-1">
              Rp {product.price?.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              {product.description ||
                "Disajikan segar pilihan chef Vyna Coffee dengan kualitas bahan terbaik."}
            </p>
          </div>

          <hr className="border-[#e8ded2]" />

          {/* RENDER MODIFIER GROUPS SECARA DINAMIS DARI DATABASE */}
          {product.modifier_groups && product.modifier_groups.length > 0 ? (
            product.modifier_groups.map((group) => (
              <div key={group.title}>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  {group.title}{" "}
                  {group.type === "multiple" ? "(Bisa pilih >1)" : ""}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const isSelected =
                      group.type === "single"
                        ? selectedOptions[group.title]?.name === opt.name
                        : selectedOptions[group.title]?.some(
                            (item) => item.name === opt.name,
                          );

                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() =>
                          handleSelectOption(group.title, opt, group.type)
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between items-center cursor-pointer ${
                          isSelected
                            ? "bg-[#5c1f2e] text-white border-[#5c1f2e] shadow-sm"
                            : "bg-stone-50 text-stone-700 border-[#e8ded2] hover:bg-stone-100"
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.price > 0 && (
                          <span className="text-[10px] opacity-85">
                            (+{opt.price / 1000}k)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400 italic text-center py-2">
              Tidak ada opsi kustomisasi khusus untuk menu ini.
            </p>
          )}

          {/* CATATAN KHUSUS */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Catatan Khusus
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Jangan pakai bawang..."
              className="w-full text-xs p-2.5 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
            />
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-stone-50 border-t border-[#e8ded2] flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#e8ded2]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="font-bold px-1 text-sm cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-bold w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="font-bold px-1 text-sm cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3 bg-[#5c1f2e] text-white rounded-2xl font-bold text-xs hover:bg-[#431420] transition-colors cursor-pointer shadow-md"
          >
            Tambah • Rp {calculateFinalPrice().toLocaleString("id-ID")} 🛒
          </button>
        </div>
      </div>
    </div>
  );
}
