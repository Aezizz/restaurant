import { io } from "socket.io-client";

// Helper untuk memastikan URL backend selalu mengarah ke port 3000 (baik via localhost maupun IP lokal LAN)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/:5173\/?$/, ":3000");
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();

export const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
});

