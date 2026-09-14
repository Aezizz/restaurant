import React, { useState, useEffect } from "react";

export default function GreetingCard({
  menus = [],
  onSelectMenu,
  customerName,
  onCustomerNameChange,
}) {
  const [userName, setUserName] = useState("Kopi Lovers <3");
  const greetings = [
    "Udah cari penyemangat hari ini?",
    "Mau ngopi apa hari ini?",
    "Yuk cari yang seger-seger!",
  ];
  const [currentGreeting] = useState(
    greetings[Math.floor(Math.random() * greetings.length)],
  );
  const [randomMenu, setRandomMenu] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) setUserName(savedName);
  }, []);

  useEffect(() => {
    if (menus.length > 0) {
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
    /* 
      -mt-14 atau -mt-16 membuat kartu ini ditarik ke atas 
      sehingga menabrak/menimpa area bawah dari PromoCarousel.
    */
    <div className="relative z-20 -mt-14 sm:-mt-16 mx-4 sm:mx-6 bg-[#fcf9f5] p-5 sm:p-6 rounded-3xl border-2 border-[#e8ded2] shadow-xl space-y-4 overflow-hidden">
      {/* CSS Keyframes untuk Animasi Bintang Jatuh / Floating Sparkle */}
      <style>{`
        @keyframes floatStar {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.4; }
          50% { transform: translateY(-6px) scale(1.2); opacity: 1; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.4; }
        }
        @keyframes shootingStar {
          0% { transform: translate(15px, -15px) scale(0.5); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(-25px, 20px) scale(1); opacity: 0; }
        }
        .animate-float {
          animation: floatStar 3s ease-in-out infinite;
        }
        .animate-shooting {
          animation: shootingStar 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Elemen Dekorasi Animasi Bintang / Snowball di Pojok Kanan */}
      <div className="absolute top-4 right-5 pointer-events-none flex items-center space-x-1.5 opacity-80"></div>

      {/* Sapaan & Input Nama Pemesan */}
      <div className="flex justify-between items-start gap-3 relative z-10 flex-wrap sm:flex-nowrap">
        <div>
          <div className="w-70 h-9 rounded-xl flex items-center">
            <h2 className="text-sm sm:text-base font-bold font-serif tracking-wide text-[#5c1f2e]">
              HAI {userName} !
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-3">
            {currentGreeting}
          </p>
        </div>

        {/* Kotak Nama Pemesan */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#e8ded2] shadow-sm flex-shrink-0">
          <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase">
            NAMA PEMESAN:
          </span>
          <input
            type="text"
            value={customerName}
            onChange={onCustomerNameChange}
            placeholder="Masukkan Nama"
            className="w-28 sm:w-36 py-0.5 px-2 bg-[#fcf9f5] border border-[#e8ded2] rounded-xl text-xs sm:text-sm font-bold text-[#5c1f2e] focus:outline-none focus:ring-1 focus:ring-[#5c1f2e]"
          />
        </div>
      </div>

      {/* Menu Rekomendasi (Kotak Gambar di Kiri) */}
      {randomMenu && (
        <div
          onClick={() => onSelectMenu && onSelectMenu(randomMenu)}
          className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e8ded2] shadow-sm hover:border-[#5c1f2e] transition-colors cursor-pointer group"
        >
          <img
            src={
              randomMenu.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            }
            alt={randomMenu.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#e8ded2] flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Rekomendasi Hari Ini
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#5c1f2e] truncate block">
              {randomMenu.name}
            </span>
            <span className="text-xs text-stone-500 font-semibold">
              Rp {randomMenu.price?.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {/* Tombol COBA PESAN Besar */}
      <button
        onClick={() => {
          if (randomMenu && onSelectMenu) {
            onSelectMenu(randomMenu);
          }
        }}
        className="w-full py-3.5 bg-[#714336] hover:bg-[#5c1f2e] text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded-2xl transition-colors cursor-pointer shadow-md active:scale-95"
      >
        COBA PESAN
      </button>
    </div>
  );
}
