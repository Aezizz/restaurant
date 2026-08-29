import React from "react";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onUpdateNotes,
  onCheckout,
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 pb-24 md:pb-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-[#e8ded2] pb-4 mb-4">
            <h2 className="text-xl font-bold font-serif">Keranjang Pesanan</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-center text-stone-400 text-xs py-8">
                Keranjang masih kosong.
              </p>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#fcf9f5] p-3 rounded-2xl border border-[#e8ded2]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-[#5c1f2e]/80">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-[#e8ded2]">
                      <button
                        onClick={() => onUpdateQuantity(index, -1)}
                        disabled={isSubmitting}
                        className="font-bold px-1 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(index, 1)}
                        disabled={isSubmitting}
                        className="font-bold px-1 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Input catatan per item */}
                  <input
                    type="text"
                    value={item.notes || ""}
                    disabled={isSubmitting}
                    onChange={(e) => onUpdateNotes(index, e.target.value)}
                    placeholder="Catatan (misal: jangan pedas)..."
                    className="w-full text-xs p-1.5 bg-white border border-[#e8ded2] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5c1f2e] disabled:opacity-50"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#e8ded2] pt-4 mt-4">
          <div className="flex justify-between items-center mb-4 text-lg font-bold">
            <span>Total:</span>
            <span className="text-[#5c1f2e]">
              Rp {calculateTotal().toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={onCheckout}
            disabled={isSubmitting || cart.length === 0}
            className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs ${
              isSubmitting || cart.length === 0
                ? "bg-stone-300 text-stone-500 cursor-not-allowed opacity-75"
                : "bg-[#5c1f2e] text-white hover:bg-[#431420] active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-stone-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Mengirim Pesanan...</span>
              </>
            ) : (
              "Kirim Pesanan ke Dapur 🚀"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
