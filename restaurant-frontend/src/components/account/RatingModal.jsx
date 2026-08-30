import React from "react";

export default function RatingModal({
  isOpen,
  onClose,
  selectedOrderForRating,
  ratingScore,
  setRatingScore,
  ratingComment,
  setRatingComment,
  submitRating,
  submittingRating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-[#e8ded2]">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-[#5c1f2e]">
            Beri Ulasan Pesanan #{selectedOrderForRating?.queue_number}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pilihan Bintang */}
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRatingScore(star)}
              className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                star <= ratingScore ? "text-amber-400" : "text-stone-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-stone-600">
          {ratingScore === 5
            ? "Sempurna! Luar biasa 🤩"
            : ratingScore === 4
              ? "Puas banget! 👍"
              : ratingScore === 3
                ? "Cukup baik 🙂"
                : ratingScore === 2
                  ? "Kurang memuaskan 🙁"
                  : "Buruk 😞"}
        </p>

        {/* Kolom Komentar */}
        <div>
          <label className="text-[11px] font-bold text-stone-600 block mb-1">
            Kesan & Pesan (Opsional)
          </label>
          <textarea
            rows="3"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Bagaimana rasa kopinya? Tulis ulasanmu di sini..."
            className="w-full text-xs p-3 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e] resize-none"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={submittingRating}
            onClick={submitRating}
            className="flex-1 py-2.5 bg-[#5c1f2e] text-white rounded-xl font-bold text-xs hover:bg-[#431420] transition-colors cursor-pointer shadow-sm"
          >
            {submittingRating ? "Menyimpan..." : "Kirim Ulasan 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
