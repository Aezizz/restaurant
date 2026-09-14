import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CustomerMenu from "./pages/CustomerMenu";
import KitchenDashboard from "./pages/KitchenDashboard";
import AOS from "aos";
import "aos/dist/aos.css"; // Wajib import CSS-nya
import ResetPasswordPage from "./pages/ResetPasswordPage"; // Sesuaikan path foldernya ya kalau beda folder
import CashierOrderPage from "./pages/CashierOrderPage";

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
        {/* Halaman Pembuka / Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Halaman Menu Pelanggan */}
        <Route path="/menu" element={<CustomerMenu />} />

        {/*Forgot Password Page  */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Halaman Dapur / Kasir */}
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/cashier" element={<CashierOrderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
