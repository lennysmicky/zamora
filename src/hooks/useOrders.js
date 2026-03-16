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

const buildTableMap = (tables = []) => {
  const map = new Map();

  for (const table of tables) {
    const id = String(table?._id ?? table?.id ?? "").trim();
    if (!id) continue;
    map.set(id, table);
  }

  return map;
};

const buildTableLabel = (table) => {
  if (!table) return "-";

  const number =
    table?.numero_table ??
    table?.numeroTable ??
    table?.numero ??
    table?.tableNumber ??
    table?.number ??
    table?.num ??
    null;

  const name =
    table?.nom_table ??
    table?.table_name ??
    table?.tableName ??
    table?.nom ??
    table?.name ??
    "";

  if (number != null && String(number).trim() !== "") {
    return `Table ${number}`;
  }

  if (name && String(name).trim() !== "") {
    return String(name).trim();
  }

  return "-";
};

const enrichOrderWithTable = (order, tableMap) => {
  if (!order || typeof order !== "object") return order;

  if (order.tableLabel && order.tableLabel !== "-") {
    return order;
  }

  const rawTableId =
    order.tableId ??
    order.table ??
    order.raw?.tableId ??
    (typeof order.raw?.table === "string" ? order.raw.table : null) ??
    null;

  const lookupId = rawTableId ? String(rawTableId) : null;
  const matchedTable = lookupId ? tableMap.get(lookupId) : null;

  if (!matchedTable) {
    return {
      ...order,
      tableLabel: order.tableLabel || "-",
    };
  }

  const tableNumber =
    matchedTable?.numero_table ??
    matchedTable?.numeroTable ??
    matchedTable?.numero ??
    matchedTable?.tableNumber ??
    matchedTable?.number ??
    null;

  const tableName =
    matchedTable?.nom_table ??
    matchedTable?.table_name ??
    matchedTable?.tableName ??
    matchedTable?.nom ??
    matchedTable?.name ??
    "";

  return {
    ...order,
    tableId: String(matchedTable?._id ?? matchedTable?.id ?? rawTableId ?? ""),
    tableNumber: tableNumber ?? order.tableNumber ?? null,
    tableName: tableName || order.tableName || "",
    tableLabel: buildTableLabel(matchedTable),
  };
};

export const useOrders = (opts) => {
  const options = opts ?? {};

  const userType = useAuthStore((s) => s.userType);
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);
  const storeToken = useAuthStore((s) => s.token);

  const mode = useMemo(
    () => normalizeMode(options.mode ?? userType ?? "admin"),
    [options.mode, userType]
  );

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

  const tokenRestaurantId = useMemo(() => {
    const token = getTokenFallback(storeToken);
    const jwt = parseJwt(token);
    return (
      jwt?.restaurentId ??
      jwt?.restaurantId ??
      jwt?.restaurent ??
      jwt?.restaurant ??
      null
    );
  }, [storeToken]);

  const effectiveRestaurantId = useMemo(() => {
    if (mode === "restaurant") {
      return options.restaurantId ?? storeRestaurantId ?? tokenRestaurantId ?? null;
    }
    return options.restaurantId ?? filters.restaurant ?? null;
  }, [mode, options.restaurantId, storeRestaurantId, tokenRestaurantId, filters.restaurant]);

  const apiFilters = useMemo(() => {
    const f = { ...(filters ?? {}) };

    if (mode === "restaurant") delete f.restaurant;

    if (f.period !== "custom") {
      f.from = "";
      f.to = "";
    }

    return f;
  }, [filters, mode]);

  const extKey = useMemo(
    () =>
      JSON.stringify({
        f: options.initialFilters ?? null,
        p: { page: initPage, limit: initLimit },
        mode,
      }),
    [options.initialFilters, initPage, initLimit, mode]
  );

  const lastExtKeyRef = useRef(extKey);

  useEffect(() => {
    if (lastExtKeyRef.current === extKey) return;
    lastExtKeyRef.current = extKey;

    if (options.initialFilters) {
      _setFilters((prev) => ({ ...prev, ...options.initialFilters }));
    }

    setPagination((p) => ({
      ...p,
      currentPage: initPage,
      itemsPerPage: initLimit,
    }));
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

      let normalizedOrders = Array.isArray(res.data) ? res.data : [];

      if (effectiveRestaurantId) {
        try {
          const tables = await ordersApi.getTables(effectiveRestaurantId, {
            signal: controller.signal,
          });

          const tableMap = buildTableMap(tables);
          normalizedOrders = normalizedOrders.map((order) =>
            enrichOrderWithTable(order, tableMap)
          );
        } catch (tableErr) {
          if (!isCanceledError(tableErr)) {
            console.error("getTables error:", tableErr);
          }
        }
      }

      setOrders(normalizedOrders);
      setStats(res.stats ?? EMPTY_STATS);

      setPagination((p) => ({
        ...p,
        totalPages: res.totalPages ?? 1,
        totalItems: res.totalItems ?? normalizedOrders.length ?? 0,
      }));
    } catch (err) {
      if (isCanceledError(err) || controller.signal.aborted) return;
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

  const removeOrderLocally = useCallback((orderId) => {
    const id = String(orderId || "");
    if (!id) return null;

    let removedOrder = null;

    setOrders((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      removedOrder = current.find((o) => String(o?.id ?? o?._id ?? "") === id) || null;
      return current.filter((o) => String(o?.id ?? o?._id ?? "") !== id);
    });

    setStats((prev) => ({
      ...prev,
      total: Math.max(0, Number(prev?.total ?? 0) - 1),
    }));

    setPagination((prev) => ({
      ...prev,
      totalItems: Math.max(0, Number(prev?.totalItems ?? 0) - 1),
    }));

    return removedOrder;
  }, []);

  const restoreOrdersSnapshot = useCallback((snapshotOrders, snapshotStats, snapshotPagination) => {
    if (Array.isArray(snapshotOrders)) {
      setOrders(snapshotOrders);
    }
    if (snapshotStats) {
      setStats(snapshotStats);
    }
    if (snapshotPagination) {
      setPagination(snapshotPagination);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        if (!effectiveRestaurantId) {
          throw new Error("Missing restaurentId for updateOrderStatus()");
        }

        await ordersApi.updateStatus(orderId, newStatus, {
          restaurantId: effectiveRestaurantId,
        });

        await fetchOrders();

        emitDashboardRefresh({
          reason: "order_status_updated",
          orderId,
          status: newStatus,
        });

        return true;
      } catch (err) {
        if (isCanceledError(err)) return false;
        console.error("updateOrderStatus error:", err);
        setError(err?.message ?? "Erreur lors de la mise à jour du statut");
        return false;
      }
    },
    [effectiveRestaurantId, fetchOrders]
  );

  const updatePaymentStatus = useCallback(
    async (orderId, newPaymentStatus) => {
      try {
        if (!effectiveRestaurantId) {
          throw new Error("Missing restaurentId for updatePaymentStatus()");
        }

        await ordersApi.updatePaymentStatus(orderId, newPaymentStatus, {
          restaurantId: effectiveRestaurantId,
        });

        await fetchOrders();

        emitDashboardRefresh({
          reason: "payment_status_updated",
          orderId,
          paymentStatus: newPaymentStatus,
        });

        return true;
      } catch (err) {
        if (isCanceledError(err)) return false;
        console.error("updatePaymentStatus error:", err);
        setError(err?.message ?? "Erreur lors de la mise à jour du paiement");
        return false;
      }
    },
    [effectiveRestaurantId, fetchOrders]
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

    removeOrderLocally,
    restoreOrdersSnapshot,
  };
};

export default useOrders;