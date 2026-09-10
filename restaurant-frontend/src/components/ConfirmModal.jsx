import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi",
  message,
  onConfirm,
  onClose,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-zoom-in border border-[#e8ded2]">
        {/* Ikon / Header */}
        <div className="w-12 h-12 bg-[#5c1f2e]/10 text-[#5c1f2e] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-[#5c1f2e]" />
        </div>

        <h3 className="text-lg font-bold font-serif text-[#5c1f2e] mb-2">
          {title}
        </h3>
        <p className="text-xs text-stone-600 mb-6 leading-relaxed">{message}</p>

        {/* Tombol Aksi */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-semibold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#5c1f2e] text-white rounded-xl font-semibold text-xs hover:bg-[#431420] transition-colors cursor-pointer shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
