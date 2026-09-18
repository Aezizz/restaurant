import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CustomerMenu from "./pages/CustomerMenu";
import KitchenDashboard from "./pages/KitchenDashboard";
import AOS from "aos";
import "aos/dist/aos.css"; // Wajib import CSS-nya
import ResetPasswordPage from "./pages/ResetPasswordPage"; // Sesuaikan path foldernya ya kalau beda folder
import CashierOrderPage from "./pages/CashierOrderPage";
import AdminDashboard from "./pages/AdminDashboard";

import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800, // Durasi animasi (dalam milidetik)
      once: true, // Animasi cuma jalan sekali saat di-scroll ke bawah
      easing: "ease-in-out",
    });
  }, []);
  return (
    <Router>
      <Routes>
        {/* 1. Halaman Publik Bebas Akses */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 2. Rute Terproteksi: Layar Dapur (Admin & Kitchen) */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["admin", "kitchen"]}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        {/* 3. Rute Terproteksi: Kasir On-the-Spot (Admin & Cashier) */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <CashierOrderPage />
            </ProtectedRoute>
          }
        />

        {/* 4. Rute Terproteksi: Admin Control Panel (Khusus Admin Penuh) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 5. Fallback Route: Arahkan ke /menu */}
        <Route path="*" element={<CustomerMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
