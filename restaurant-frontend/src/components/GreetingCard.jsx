import React, { useState, useEffect } from "react";

export default function GreetingCard({ menus = [], onSelectCategory }) {
  const [userName, setUserName] = useState("Kopi Lovers <3");

  const greetings = [
    "Mau ngopi apa hari ini?",
    "Udah ngopi belum?",
    "Yuk cari yang seger-seger!",
  ];

  const [currentGreeting] = useState(
    greetings[Math.floor(Math.random() * greetings.length)],
  );

  // State untuk menyimpan satu menu random pilihan dari database
  const [randomMenu, setRandomMenu] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Setiap kali data menus dari database berhasil di-fetch, pilih satu menu random khusus Coffee / Non-Coffee
  useEffect(() => {
    if (menus.length > 0) {
      // Filter hanya menu yang kategorinya Coffee atau Non-Coffee
      const coffeeAndDrinks = menus.filter(
        (m) => m.category === "Coffee" || m.category === "Non-Coffee",
      );

      if (coffeeAndDrinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * coffeeAndDrinks.length);
        setRandomMenu(coffeeAndDrinks[randomIndex]);
      }
    }
  }, [menus]);

  return (
    <div className="bg-white p-5 rounded-3xl border border-[#e8ded2] shadow-sm mb-6 space-y-3">
      <div>
        <h2 className="text-base font-bold font-serif text-[#5c1f2e]">
          Halo, {userName} 👋
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">{currentGreeting}</p>
      </div>

      {/* Kotak Rekomendasi Menu dari Database */}
      {randomMenu && (
        <div className="bg-[#fcf9f5] p-3 rounded-2xl border border-[#e8ded2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                randomMenu.image_url ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              }
              alt={randomMenu.name}
              className="w-20 h-20 rounded-xl object-cover border border-[#e8ded2]"
            />
            <div>
              <p className="text-[12px] uppercase font-bold text-stone-400 mb-3">
                Rekomendasi Hari Ini
              </p>
              <span className="text-[15px] font-bold text-[#5c1f2e] block">
                {randomMenu.name}
              </span>
              <span className="text-[15px] text-stone-500">
                Rp {randomMenu.price?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectCategory) {
                // Langsung filter kategori menu tersebut saat diklik
                onSelectCategory(randomMenu.category);
              }
            }}
            className="text-[12px] font-bold text-white bg-[#5c1f2e] px-3.5 py-2 rounded-xl hover:bg-[#431420] transition-colors cursor-pointer shadow-sm"
          >
            Pesan
          </button>
        </div>
      )}
    </div>
  );
}
