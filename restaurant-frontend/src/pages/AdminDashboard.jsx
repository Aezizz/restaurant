import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  History,
  LogOut,
  TrendingUp,
  Package,
  ShoppingCart,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchMenusApi,
  getDailyStatsApi,
  getWeeklyStatsApi,
  fetchOrdersApi,
} from "../services/api";
import { socket } from "../services/socket";

import MenuManagementView from "../components/admin/MenuManagementView";
import OrderHistoryView from "../components/admin/OrderHistoryView";
import ReportsView from "../components/admin/ReportsView";
import AdminLoginModal from "../components/admin/AdminLoginModal";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userToken") : ""
  );
  const [userName, setUserName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userName") || "Admin" : "Admin"
  );
  const [userRole, setUserRole] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userRole") || "customer" : "customer"
  );

  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 🔄 Ambil semua data ringkasan, menu, dan riwayat pesanan dari Backend
  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Ambil Menu (Publik)
      const menuRes = await fetchMenusApi();
      if (menuRes.success) {
        setMenus(menuRes.data || []);
      }

      // 2. Ambil Statistik Harian, Mingguan, dan Pesanan (Perlu Token)
      if (token) {
        try {
          const [dailyRes, weeklyRes, ordersRes] = await Promise.all([
            getDailyStatsApi(token),
            getWeeklyStatsApi(token),
            fetchOrdersApi(token),
          ]);

          if (dailyRes.success && dailyRes.data) {
            setDailyStats(dailyRes.data);
          }
          if (weeklyRes.success && weeklyRes.data) {
            setWeeklyStats(weeklyRes.data);
          }
          if (ordersRes.success && ordersRes.data) {
            setOrders(ordersRes.data);
          }
        } catch (authErr) {
          console.warn("Autentikasi admin diperlukan untuk beberapa metrik:", authErr);
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();

    // ⚡ Socket.io real-time update
    socket.on("new-order", () => {
      loadDashboardData();
    });

    socket.on("order-status-update", () => {
      loadDashboardData();
    });

    return () => {
      socket.off("new-order");
      socket.off("order-status-update");
    };
  }, [loadDashboardData]);

  // Handle Login Admin Sukses
  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setUserName(user.name || "Admin");
    setUserRole(user.role || "admin");
    toast.success(`Selamat datang kembali, ${user.name || "Admin"}! 👋`);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("customerName");
    setToken("");
    setUserName("Guest");
    setUserRole("customer");
    toast.info("Berhasil keluar akun.");
    window.location.href = "/";
  };

  // Recent 5 orders preview
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c1f2e] font-sans flex flex-col md:flex-row">
      <ToastContainer position="top-center" autoClose={3000} theme="light" />

      {/* 1. SIDEBAR (Kiri) */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e8ded2] p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Logo / Brand POS */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-[#5c1f2e] text-white rounded-2xl flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              V
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-wide">
                Vyna Coffee
              </h2>
              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                Admin Control Panel
              </p>
            </div>
          </div>

          {/* User Profile Card di Sidebar */}
          <div className="p-3 bg-[#fcf9f5] border border-[#e8ded2] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#5c1f2e] text-white flex items-center justify-center text-xs font-bold font-serif">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-800 line-clamp-1">
                  {userName}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#5c1f2e] text-white shadow-sm"
                  : "text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "menu"
                  ? "bg-[#5c1f2e] text-white shadow-sm"
                  : "text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e]"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Kelola Menu</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-[#5c1f2e] text-white shadow-sm"
                  : "text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e]"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Grafik & Laporan</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#5c1f2e] text-white shadow-sm"
                  : "text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e]"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Transaksi</span>
            </button>

            <div className="pt-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-stone-400 px-3">
              Akses Sistem Lain
            </div>
            <a
              href="/cashier"
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Halaman Kasir</span>
            </a>
            <a
              href="/menu"
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-[#fcf9f5] hover:text-[#5c1f2e] transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu Pelanggan</span>
            </a>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-[#e8ded2] flex flex-col gap-2">
          {!token ? (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5c1f2e] text-white rounded-2xl text-xs font-bold hover:bg-[#431420] transition-colors cursor-pointer shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Akun Admin</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. CONTENT AREA (Kanan) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header Ringkasan Halaman */}
          <div className="border-b border-[#e8ded2] pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-serif font-bold text-xl text-[#5c1f2e] capitalize">
                {activeTab === "dashboard" && "Dashboard / Ringkasan Utama"}
                {activeTab === "menu" && "Manajemen Kelola Menu"}
                {activeTab === "reports" && "Grafik & Laporan Penjualan"}
                {activeTab === "history" && "Riwayat Transaksi Pelanggan"}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Pantau performa penjualan dan operasional kedai secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#e8ded2] px-3.5 py-2 rounded-xl hover:bg-[#e8ded2]/40 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                title="Muat Ulang Data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-stone-600 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span>Segarkan</span>
              </button>

              <div className="text-xs font-semibold bg-white px-3.5 py-2 rounded-xl border border-[#e8ded2] shadow-xs">
                Status:{" "}
                <span className="text-emerald-600 font-bold">● Online</span>
              </div>
            </div>
          </div>

          {/* Banner Notifikasi jika belum login */}
          {!token && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Perhatian:</strong> Anda belum terautentikasi sebagai Admin. Masuk untuk mengelola menu dan melihat data transaksi lengkap.
                </span>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 bg-[#5c1f2e] text-white rounded-xl font-bold hover:bg-[#431420] transition-colors cursor-pointer shrink-0"
              >
                Masuk Admin
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD RINGKASAN UTAMA */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Tiga Kotak Metrik (Omzet, Produk, Transaksi) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Kotak 1: Total Omzet Hari Ini */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center text-stone-500 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Omzet Hari Ini
                    </span>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
                      Rp {(dailyStats.totalRevenue || 0).toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Data riil hari ini
                    </p>
                  </div>
                </div>

                {/* Kotak 2: Total Menu Aktif */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center text-stone-500 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Menu Aktif
                    </span>
                    <div className="p-2.5 bg-[#5c1f2e]/10 text-[#5c1f2e] rounded-2xl">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
                      {menus.length} Menu
                    </h3>
                    <p className="text-[11px] text-stone-400 font-medium mt-1">
                      Tersedia di katalog POS
                    </p>
                  </div>
                </div>

                {/* Kotak 3: Total Transaksi */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center text-stone-500 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Transaksi
                    </span>
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
                      {dailyStats.totalOrders || 0} Pesanan
                    </h3>
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">
                      Pesanan masuk hari ini
                    </p>
                  </div>
                </div>
              </div>

              {/* Grafik Batang Penjualan Mingguan */}
              <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#5c1f2e]">
                      Grafik Batang Penjualan Mingguan
                    </h3>
                    <span className="text-xs text-stone-400 font-medium">
                      Periode: 7 Hari Terakhir
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className="text-xs font-bold text-[#5c1f2e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Laporan Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visualisasi Grafik Batang Dinamis */}
                <div className="h-64 flex items-end justify-between gap-3 pt-8 px-4 border-b border-stone-200">
                  {weeklyStats.length > 0 ? (
                    weeklyStats.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                      >
                        <div className="text-[10px] text-stone-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-[#fcf9f5] px-2 py-0.5 rounded-md border border-[#e8ded2] whitespace-nowrap shadow-xs">
                          {item.amount}
                        </div>
                        <div
                          style={{ height: item.val }}
                          className="w-full max-w-[42px] bg-[#5c1f2e] rounded-t-xl group-hover:bg-[#431420] transition-all shadow-xs cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-500 mt-2">
                          {item.day}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                      Memuat grafik data penjualan...
                    </div>
                  )}
                </div>
              </div>

              {/* Pintasan Cepat & Pesanan Terbaru */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aksi Pintas */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#5c1f2e] mb-1">
                      Aksi Pintas Cepat
                    </h3>
                    <p className="text-xs text-stone-400">
                      Kelola operasional harian dalam satu klik
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTab("menu")}
                      className="w-full py-2.5 px-4 bg-[#5c1f2e] text-white rounded-2xl text-xs font-bold hover:bg-[#431420] transition-colors flex items-center justify-between cursor-pointer shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Menu Baru
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="w-full py-2.5 px-4 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Lihat Semua Transaksi
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href="/kitchen"
                      className="w-full py-2.5 px-4 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Buka Layar Dapur (KDS)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Daftar 5 Pesanan Terbaru */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-serif font-bold text-sm text-[#5c1f2e]">
                        Pesanan Masuk Terbaru
                      </h3>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="text-xs font-bold text-[#5c1f2e] hover:underline"
                      >
                        Lihat Semua ({orders.length})
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((ord) => (
                          <div
                            key={ord._id}
                            className="py-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#5c1f2e] bg-[#5c1f2e]/10 px-2 py-0.5 rounded-lg text-[11px]">
                                #{String(ord.queue_number || 0).padStart(3, "0")}
                              </span>
                              <div>
                                <span className="font-bold text-stone-800 block">
                                  {ord.customer_name || "Guest"}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {ord.items?.length || 0} item •{" "}
                                  {ord.created_at
                                    ? new Date(ord.created_at).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-stone-800 block">
                                Rp {(ord.total_price || 0).toLocaleString("id-ID")}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase ${
                                  ord.status === "completed"
                                    ? "text-emerald-600"
                                    : ord.status === "cooking"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                }`}
                              >
                                ● {ord.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 py-6 text-center">
                          Belum ada transaksi hari ini.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELOLA MENU (CRUD) */}
          {activeTab === "menu" && (
            <MenuManagementView
              menus={menus}
              onRefreshMenus={loadDashboardData}
              token={token}
            />
          )}

          {/* TAB 3: GRAFIK & LAPORAN */}
          {activeTab === "reports" && (
            <ReportsView
              weeklyStats={weeklyStats}
              dailyStats={dailyStats}
              orders={orders}
              token={token}
            />
          )}

          {/* TAB 4: RIWAYAT TRANSAKSI */}
          {activeTab === "history" && (
            <OrderHistoryView
              orders={orders}
              onRefreshOrders={loadDashboardData}
              token={token}
            />
          )}
        </div>
      </main>

      {/* Modal Autentikasi Login Admin Cepat */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
