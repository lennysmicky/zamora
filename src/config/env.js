// src/config/env.js
const trimSlash = (s) => String(s || "").replace(/\/+$/, "");

const env = {
  // API
  API_URL: trimSlash(import.meta.env.VITE_API_URL || "https://resto-back-xazy.onrender.com/api/"),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // Upload
  UPLOAD_URL: trimSlash(import.meta.env.VITE_UPLOAD_URL),
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],

  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || "Zamora",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Debug
  DEBUG: String(import.meta.env.VITE_DEBUG || "false").toLowerCase() === "true",

  // Environment
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,

  // Auth Keys
  TOKEN_KEY: "auth_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  USER_KEY: "user_data",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],

  // ============================================
  //  PUSHER -
  // ============================================
  PUSHER_KEY: import.meta.env.VITE_PUSHER_KEY || "",
  PUSHER_CLUSTER: import.meta.env.VITE_PUSHER_CLUSTER || "mt1",
  
  // VAPID pour Push Notifications (optionnel)
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || "",
};

// Debug au démarrage
if (env.DEBUG) {
  console.log(" Config loaded:", { 
    API_URL: env.API_URL, 
    MODE: env.MODE,
    PUSHER_KEY: env.PUSHER_KEY ? " Défini" : " Manquant",
    PUSHER_CLUSTER: env.PUSHER_CLUSTER,
  });
}

export default env;