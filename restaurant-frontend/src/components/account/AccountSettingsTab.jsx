import React from "react";
import { toast } from "react-toastify";

export default function AccountSettingsTab({ profileData, setProfileData }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-[#e8ded2] shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
        Ubah Informasi & Keamanan
      </h3>

      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1">
          Nama Tampilan
        </label>
        <input
          type="text"
          value={profileData.name}
          onChange={(e) =>
            setProfileData({ ...profileData, name: e.target.value })
          }
          className="w-full text-xs p-2.5 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1">
          Password Baru (Opsional)
        </label>
        <input
          type="password"
          placeholder="Kosongkan jika tidak diubah"
          value={profileData.newPassword}
          onChange={(e) =>
            setProfileData({ ...profileData, newPassword: e.target.value })
          }
          className="w-full text-xs p-2.5 bg-stone-50 border border-[#e8ded2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
        />
      </div>

      <button
        onClick={() =>
          toast.info(
            "Fitur pembaruan profil akan segera disinkronkan ke backend!",
          )
        }
        className="w-full py-2.5 bg-stone-800 text-white rounded-xl font-bold text-xs hover:bg-stone-900 transition-colors cursor-pointer"
      >
        Simpan Perubahan 💾
      </button>
    </div>
  );
}
