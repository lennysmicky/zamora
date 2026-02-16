// src/hooks/useOrders.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import { ordersApi } from "../api/orders";

export const useOrders = (opts = {}) => {
  const { userType, restaurantId: storeRestaurantId } = useAuthStore();

  // mode effectif
  const mode = opts.mode ?? userType ?? "admin";
  const restaurentId = opts.restaurantId ?? storeRestaurantId ?? null;

  // États
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    source: "",
    period: "30days",
    restaurant: "", // si tu filtres côté admin
    ...(opts.initialFilters ?? {}),
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: opts.initialPageSize ?? 10,
  });

  // Abort / StrictMode
  const abortRef = useRef(null);

  // reset page quand filtres changent (sauf au tout premier rendu)
  const lastFiltersRef = useRef(JSON.stringify(filters));
  useEffect(() => {
    const curr = JSON.stringify(filters);
    if (lastFiltersRef.current !== curr) {
      lastFiltersRef.current = curr;
      setPagination((p) => ({ ...p, currentPage: 1 }));
    }
  }, [filters]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    // cancel previous
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await ordersApi.getOrders({
        mode,
        restaurentId,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
        signal: controller.signal,
      });

      setOrders(res.orders ?? []);
      setStats(res.stats ?? { total: 0, pending: 0, delivered: 0, cancelled: 0 });
      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages ?? 1,
        totalItems: res.pagination?.totalItems ?? (res.orders?.length ?? 0),
      }));
    } catch (err) {
      if (err?.name === "CanceledError") return;
      if (err?.code === "ERR_CANCELED") return;

      setError(err?.message ?? "Erreur lors du chargement des commandes");
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  }, [mode, restaurentId, filters, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    fetchOrders();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      // refresh après update pour rester source-of-truth backend
      await fetchOrders();
      return true;
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      return false;
    }
  }, [fetchOrders]);

  const updatePaymentStatus = useCallback(async (orderId, newPaymentStatus) => {
    try {
      await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
      await fetchOrders();
      return true;
    } catch (err) {
      console.error("updatePaymentStatus error:", err);
      return false;
    }
  }, [fetchOrders]);

  const canUseRestaurantScope = useMemo(
    () => mode !== "restaurant" || Boolean(restaurentId),
    [mode, restaurentId]
  );

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
