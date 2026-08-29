import React from "react";
import "material-symbols-rc/css";

export default function BottomNav({
  cartItemCount,
  onOpenCart,
  onOpenNotif,
  onOpenAccount,
  onGoHome,
  activeMenu,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8ded2] py-2.5 px-6 flex justify-around items-center shadow-lg md:hidden">
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center cursor-pointer transition-colors ${
          activeMenu === "home" ? "text-[#5c1f2e]" : "text-stone-400"
        }`}
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-semibold mt-0.5">Home</span>
      </button>

      <button
        onClick={onOpenCart}
        className={`flex flex-col items-center relative cursor-pointer transition-colors ${
          activeMenu === "cart" ? "text-[#5c1f2e]" : "text-stone-400"
        }`}
      >
        <span className="material-symbols-outlined">
          shopping_cart_checkout
        </span>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-[#5c1f2e] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {cartItemCount}
          </span>
        )}
        <span className="text-[10px] font-semibold mt-0.5">Keranjang</span>
      </button>

      <button
        onClick={onOpenNotif}
        className={`flex flex-col items-center cursor-pointer transition-colors ${
          activeMenu === "notif" ? "text-[#5c1f2e]" : "text-stone-400"
        }`}
      >
        <span className="material-symbols-outlined">notifications_active</span>
        <span className="text-[10px] font-semibold mt-0.5">Notif</span>
      </button>

      <button
        onClick={onOpenAccount}
        className={`flex flex-col items-center cursor-pointer transition-colors ${
          activeMenu === "account" ? "text-[#5c1f2e]" : "text-stone-400"
        }`}
      >
        <span className="material-symbols-outlined">emoji_people</span>
        <span className="text-[10px] font-semibold mt-0.5">Akun</span>
      </button>
    </div>
  );
}
