import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, Sparkles } from "lucide-react";
import MenuFormModal from "./MenuFormModal";
import ConfirmModal from "../ConfirmModal";
import { createMenuApi, updateMenuApi, deleteMenuApi } from "../../services/api";
import { toast } from "react-toastify";

const CATEGORIES = [
  "Semua",
  "Coffee",
  "Non-Coffee",
  "Makanan Berat",
  "Makanan Ringan",
];

export default function MenuManagementView({ menus, onRefreshMenus, token }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    menuId: null,
    menuName: "",
  });

  // Filter Menu
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || menu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingMenu) {
        // Edit Menu
        const res = await updateMenuApi(editingMenu._id, formData, token);
        if (res.success) {
          toast.success(`Menu "${formData.name}" berhasil diperbarui!`);
          setIsModalOpen(false);
          onRefreshMenus();
        } else {
          toast.error(res.message || "Gagal memperbarui menu.");
        }
      } else {
        // Tambah Menu
        const res = await createMenuApi(formData, token);
        if (res.success) {
          toast.success(`Menu "${formData.name}" berhasil ditambahkan!`);
          setIsModalOpen(false);
          onRefreshMenus();
        } else {
          toast.error(res.message || "Gagal menambahkan menu.");
        }
      }
    } catch (err) {
      console.error("Error submit menu:", err);
      toast.error("Terjadi kesalahan koneksi atau token tidak valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.menuId) return;
    try {
      const res = await deleteMenuApi(deleteConfirm.menuId, token);
      if (res.success) {
        toast.success(res.message || "Menu berhasil dihapus!");
        onRefreshMenus();
      } else {
        toast.error(res.message || "Gagal menghapus menu.");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      toast.error("Gagal menghapus menu.");
    } finally {
      setDeleteConfirm({ isOpen: false, menuId: null, menuName: "" });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Bar Atas: Search, Filter, & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-3xl border border-[#e8ded2] shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Input Pencarian */}
          <div className="relative flex items-center min-w-[220px]">
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full pl-10 pr-3 py-2 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5c1f2e]"
            />
          </div>

          {/* Filter Kategori */}
          <div className="flex overflow-x-auto gap-1.5 scrollbar-none py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#5c1f2e] text-white shadow-xs"
                    : "bg-[#fcf9f5] text-stone-600 hover:bg-[#e8ded2]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Tambah Menu */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5c1f2e] text-white rounded-2xl text-xs font-bold hover:bg-[#431420] transition-colors shadow-sm cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Grid Tabel / Kartu Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenus.length > 0 ? (
          filteredMenus.map((menu) => (
            <div
              key={menu._id}
              className="bg-white rounded-3xl border border-[#e8ded2] p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-36 rounded-2xl overflow-hidden bg-stone-100 mb-3 relative">
                  <img
                    src={
                      menu.image_url ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                    }
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#5c1f2e] rounded-lg shadow-xs">
                    {menu.category}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-sm text-stone-800 line-clamp-1">
                  {menu.name}
                </h4>
                <p className="text-xs font-bold text-[#5c1f2e] mt-1">
                  Rp {(menu.price || 0).toLocaleString("id-ID")}
                </p>
                {menu.description && (
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {menu.description}
                  </p>
                )}
              </div>

              {/* Tombol Aksi Edit & Hapus */}
              <div className="flex items-center gap-2 pt-4 mt-3 border-t border-stone-100">
                <button
                  onClick={() => handleOpenEditModal(menu)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      isOpen: true,
                      menuId: menu._id,
                      menuName: menu.name,
                    })
                  }
                  className="flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-[#e8ded2] text-center flex flex-col items-center justify-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-stone-300" />
            <h4 className="font-serif font-bold text-sm text-stone-600">
              Tidak ada menu yang ditemukan
            </h4>
            <p className="text-xs text-stone-400">
              Coba sesuaikan kata kunci pencarian atau kategori filter Anda.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingMenu}
        isSubmitting={isSubmitting}
      />

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Hapus Menu Produk?"
        message={`Apakah Anda yakin ingin menghapus menu "${deleteConfirm.menuName}" dari katalog? Tindakan ini akan dicatat ke Audit Trail.`}
        confirmText="Ya, Hapus"
        onClose={() =>
          setDeleteConfirm({ isOpen: false, menuId: null, menuName: "" })
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
