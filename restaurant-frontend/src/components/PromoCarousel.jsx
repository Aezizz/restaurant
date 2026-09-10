import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

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
  {
    id: 4,
    title: "Dapatkan Diskon Hanya Dengan Log-In",
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
    /* 
      Padding bawah diperkecil (pb-14) agar lengkungannya pas 
      dan tidak meninggalkan sisa ruang hijau kosong di bawah dots.
    */
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center md:px-6">
      <div className="md:col-span-2 w-full relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promoList.map((promo) => (
            <div
              key={promo.id}
              className={`w-full min-w-full h-64 sm:h-72 md:h-80 rounded-none md:rounded-3xl  p-6 md:p-10 text-white flex justify-between items-center relative overflow-hidden snap-center flex-shrink-0 ${promo.bg}`}
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

        {/* Indikator Titik (Dots) diposisikan absolute di atas lengkungan bawah */}
        <div className="absolute top-5 left-0 right-0 flex justify-center gap-1.5 z-20">
          {promoList.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Space Kosong di Kanan (Desktop) */}
      <div className="hidden md:flex flex-col justify-center items-center h-48 bg-[#fcf9f5]/10 border border-dashed border-white/20 rounded-2xl p-5 text-center text-white/70">
        <Sparkles className="w-6 h-6 mb-1 text-amber-200" />
        <p className="text-xs font-semibold">Space Kosong</p>
        <p className="text-[10px] text-white/50 mt-0.5">
          Siap diisi widget / info kafe
        </p>
      </div>
    </div>
  );
}
