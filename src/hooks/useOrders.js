// src/hooks/useOrders.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import { ordersApi } from "../api/orders";
import { emitDashboardRefresh } from "../utils/dashboardEvents";

const EMPTY_STATS = { total: 0, pending: 0, delivered: 0, cancelled: 0 };

const toInt = (v, def) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

const isCanceledError = (err) => {
  const msg = String(err?.message ?? "").toLowerCase();
  return (
    err?.name === "CanceledError" ||
    err?.code === "ERR_CANCELED" ||
    err?.name === "AbortError" ||
    msg === "canceled" ||
    msg === "cancelled" ||
    msg.includes("canceled") ||
    msg.includes("cancelled") ||
    msg.includes("aborted")
  );
};

const parseJwt = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    // atob -> unicode safe
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getTokenFallback = (storeToken) => {
  if (storeToken) return storeToken;

  // persist Zustand
  const raw = localStorage.getItem("zamora-auth");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token ?? null;
      if (token) return token;
    } catch {
      // ignore
    }
  }

  return localStorage.getItem("auth_token");
};

const normalizeMode = (m) => {
  const v = String(m ?? "").toLowerCase();
  return v === "restaurant" ? "restaurant" : "admin";
};

export const useOrders = (opts) => {
  const options = opts ?? {};

  const userType = useAuthStore((s) => s.userType);
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);
  const storeToken = useAuthStore((s) => s.token);

  const mode = useMemo(() => normalizeMode(options.mode ?? userType ?? "admin"), [options.mode, userType]);

  const initPage = toInt(
    options.initialPagination?.page ?? options.initialPagination?.currentPage,
    1
  );
  const initLimit = toInt(
    options.initialPagination?.limit ??
      options.initialPagination?.itemsPerPage ??
      options.initialPageSize,
    10
  );

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, _setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    source: "",
    period: "30days",
    from: "",
    to: "",
    restaurant: "",
    ...(options.initialFilters ?? {}),
  });

  const [pagination, setPagination] = useState({
    currentPage: initPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initLimit,
  });

  const setFilters = useCallback((next) => {
    _setFilters((prev) => (typeof next === "function" ? next(prev) : next));
    setPagination((p) => (p.currentPage === 1 ? p : { ...p, currentPage: 1 }));
  }, []);

  const abortRef = useRef(null);

  // RestaurantId fallback depuis token (utile si store pas encore hydraté)
  const tokenRestaurantId = useMemo(() => {
    const token = getTokenFallback(storeToken);
    const jwt = parseJwt(token);
    return jwt?.restaurentId ?? jwt?.restaurantId ?? jwt?.restaurent ?? jwt?.restaurant ?? null;
  }, [storeToken]);

  // scope restaurant effectif
  const effectiveRestaurantId = useMemo(() => {
    if (mode === "restaurant") {
      return options.restaurantId ?? storeRestaurantId ?? tokenRestaurantId ?? null;
    }
    return options.restaurantId ?? filters.restaurant ?? null;
  }, [mode, options.restaurantId, storeRestaurantId, tokenRestaurantId, filters.restaurant]);

  // sanitize filters before API
  const apiFilters = useMemo(() => {
    const f = { ...(filters ?? {}) };

    if (mode === "restaurant") delete f.restaurant;
    if (f.period !== "custom") {
      f.from = "";
      f.to = "";
    }

    return f;
  }, [filters, mode]);

  // sync when URL changes (back/forward or opened shared link)
  const extKey = useMemo(
    () =>
      JSON.stringify({
        f: options.initialFilters ?? null,
        p: { page: initPage, limit: initLimit },
        mode,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.initialFilters, initPage, initLimit, mode]
  );

  const lastExtKeyRef = useRef(extKey);

  useEffect(() => {
    if (lastExtKeyRef.current === extKey) return;
    lastExtKeyRef.current = extKey;

    if (options.initialFilters) _setFilters((prev) => ({ ...prev, ...options.initialFilters }));
    setPagination((p) => ({ ...p, currentPage: initPage, itemsPerPage: initLimit }));
  }, [extKey, initPage, initLimit, options.initialFilters]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Restaurant: si pas de rid, on remonte une erreur explicite (pas silencieux)
    if (mode === "restaurant" && !effectiveRestaurantId) {
      setOrders([]);
      setStats(EMPTY_STATS);
      setPagination((p) => ({ ...p, totalPages: 1, totalItems: 0 }));
      setError("MISSING_RESTAURANT_ID: impossible de charger les commandes restaurant");
      setLoading(false);
      return;
    }

    try {
      const res = await ordersApi.getOrders(
        {
          mode,
          restaurantId: effectiveRestaurantId ?? undefined,
          ...apiFilters,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
        { signal: controller.signal }
      );

      if (controller.signal.aborted) return;

      setOrders(res.data ?? []);
      setStats(res.stats ?? EMPTY_STATS);

      setPagination((p) => ({
        ...p,
        totalPages: res.totalPages ?? 1,
        totalItems: res.totalItems ?? (res.data?.length ?? 0),
      }));
    } catch (err) {
      if (isCanceledError(err) || controller.signal.aborted) return;
      setError(err?.message ?? "Erreur lors du chargement des commandes");
      // eslint-disable-next-line no-console
      console.error("fetchOrders error:", err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [mode, effectiveRestaurantId, apiFilters, pagination.currentPage, pagination.itemsPerPage]);

  // Toujours appeler fetchOrders: le guard est géré à l'intérieur (sinon erreur jamais visible)
  useEffect(() => {
    fetchOrders();
    return () => abortRef.current?.abort();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await ordersApi.updateStatus(orderId, newStatus);
        await fetchOrders();
        emitDashboardRefresh({ reason: "order_status_updated", orderId, status: newStatus });
        return true;
      } catch (err) {
        if (isCanceledError(err)) return false;
        // eslint-disable-next-line no-console
        console.error("updateOrderStatus error:", err);
        return false;
      }
    },
    [fetchOrders]
  );

  const updatePaymentStatus = useCallback(
    async (orderId, newPaymentStatus) => {
      try {
        await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
        await fetchOrders();
        emitDashboardRefresh({
          reason: "payment_status_updated",
          orderId,
          paymentStatus: newPaymentStatus,
        });
        return true;
      } catch (err) {
        if (isCanceledError(err)) return false;
        // eslint-disable-next-line no-console
        console.error("updatePaymentStatus error:", err);
        return false;
      }
    },
    [fetchOrders]
  );

  const canUseRestaurantScope = useMemo(() => {
    if (mode === "admin") return true;
    return Boolean(effectiveRestaurantId);
  }, [mode, effectiveRestaurantId]);

  return {
    orders,
    stats,
    loading,
    error,

    filters,
    setFilters,

    pagination,
    setPagination,

    canUseRestaurantScope,
    fetchOrders,

    updateOrderStatus,
    updatePaymentStatus,
  };
};

export default useOrders;