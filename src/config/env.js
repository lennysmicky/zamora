const trimSlash = (s) => String(s || "").replace(/\/+$/, "");

const env = {
  API_URL: trimSlash(import.meta.env.VITE_API_URL || "https://resto-back-xazy.onrender.com/api/"),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,

  UPLOAD_URL: trimSlash(import.meta.env.VITE_UPLOAD_URL),
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],

  APP_NAME: import.meta.env.VITE_APP_NAME || "Zamora",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  DEBUG: String(import.meta.env.VITE_DEBUG || "false").toLowerCase() === "true",

  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,

  TOKEN_KEY: "auth_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  USER_KEY: "user_data",

  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

if (env.DEBUG) console.log("Config loaded:", { API_URL: env.API_URL, MODE: env.MODE });

export default env;