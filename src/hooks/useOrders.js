import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import { ordersApi } from "../api/orders";
import { emitDashboardRefresh } from "../utils/dashboardEvents";

const EMPTY_STATS = { total: 0, pending: 0, delivered: 0, cancelled: 0 };

const toInt = (v, def) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

export const useOrders = (opts) => {
  const options = opts ?? {};
  const { userType, restaurantId: storeRestaurantId } = useAuthStore();

  const mode = options.mode ?? userType ?? "admin";

  // ---- initial state from URL (ordersQuery.js) ----
  const initPage = toInt(options.initialPagination?.page ?? options.initialPagination?.currentPage, 1);
  const initLimit = toInt(
    options.initialPagination?.limit ?? options.initialPagination?.itemsPerPage ?? options.initialPageSize,
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

  //   setFilters = reset page (user-driven)
  const setFilters = useCallback((next) => {
    _setFilters((prev) => (typeof next === "function" ? next(prev) : next));
    setPagination((p) => (p.currentPage === 1 ? p : { ...p, currentPage: 1 }));
  }, []);

  const abortRef = useRef(null);

  const effectiveRestaurantId = useMemo(() => {
    if (mode === "restaurant") return options.restaurantId ?? storeRestaurantId ?? null;
    return options.restaurantId ?? filters.restaurant ?? null;
  }, [mode, options.restaurantId, storeRestaurantId, filters.restaurant]);

  //   sanitize filters before API
  const apiFilters = useMemo(() => {
    const f = { ...(filters ?? {}) };

    if (mode === "restaurant") delete f.restaurant; // ignore admin filter in restaurant mode
    if (f.period !== "custom") {
      f.from = "";
      f.to = "";
    }

    return f;
  }, [filters, mode]);

  //   sync when URL changes (back/forward or opened shared link)
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

    if (mode === "restaurant" && !effectiveRestaurantId) {
      setOrders([]);
      setStats(EMPTY_STATS);
      setPagination((p) => ({ ...p, totalPages: 1, totalItems: 0 }));
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

      setOrders(res.data ?? []);
      setStats(res.stats ?? EMPTY_STATS);

      setPagination((p) => ({
        ...p,
        totalPages: res.totalPages ?? 1,
        totalItems: res.totalItems ?? (res.data?.length ?? 0),
      }));
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError(err?.message ?? "Erreur lors du chargement des commandes");
      console.error("fetchOrders error:", err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [mode, effectiveRestaurantId, apiFilters, pagination.currentPage, pagination.itemsPerPage]);

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
