/**
 * Utility helper untuk mengelola otentikasi & perutean berbasis peran (RBAC)
 */

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken");
};

export const getUserRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userRole") || "customer";
};

export const getUserName = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userName") || "User";
};

export const isAuthenticated = () => {
  return Boolean(getAuthToken());
};

/**
 * Mendapatkan URL redirect yang sesuai berdasarkan role user setelah login
 * @param {string} role
 * @returns {string} URL path tujuan
 */
export const getRedirectPathByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "cashier":
      return "/cashier";
    case "customer":
    default:
      return "/menu";
  }
};

/**
 * Menyimpan sesi autentikasi ke localStorage
 * @param {Object} param0
 * @param {string} param0.token
 * @param {string} param0.name
 * @param {string} param0.role
 */
export const saveAuthSession = ({ token, name, role }) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("userToken", token);
  if (name) localStorage.setItem("userName", name);
  if (role) localStorage.setItem("userRole", role);
};

/**
 * Menghapus sesi autentikasi dari localStorage
 */
export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
};
