// src/api/client.js
import axios from "axios";
import env from "../config/env";
import useAuthStore from "../stores/authStore";

// ✅ normaliser (évite trailing slash -> double //)
const API_URL = String(env.API_URL || "").replace(/\/+$/, "");
const API_TIMEOUT = Number(env.API_TIMEOUT) || 20000;

const client = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    // ⚠️ ne pas figer Content-Type globalement (FormData)
    Accept: "application/json",
  },
});

// ---------------- mapping helpers ----------------
const isPlainObject = (v) =>
  v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  !(v instanceof FormData) &&
  !(v instanceof Blob) &&
  !(v instanceof ArrayBuffer);

const cloneIfPlain = (v) => (isPlainObject(v) ? { ...v } : v);

/**
 * Front => Back
 * - restaurantId (front) -> restaurentId (back)
 * - restaurant (admin filter) -> restaurentId (back) si besoin
 */
const mapFrontToBack = (obj) => {
  if (!isPlainObject(obj)) return obj;

  const next = { ...obj };

  if (next.restaurant && !next.restaurentId) {
    next.restaurentId = next.restaurant;
    // optionnel mais safe: éviter d'envoyer 2 champs
    delete next.restaurant;
  }

  if (Object.prototype.hasOwnProperty.call(next, "restaurantId")) {
    if (!Object.prototype.hasOwnProperty.call(next, "restaurentId")) {
      next.restaurentId = next.restaurantId;
    }
    delete next.restaurantId;
  }

  return next;
};

/**
 * Back => Front (optionnel mais recommandé)
 * - restaurentId (back) -> restaurantId (front)
 */
const mapBackToFront = (data) => {
  if (!isPlainObject(data)) return data;

  const next = { ...data };

  if (Object.prototype.hasOwnProperty.call(next, "restaurentId")) {
    if (!Object.prototype.hasOwnProperty.call(next, "restaurantId")) {
      next.restaurantId = next.restaurentId;
    }
    // garde restaurentId si tu veux debug
    // delete next.restaurentId;
  }

  return next;
};

// ---------------- Request interceptor ----------------
client.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState?.()?.token;
    const lsToken = localStorage.getItem("auth_token");
    const token = storeToken || lsToken;

    config.headers = config.headers ?? {};

    // ✅ headers compatibles AxiosHeaders (v1)
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

    // ✅ MAPPING (sans muter les refs)
    if (config.params) config.params = mapFrontToBack(cloneIfPlain(config.params));

    const d = config.data;

    // ✅ Content-Type : JSON uniquement pour plain object, sinon laisser Axios gérer (FormData)
    const isForm =
      typeof FormData !== "undefined" && d instanceof FormData;

    if (isForm) {
      delHeader("Content-Type");
    } else if (isPlainObject(d)) {
      setHeader("Content-Type", "application/json");
      config.data = mapFrontToBack(cloneIfPlain(d));
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

    // Optionnel: normaliser la réponse (si backend renvoie restaurentId)
    if (isPlainObject(response.data)) {
      response.data = mapBackToFront(response.data);
    }

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

    if (env.DEBUG) console.error(`[${status}] ${originalRequest?.url}`, error.message);

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
        localStorage.setItem("auth_token", token);

        originalRequest.headers = originalRequest.headers ?? {};
        // compat AxiosHeaders
        if (originalRequest.headers?.set) originalRequest.headers.set("Authorization", `Bearer ${token}`);
        else originalRequest.headers.Authorization = `Bearer ${token}`;

        return client(originalRequest);
      } catch (refreshError) {
        const role = localStorage.getItem("user_role");

        useAuthStore.getState().logout();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("zamora-auth");

        window.location.href = role === "admin" ? "/admin/login" : "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper pour les URLs d'images
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const upload = String(env.UPLOAD_URL || "").replace(/\/+$/, "");
  return `${upload}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default client;