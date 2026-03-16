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
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setUTCDate(d.getUTCDate() + days);
  return toYmdUtc(d) ?? ymd;
};

const unwrap = (x) => {
  let v = x;
  for (let i = 0; i < 4; i++) {
    if (v == null) break;
    if (Array.isArray(v)) break;
    if (typeof v !== "object") break;

    const next = v.data ?? v.result ?? v.payload ?? v.response;
    if (!next || next === v) break;
    v = next;
  }
  return v;
};

const normalizeRevenueData = (revenue = []) => {
  if (!Array.isArray(revenue)) return [];

  return revenue
    .map((item) => ({
      name: item?.name ?? item?.date ?? item?.label ?? "",
      revenue: Number(item?.revenue ?? item?.value ?? item?.total ?? 0),
    }))
    .filter((item) => item.name);
};

const extractRevenue = (data) => {
  const d = unwrap(data);

  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.charts?.revenue)) return d.charts.revenue;
  if (Array.isArray(d?.revenue)) return d.revenue;
  if (Array.isArray(d?.chart?.revenue)) return d.chart.revenue;
  if (Array.isArray(d?.stats?.revenue)) return d.stats.revenue;

  return [];
};

const extractOrdersStatus = (data) => {
  const d = unwrap(data);

  if (Array.isArray(d?.charts?.ordersStatus)) return d.charts.ordersStatus;
  if (Array.isArray(d?.ordersStatus)) return d.ordersStatus;

  return [];
};

const useDashboardData = ({
  restaurantId: restaurantIdParam = null,
  startDate = null,
  endDate = null,
  period = null,
  allowGlobalAdminDashboard = true,
} = {}) => {
  const { t } = useTranslation();

  const userType = useAuthStore((s) =>
    String(s.userType ?? "").trim().toLowerCase()
  );
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);

  const isAdminMode = userType === "admin";
  const isRestaurantMode = userType === "restaurant";

  const dashRestaurant = useDashboardFiltersStore((s) => s.restaurant);
  const dashPeriod = useDashboardFiltersStore((s) => s.period);
  const dashFrom = useDashboardFiltersStore((s) => s.from);
  const dashTo = useDashboardFiltersStore((s) => s.to);

  const restaurantId = useMemo(() => {
    if (isRestaurantMode) return storeRestaurantId || restaurantIdParam || null;

    if (restaurantIdParam) return restaurantIdParam;

    const selected =
      typeof dashRestaurant === "string"
        ? dashRestaurant
        : dashRestaurant?.id ?? dashRestaurant?._id ?? null;

    return selected;
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
      if (isRestaurantMode && !restaurantId) {
        setKpis({
          totalOrders: 0,
          growthOrders: 0,
          totalRevenue: 0,
          growthRevenue: 0,
          averageOrderValue: 0,
          growthBasket: 0,
          totalCustomers: 0,
          growthCustomers: 0,
        });
        setRevenueData([]);
        setOrdersStatusData([]);
        setTopSellingItems([]);
        setRecentOrders([]);
        setTopRestaurants([]);
        setHourlyOrders([]);
        return;
      }

      if (isAdminMode && !restaurantId && !allowGlobalAdminDashboard) {
        setKpis({
          totalOrders: 0,
          growthOrders: 0,
          totalRevenue: 0,
          growthRevenue: 0,
          averageOrderValue: 0,
          growthBasket: 0,
          totalCustomers: 0,
          growthCustomers: 0,
        });
        setRevenueData([]);
        setOrdersStatusData([]);
        setTopSellingItems([]);
        setRecentOrders([]);
        setTopRestaurants([]);
        setHourlyOrders([]);
        return;
      }

      const data = isAdminMode
        ? await dashboardAPI.getAdminDashboard({ restaurantId, ...filters })
        : await dashboardAPI.getRestaurantDashboard({ restaurantId, ...filters });

      if (seq !== seqRef.current) return;

      const unwrapped = unwrap(data);

      setKpis({
        totalOrders: unwrapped?.kpis?.totalOrders ?? 0,
        growthOrders: unwrapped?.kpis?.growthOrders ?? 0,
        totalRevenue: unwrapped?.kpis?.totalRevenue ?? 0,
        growthRevenue: unwrapped?.kpis?.growthRevenue ?? 0,
        averageOrderValue:
          unwrapped?.kpis?.averageOrderValue ??
          unwrapped?.kpis?.averageBasket ??
          0,
        growthBasket: unwrapped?.kpis?.growthBasket ?? 0,
        totalCustomers: unwrapped?.kpis?.totalCustomers ?? 0,
        growthCustomers: unwrapped?.kpis?.growthCustomers ?? 0,
      });

      setRevenueData(normalizeRevenueData(extractRevenue(unwrapped)));
      setOrdersStatusData(extractOrdersStatus(unwrapped));
      setTopSellingItems(unwrapped?.topSellingItems || []);
      setRecentOrders(unwrapped?.recentOrders || []);
      setTopRestaurants(isAdminMode ? unwrapped?.topRestaurants || [] : []);
      setHourlyOrders(isRestaurantMode ? unwrapped?.hourlyOrders || [] : []);
    } catch (err) {
      console.error("Dashboard error:", err);

      if (seq === seqRef.current) {
        setError(
          t(
            "dashboard.errors.fetchFailed",
            "Erreur lors du chargement du dashboard"
          )
        );

        setKpis({
          totalOrders: 0,
          growthOrders: 0,
          totalRevenue: 0,
          growthRevenue: 0,
          averageOrderValue: 0,
          growthBasket: 0,
          totalCustomers: 0,
          growthCustomers: 0,
        });
        setRevenueData([]);
        setOrdersStatusData([]);
        setTopSellingItems([]);
        setRecentOrders([]);
        setTopRestaurants([]);
        setHourlyOrders([]);
      }
    } finally {
      if (seq === seqRef.current) setIsLoading(false);
    }
  }, [
    isAdminMode,
    isRestaurantMode,
    restaurantId,
    filters,
    allowGlobalAdminDashboard,
    t,
  ]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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