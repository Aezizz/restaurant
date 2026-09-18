import React from "react";
import { Link } from "react-router-dom";
import ImageReveal from "../components/ImageReveal";
import useTypewriter from "../hooks/useTypewriter";

export default function LandingPage() {
  const welcomeText = useTypewriter("WELCOME", 50, 0);
  const toText = useTypewriter("TO", 50, 300);
  const vynaText = useTypewriter("Vyna", 50, 600);
  const coffeeText = useTypewriter("Coffee", 50, 900);

  // cursor cuma nyala selama typewriter "Coffee" masih jalan
  const isTypingDone = coffeeText.length === "Coffee".length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#e8ded2]">
      {/* Bagian Gambar */}
      <div className="absolute top-0 right-0 h-full w-full md:w-[50%] lg:w-[55%] z-0">
        <ImageReveal
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop"
          alt="Suasana Restoran Vyna Coffee"
        />
        {/* Tambahan overlay gelap tipis khusus mobile biar gambar di belakang tidak terlalu terang */}
        <div className="absolute inset-0 bg-black/30 md:hidden z-10" />
      </div>

      {/* Bagian Teks dengan Glassmorphism Wrapper untuk Mobile */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center md:items-start px-6 md:px-16">
        {/* Kotak Glassmorphism: Di HP pakai background blur transparan biar teks terbaca jelas, di desktop (md:) dibuat transparan polos */}
        <div className="p-6 md:p-0 rounded-3xl md:rounded-none bg-stone-900/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border border-white/10 md:border-none shadow-2xl md:shadow-none max-w-md w-full text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-wide mb-6 md:mb-8 leading-[1.1] whitespace-nowrap">
            <span className="text-[#f5ebd0] md:text-[#5c1f2e] drop-shadow-md">
              {welcomeText}
            </span>
            <br />
            <span className="text-[#f5ebd0] md:text-[#5c1f2e] ml-4 sm:ml-8 md:ml-12 lg:ml-20 drop-shadow-md my-4 md:my-6 lg:my-8">
              {toText}
            </span>
            <br />
            <span className="text-[#f5ebd0] md:text-[#5c1f2e] ml-8 sm:ml-12 md:ml-18 drop-shadow-md">
              {vynaText}
            </span>{" "}
            <span className="text-amber-200 md:text-white font-bold drop-shadow-md">
              {coffeeText}
            </span>
            {!isTypingDone && (
              <span className="animate-blink border-r-4 border-amber-200 md:border-[#5c1f2e] ml-1"></span>
            )}
          </h1>

          {/* Tombol Our Menu & Login */}
          <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
            <Link
              to="/menu"
              className="inline-block rounded-full px-8 md:px-12 py-3 bg-white text-[#5c1f2e] font-semibold shadow-xl hover:bg-[#5c1f2e] hover:text-white transition-all duration-150 relative overflow-visible cursor-pointer text-sm md:text-base"
            >
              OUR MENU
              <span className="absolute inset-0 rounded-full animate-ping bg-white/60 -z-10 pointer-events-none" />
            </Link>
            <Link
              to="/login"
              className="inline-block rounded-full px-6 md:px-8 py-3 bg-black/30 md:bg-white/60 backdrop-blur-sm text-white md:text-[#5c1f2e] border border-white/20 md:border-[#5c1f2e]/20 font-semibold shadow-md hover:bg-[#5c1f2e] hover:text-white transition-all duration-150 cursor-pointer text-sm md:text-base"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
