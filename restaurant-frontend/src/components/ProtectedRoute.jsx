import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthToken, getUserRole } from "../utils/auth";

/**
 * Route Guard Component untuk mengecek autentikasi & autorisasi role
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Daftar role yang diizinkan (misal: ['admin'], ['admin', 'cashier'])
 * @param {React.ReactNode} [props.children]
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const token = getAuthToken();
  const userRole = getUserRole();

  // 1. Jika belum login sama sekali -> Redirect ke halaman /login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Jika sudah login tetapi role tidak memiliki izin
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Tentukan tujuan redirect berdasarkan role pengguna saat ini untuk menghindari loop
    let redirectPath = "/menu";
    let message = "Akses ditolak: Anda tidak memiliki izin mengakses halaman ini.";

    if (userRole === "cashier") {
      redirectPath = "/cashier";
      message = "Akses ditolak: Kasir tidak diizinkan mengakses Admin Dashboard.";
    } else if (userRole === "customer") {
      redirectPath = "/menu";
      message = "Akses ditolak: Pelanggan tidak diizinkan mengakses area staf.";
    }

    // Tampilkan notifikasi peringatan hanya sekali saat navigasi ditolak
    // (toast dapat dipanggil dalam component efek samping sebelum redirect)
    return <UnauthorizedRedirect to={redirectPath} message={message} />;
  }

  // 3. Jika lolos verifikasi peran
  return children ? <>{children}</> : <Outlet />;
}

/**
 * Helper component untuk menampilkan toast dan mengarahkan pengguna
 */
function UnauthorizedRedirect({ to, message }) {
  useEffect(() => {
    toast.warn(message, {
      toastId: "rbac-unauthorized", // Cegah duplicate toast
      autoClose: 3500,
    });
  }, [message]);

  return <Navigate to={to} replace />;
}
