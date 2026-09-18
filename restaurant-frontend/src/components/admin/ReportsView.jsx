import React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { exportOrdersApi } from "../../services/api";
import { toast } from "react-toastify";

export default function ReportsView({
  weeklyStats,
  dailyStats,
  orders,
  token,
}) {
  const totalWeeklyRevenue = weeklyStats.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalWeeklyOrders = weeklyStats.reduce(
    (sum, item) => sum + (item.orderCount || 0),
    0
  );
  const averageOrderValue =
    totalWeeklyOrders > 0
      ? Math.round(totalWeeklyRevenue / totalWeeklyOrders)
      : 0;

  const handleExportSheets = async () => {
    try {
      const res = await exportOrdersApi(orders, token);
      if (res.success) {
        toast.success(res.message || "Laporan berhasil diekspor ke Google Sheets!");
      } else {
        toast.error(res.message || "Gagal mengekspor laporan.");
      }
    } catch (err) {
      toast.error("Gagal terhubung untuk ekspor.");
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Omzet 7 Hari
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
              Rp {totalWeeklyRevenue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Akumulasi 7 hari terakhir
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Pesanan 7 Hari
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
              {totalWeeklyOrders} Pesanan
            </h3>
            <p className="text-[11px] text-stone-400 font-medium mt-1">
              Volume transaksi masuk
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Rata-Rata Nilai Pesanan (AOV)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#5c1f2e]">
              Rp {averageOrderValue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Per transaksi pelanggan
            </p>
          </div>
        </div>
      </div>

      {/* Visualisasi Grafik Batang Mingguan */}
      <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#5c1f2e]">
              Grafik Penjualan 7 Hari Terakhir
            </h3>
            <p className="text-xs text-stone-400">
              Visualisasi tren omzet harian berdasarkan pesanan yang tercatat
            </p>
          </div>
          <button
            onClick={handleExportSheets}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Rekap ke Sheets</span>
          </button>
        </div>

        {/* Batang Grafik */}
        <div className="h-64 flex items-end justify-between gap-3 pt-10 px-4 border-b border-stone-200">
          {weeklyStats.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
            >
              {/* Tooltip Hover Nilai */}
              <div className="text-[10px] text-stone-700 font-bold bg-[#fcf9f5] px-2 py-0.5 rounded-md border border-[#e8ded2] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs">
                {item.amount} ({item.orderCount} order)
              </div>
              <div
                style={{ height: item.val }}
                className="w-full max-w-[48px] bg-[#5c1f2e] rounded-t-xl group-hover:bg-[#431420] transition-all shadow-xs"
              />
              <span className="text-xs font-bold text-stone-600 mt-2">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Rincian Data Harian */}
      <div className="bg-white p-6 rounded-3xl border border-[#e8ded2] shadow-xs">
        <h4 className="font-serif font-bold text-sm text-[#5c1f2e] mb-4">
          Tabel Rincian Omzet Harian
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8ded2] bg-[#fcf9f5]/70 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Hari</th>
                <th className="py-3 px-4">Jumlah Transaksi</th>
                <th className="py-3 px-4">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {weeklyStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#fcf9f5]/50">
                  <td className="py-3 px-4 text-stone-700">{item.date}</td>
                  <td className="py-3 px-4 font-bold text-stone-800">
                    {item.day}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {item.orderCount} pesanan
                  </td>
                  <td className="py-3 px-4 font-bold text-[#5c1f2e]">
                    Rp {(item.totalRevenue || 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
