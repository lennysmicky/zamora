// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../stores/authStore";
import { useDashboardFiltersStore } from "../stores/dashboardFiltersStore";
import dashboardAPI from "../api/dashboard";
import { onDashboardRefresh } from "../utils/dashboardEvents";

const toYmdUtc = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const addDaysUtcYmd = (ymd, days) => {
  if (!ymd) return null;
  // force UTC to avoid timezone shifts
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setUTCDate(d.getUTCDate() + days);
  return toYmdUtc(d) ?? ymd;
};

const useDashboardData = ({
  restaurantId: restaurantIdParam = null, // override (rare)
  startDate = null,
  endDate = null,
  period = null,
  allowGlobalAdminDashboard = true,
} = {}) => {
  const { t } = useTranslation();

  // normalize type (robuste si "ADMIN"/"Restaurant")
  const userType = useAuthStore((s) => String(s.userType ?? "").trim().toLowerCase());
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);

  const isAdminMode = userType === "admin";
  const isRestaurantMode = userType === "restaurant";

  // ✅ Dashboard filters store (source of truth UI)
  const dashRestaurant = useDashboardFiltersStore((s) => s.restaurant); // {id|_id,name}|string|null
  const dashPeriod = useDashboardFiltersStore((s) => s.period); // "30days" | "7days" | "today" | "custom" | ""
  const dashFrom = useDashboardFiltersStore((s) => s.from);
  const dashTo = useDashboardFiltersStore((s) => s.to);

  /**
   * ✅ restaurantId effectif:
   * - restaurant mode: PRIORITÉ AU STORE (JWT restaurantId), puis param en fallback
   * - admin mode: param override, sinon selector (id/_id/string)
   */
  const restaurantId = useMemo(() => {
    if (isRestaurantMode) return storeRestaurantId || restaurantIdParam || null;

    // admin
    if (restaurantIdParam) return restaurantIdParam;

    const selected =
      typeof dashRestaurant === "string"
        ? dashRestaurant
        : dashRestaurant?.id ?? dashRestaurant?._id ?? null;

    return selected; // null => "Tous les restaurants"
  }, [isRestaurantMode, storeRestaurantId, restaurantIdParam, dashRestaurant]);

  const [kpis, setKpis] = useState({
    totalOrders: 0,
    growthOrders: 0,
    totalRevenue: 0,
    growthRevenue: 0,
    averageOrderValue: 0,
    growthBasket: 0,
    totalCustomers: 0,
    growthCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [ordersStatusData, setOrdersStatusData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [hourlyOrders, setHourlyOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ build filters depuis props OU store
  // 🔥 Fix: si custom et from==to, on envoie to = from + 1 jour (to exclusif)
  const filters = useMemo(() => {
    const f = {};

    const p = period ?? dashPeriod;
    const isCustom = p === "custom";

    const from = startDate ?? (isCustom ? dashFrom : null);
    const rawTo = endDate ?? (isCustom ? dashTo : null);

    if (p != null && p !== "") f.period = p;
    if (from) f.from = from;

    if (rawTo) {
      if (isCustom && from && rawTo === from) {
        f.to = addDaysUtcYmd(rawTo, 1);
      } else {
        f.to = rawTo;
      }
    }

    return f;
  }, [period, startDate, endDate, dashPeriod, dashFrom, dashTo]);

  const seqRef = useRef(0);

  const fetchDashboard = useCallback(async () => {
    const seq = ++seqRef.current;
    setIsLoading(true);
    setError(null);

    try {
      // Restaurant: sans restaurantId => rien à fetch
      if (isRestaurantMode && !restaurantId) return;

      // Admin: global désactivé ET aucun resto => rien à fetch
      if (isAdminMode && !restaurantId && !allowGlobalAdminDashboard) return;

      if (isAdminMode) {
        const data = await dashboardAPI.getAdminDashboard({ restaurantId, ...filters });
        if (seq !== seqRef.current) return;

        setKpis({
          totalOrders: data?.kpis?.totalOrders ?? 0,
          growthOrders: data?.kpis?.growthOrders ?? 0,
          totalRevenue: data?.kpis?.totalRevenue ?? 0,
          growthRevenue: data?.kpis?.growthRevenue ?? 0,
          averageOrderValue: data?.kpis?.averageOrderValue ?? data?.kpis?.averageBasket ?? 0,
          growthBasket: data?.kpis?.growthBasket ?? 0,
          totalCustomers: data?.kpis?.totalCustomers ?? 0,
          growthCustomers: data?.kpis?.growthCustomers ?? 0,
        });

        setRevenueData(data?.charts?.revenue || []);
        setOrdersStatusData(data?.charts?.ordersStatus || []);
        setTopSellingItems(data?.topSellingItems || []);
        setRecentOrders(data?.recentOrders || []);
        setTopRestaurants(data?.topRestaurants || []);
        setHourlyOrders([]);
        return;
      }

      if (isRestaurantMode) {
        const data = await dashboardAPI.getRestaurantDashboard({ restaurantId, ...filters });
        if (seq !== seqRef.current) return;

        setKpis({
          totalOrders: data?.kpis?.totalOrders ?? 0,
          growthOrders: data?.kpis?.growthOrders ?? 0,
          totalRevenue: data?.kpis?.totalRevenue ?? 0,
          growthRevenue: data?.kpis?.growthRevenue ?? 0,
          averageOrderValue: data?.kpis?.averageOrderValue ?? data?.kpis?.averageBasket ?? 0,
          growthBasket: data?.kpis?.growthBasket ?? 0,
          totalCustomers: data?.kpis?.totalCustomers ?? 0,
          growthCustomers: data?.kpis?.growthCustomers ?? 0,
        });

        setRevenueData(data?.charts?.revenue || []);
        setOrdersStatusData(data?.charts?.ordersStatus || []);
        setTopSellingItems(data?.topSellingItems || []);
        setRecentOrders(data?.recentOrders || []);
        setHourlyOrders(data?.hourlyOrders || []);
        setTopRestaurants([]);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      if (seq === seqRef.current) {
        setError(t("dashboard.errors.fetchFailed", "Erreur lors du chargement du dashboard"));
      }
    } finally {
      if (seq === seqRef.current) setIsLoading(false);
    }
  }, [isAdminMode, isRestaurantMode, restaurantId, filters, allowGlobalAdminDashboard, t]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ✅ cleanup (évite listeners multiples)
  useEffect(() => {
    const unsubscribe = onDashboardRefresh(() => fetchDashboard());
    return unsubscribe;
  }, [fetchDashboard]);

  return {
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems,
    recentOrders,
    topRestaurants,
    hourlyOrders,
    isLoading,
    error,
    isAdminMode,
    isRestaurantMode,
    restaurantId,
    refresh: fetchDashboard,
  };
};

export default useDashboardData;
