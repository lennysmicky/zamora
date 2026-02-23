// src/api/client.js
import axios from "axios";
import env from "../config/env";
import useAuthStore from "../stores/authStore";

const API_URL = String(env.API_URL || "").replace(/\/+$/, "");
const API_TIMEOUT = Number(env.API_TIMEOUT) || 10000;

const client = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// ---------------- Request interceptor ----------------
client.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState?.()?.token;
    const lsToken = localStorage.getItem(env.TOKEN_KEY || "auth_token");
    const token = storeToken || lsToken;

    config.headers = config.headers ?? {};
    const h = config.headers;

    const setHeader = (k, v) => (h?.set ? h.set(k, v) : (h[k] = v));
    const delHeader = (k) => {
      if (h?.delete) h.delete(k);
      else {
        delete h[k];
        delete h[String(k).toLowerCase()];
      }
    };

    if (token) setHeader("Authorization", `Bearer ${token}`);

    // Content-Type : JSON seulement pour objets, sinon laisser Axios gérer (FormData)
    const d = config.data;
    const isForm = typeof FormData !== "undefined" && d instanceof FormData;

    if (isForm) {
      delHeader("Content-Type");
    } else if (d && typeof d === "object" && !Array.isArray(d)) {
      setHeader("Content-Type", "application/json");
    }

    if (env.DEBUG) console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- Response interceptor ----------------
client.interceptors.response.use(
  (response) => {
    if (env.DEBUG) console.log(`[${response.status}] ${response.config.url}`);
    return response;
  },
  async (error) => {
    const isCanceled =
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED" ||
      (typeof axios.isCancel === "function" && axios.isCancel(error));

    if (isCanceled) return Promise.reject(error);

    const originalRequest = error.config ?? {};
    const status = error.response?.status;

    if (env.DEBUG) {
      console.error(`[${status}] ${originalRequest?.url}`, error.message);
      console.error("API error payload:", error?.response?.data);
    }

    const isRefreshCall = (originalRequest?.url || "").includes("/auth/refresh");
    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data || {};
        if (!token) throw new Error("Refresh token response missing token");

        useAuthStore.getState().setToken(token);
        localStorage.setItem(env.TOKEN_KEY || "auth_token", token);

        originalRequest.headers = originalRequest.headers ?? {};
        if (originalRequest.headers?.set)
          originalRequest.headers.set("Authorization", `Bearer ${token}`);
        else originalRequest.headers.Authorization = `Bearer ${token}`;

        return client(originalRequest);
      } catch (refreshError) {
        const role = localStorage.getItem("user_role");

        useAuthStore.getState().logout?.();
        localStorage.removeItem(env.TOKEN_KEY || "auth_token");
        localStorage.removeItem(env.REFRESH_TOKEN_KEY || "refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("zamora-auth");

        window.location.href = role === "admin" ? "/admin/login" : "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper URLs images
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const upload = String(env.UPLOAD_URL || "").replace(/\/+$/, "");
  return `${upload}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default client;