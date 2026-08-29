import React, { useState, useEffect, useRef } from "react";

// Data dummy promo/menu baru Vyna Coffee
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

  // Efek Automatic Scroll tiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % promoList.length;

        // Geser posisi container scroll secara halus
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth;
          scrollRef.current.scrollTo({
            left: cardWidth * nextIndex,
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    }, 3500); // Ganti slide tiap 3.5 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mb-6">
      {/* Container Banner (Horizontal Scroll) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-4 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {promoList.map((promo, index) => (
          <div
            key={promo.id}
            className={`min-w-full sm:min-w-[85%] h-44 rounded-2xl p-5 text-white flex justify-between items-center relative overflow-hidden shadow-lg snap-center flex-shrink-0 ${promo.bg}`}
          >
            {/* Teks Promo */}
            <div className="z-10 max-w-[55%]">
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                Promo Vyna
              </span>
              <h3 className="text-xl font-bold mt-2">{promo.title}</h3>
              <p className="text-sm text-emerald-200 mt-1 font-semibold">
                {promo.subtitle}
              </p>
            </div>
            {/* Gambar Ilustrasi Promo di Kanan */}
            <div className="absolute right-0 bottom-0 top-0 w-[45%] h-full">
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover opacity-80 mask-image-gradient"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Indikator Titik (Dots) */}
      <div className="flex justify-center gap-1.5 mt-3">
        {promoList.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === index ? "w-6 bg-[#5c1f2e]" : "w-1.5 bg-stone-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
