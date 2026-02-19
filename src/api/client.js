// src/api/client.js
import axios from "axios";
import env from "../config/env";
import useAuthStore from "../stores/authStore";

const client = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
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

  // admin filter "restaurant" (id) -> restaurentId
  if (next.restaurant && !next.restaurentId) {
    next.restaurentId = next.restaurant;
  }

  // front "restaurantId" -> restaurentId
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
    // on garde restaurentId si tu veux debug, sinon supprime:
    // delete next.restaurentId;
  }

  return next;
};

// ---------------- Request interceptor ----------------
client.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState()?.token;
    const lsToken = localStorage.getItem("auth_token");
    const token = storeToken || lsToken;

    config.headers = config.headers ?? {};
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // MAPPING (sans muter les refs)
    if (config.params) config.params = mapFrontToBack(cloneIfPlain(config.params));

    const d = config.data;
    if (isPlainObject(d)) config.data = mapFrontToBack(cloneIfPlain(d));

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
      axios.isCancel?.(error);

    if (isCanceled) return Promise.reject(error);

    const originalRequest = error.config ?? {};
    const status = error.response?.status;

    if (env.DEBUG) console.error(`[${status}] ${originalRequest?.url}`, error.message);

    const isRefreshCall = (originalRequest?.url || "").includes("/auth/refresh");
    if (status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${env.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data || {};
        if (!token) throw new Error("Refresh token response missing token");

        useAuthStore.getState().setToken(token);
        localStorage.setItem("auth_token", token);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

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
  return `${env.UPLOAD_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default client;
