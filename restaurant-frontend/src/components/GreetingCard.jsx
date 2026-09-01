import React, { useState, useEffect } from "react";

const GREETINGS = [
  "Mau ngopi apa hari ini?",
  "Udah ngopi belum?",
  "Yuk cari yang seger-seger!",
];

export default function GreetingCard({ menus = [], onSelectMenu }) {
  const [userName, setUserName] = useState("Kopi Lovers <3");
  const [currentGreeting] = useState(
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
  );
  const [randomMenu, setRandomMenu] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) setUserName(savedName);
  }, []);

  useEffect(() => {
    if (menus.length === 0) return;
    const drinks = menus.filter(
      (m) => m.category === "Coffee" || m.category === "Non-Coffee",
    );
    if (drinks.length > 0) {
      setRandomMenu(drinks[Math.floor(Math.random() * drinks.length)]);
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

      {randomMenu && (
        <div className="bg-[#fcf9f5] p-3 rounded-2xl border border-[#e8ded2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                randomMenu.image_url ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              }
              alt={randomMenu.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#e8ded2]"
            />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">
                Rekomendasi Hari Ini
              </p>
              <span className="text-xs font-bold text-[#5c1f2e] block">
                {randomMenu.name}
              </span>
              <span className="text-[11px] text-stone-500">
                Rp {randomMenu.price?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectMenu?.(randomMenu)}
            className="text-xs font-bold text-white bg-[#5c1f2e] px-3.5 py-2 rounded-xl hover:bg-[#431420] transition-colors cursor-pointer shadow-sm"
          >
            Coba Pesan 🚀
          </button>
        </div>
      )}
    </div>
  );
}
