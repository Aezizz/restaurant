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

/**
 * Mengecek apakah token JWT memiliki format valid dan belum kedaluwarsa
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return false;
    // decoded.exp dalam detik, bandingkan dengan Date.now() dalam ms
    return decoded.exp * 1000 <= Date.now();
  } catch (err) {
    return true;
  }
};

/**
 * Memeriksa status autentikasi aktif.
 * Mengembalikan true jika token ada dan belum kedaluwarsa.
 * Jika token sudah kedaluwarsa, sesi dibersihkan otomatis.
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAuthSession();
    return false;
  }
  return true;
};

/**
 * Validasi sesi saat ini: membersihkan sesi jika token expired
 * @returns {boolean} true jika sesi valid, false jika invalid/expired
 */
export const validateSession = () => {
  return isAuthenticated();
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
  if (name) {
    localStorage.setItem("userName", name);
    localStorage.setItem("customerName", name);
  }
  if (role) localStorage.setItem("userRole", role);
};

/**
 * Menghapus seluruh data sesi autentikasi dari localStorage
 */
export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
  localStorage.removeItem("customerName");
};

