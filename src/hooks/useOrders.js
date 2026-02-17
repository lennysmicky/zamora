import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import { ordersApi } from "../api/orders";

const EMPTY_STATS = { total: 0, pending: 0, delivered: 0, cancelled: 0 };

export const useOrders = (opts) => {
  const options = opts ?? {};
  const { userType, restaurantId: storeRestaurantId } = useAuthStore();

  // mode effectif ("admin" | "restaurant")
  const mode = options.mode ?? userType ?? "admin";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    source: "",
    period: "30days",
    from: "",
    to: "",
    restaurant: "", // admin-only => ID restaurent
    ...(options.initialFilters ?? {}),
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: options.initialPageSize ?? 10,
  });

  const abortRef = useRef(null);

  //  restaurant scope
  // - restaurant mode => id obligatoire
  // - admin mode => id optionnel (liste globale) + filtre "restaurant" si fourni
  const effectiveRestaurantId = useMemo(() => {
    if (mode === "restaurant") return options.restaurantId ?? storeRestaurantId ?? null;
    // admin: si une prop restaurantId est passée on peut la prendre, sinon filtre restaurant
    return options.restaurantId ?? filters.restaurant ?? null;
  }, [mode, options.restaurantId, storeRestaurantId, filters.restaurant]);

  // reset page quand filtres changent
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

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    //  guard UNIQUEMENT en restaurant
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
          mode, //  indispensable pour router admin/restaurant
          // restaurant: obligatoire en restaurant, optionnel en admin
          restaurantId: effectiveRestaurantId ?? undefined,
          // en admin, on garde filters.restaurant pour filtrer côté backend si supporté
          ...filters,
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
      // utile pour debug: voir endpoint / params
      console.error("fetchOrders error:", err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [
    mode,
    effectiveRestaurantId,
    filters,
    pagination.currentPage,
    pagination.itemsPerPage,
  ]);

  useEffect(() => {
    fetchOrders();
    return () => abortRef.current?.abort();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await ordersApi.updateStatus(orderId, newStatus);
        await fetchOrders();
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
        return true;
      } catch (err) {
        console.error("updatePaymentStatus error:", err);
        return false;
      }
    },
    [fetchOrders]
  );

  const canUseRestaurantScope = useMemo(() => {
    // admin: toujours OK (liste globale possible)
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
