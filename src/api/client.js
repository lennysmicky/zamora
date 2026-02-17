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

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState()?.token;
    const lsToken = localStorage.getItem("auth_token");
    const token = storeToken || lsToken;

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (env.DEBUG) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    if (env.DEBUG) {
      console.log(`[${response.status}] ${response.config.url}`);
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

    if (env.DEBUG) {
      console.error(`[${status}] ${originalRequest?.url}`, error.message);
    }

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
