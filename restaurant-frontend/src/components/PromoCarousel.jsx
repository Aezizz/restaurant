import React, { useState, useEffect, useRef } from "react";

const promoList = [
  {
    id: 1,
    title: "2 Botol 1L",
    subtitle: "Mulai dari Rp 129K",
    bg: "bg-gradient-to-r from-emerald-800 to-emerald-950",
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Diskon Spesial Pagi",
    subtitle: "Hemat hingga 30% Kopi Susu",
    bg: "bg-gradient-to-r from-amber-800 to-amber-950",
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Menu Baru: Croissant",
    subtitle: "Teman ngopi paling pas hari ini",
    bg: "bg-gradient-to-r from-stone-800 to-stone-950",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
  },
];

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % promoList.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth;
          scrollRef.current.scrollTo({
            left: cardWidth * nextIndex,
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mb-8">
      {/* Layout Grid: Di laptop jadi 3 kolom (2 kolom untuk banner di kiri, 1 kolom sisa di kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Kolom Banner (Memakan 2 kolom di kiri pada layar desktop) */}
        <div className="md:col-span-2">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-1 py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {promoList.map((promo) => (
              <div
                key={promo.id}
                className={`min-w-full h-40 md:h-48 rounded-2xl p-6 text-white flex justify-between items-center relative overflow-hidden shadow-md snap-center flex-shrink-0 ${promo.bg}`}
              >
                {/* Teks Promo */}
                <div className="z-10 max-w-[60%]">
                  <span className="text-[10px] md:text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                    Promo Vyna
                  </span>
                  <h3 className="text-lg md:text-2xl font-bold mt-2">
                    {promo.title}
                  </h3>
                  <p className="text-xs md:text-sm text-stone-200 mt-1 font-semibold">
                    {promo.subtitle}
                  </p>
                </div>

                {/* Gambar Ilustrasi */}
                <div className="absolute right-0 bottom-0 top-0 w-[45%] h-full">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Indikator Titik (Dots) */}
          <div className="flex justify-center md:justify-start md:pl-2 gap-1.5 mt-3">
            {promoList.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-6 bg-[#5c1f2e]"
                    : "w-1.5 bg-stone-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Space Kosong di Kanan (Siap dipakai buat widget/fitur lain nanti) */}
        <div className="hidden md:flex flex-col justify-center items-center h-48 bg-[#fcf9f5] border border-dashed border-[#e8ded2] rounded-2xl p-5 text-center text-stone-400">
          <span className="text-2xl mb-1">✨</span>
          <p className="text-xs font-semibold">Space Kosong</p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Siap diisi widget / info kafe
          </p>
        </div>
      </div>
    </div>
  );
}
