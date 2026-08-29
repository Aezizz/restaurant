import { useState, useEffect } from "react";

export default function ImageReveal({ src, alt }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          revealed ? "scale-100 blur-0" : "scale-110 blur-sm"
        }`}
      />
      {/* curtain overlay */}
      <div
        className={`absolute inset-0 bg-[#e8ded2] transition-transform duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)] origin-left ${
          revealed ? "scale-x-0" : "scale-x-100"
        }`}
      />
    </div>
  );
}
