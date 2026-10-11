export const handleUnauthorized = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
  alert("Sesi Anda telah habis, silakan masuk kembali.");
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("userToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  return response;
};
