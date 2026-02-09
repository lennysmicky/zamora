// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../stores/authStore";
import dashboardAPI from "../api/dashboard";

/**
 * Hook Dashboard – Admin & Restaurant
 * Toutes les données viennent du backend
 */
const useDashboardData = ({
  restaurantId: restaurantIdParam = null,
  startDate = null,
  endDate = null,
  period = null,
} = {}) => {
  const { t } = useTranslation();
  const { userType, restaurantId: storeRestaurantId } = useAuthStore();

  // ===============================
  // CONTEXTE UTILISATEUR
  // ===============================
  const restaurantId = restaurantIdParam || storeRestaurantId;
  const isAdminMode = userType === "admin";
  const isRestaurantMode = userType === "restaurant";

  // ===============================
  // STATES
  // ===============================
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
  const [topRestaurants, setTopRestaurants] = useState([]); // admin only
  const [hourlyOrders, setHourlyOrders] = useState([]); // restaurant only

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===============================
  // BUILD FILTERS
  // (ne met pas restaurantId ici: l'ID sert à construire l'URL)
  // ===============================
  const buildFilters = () => {
    const filters = {};
    if (startDate) {
      filters.startDate = startDate;
      filters.from = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
      filters.to = endDate;
    }
    if (period) filters.period = period;
    return filters;
  };

  // ===============================
  // FETCH DASHBOARD
  // ===============================
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = buildFilters();

      // Admin sans restaurant sélectionné: ne fetch pas
      if (isAdminMode && !restaurantId) {
        setIsLoading(false);
        return;
      }

      // ================= ADMIN =================
      if (isAdminMode) {
        const data = await dashboardAPI.getAdminDashboard({ restaurantId, ...filters });
        if (!data) throw new Error("Invalid admin dashboard response");

        setKpis({
          totalOrders: data.kpis?.totalOrders ?? 0,
          growthOrders: data.kpis?.growthOrders ?? 0,
          totalRevenue: data.kpis?.totalRevenue ?? 0,
          growthRevenue: data.kpis?.growthRevenue ?? 0,
          // compat si backend envoie averageBasket
          averageOrderValue: data.kpis?.averageOrderValue ?? data.kpis?.averageBasket ?? 0,
          growthBasket: data.kpis?.growthBasket ?? 0,
          totalCustomers: data.kpis?.totalCustomers ?? 0,
          growthCustomers: data.kpis?.growthCustomers ?? 0,
        });

        setRevenueData(data.charts?.revenue || []);
        setOrdersStatusData(data.charts?.ordersStatus || []);
        setTopSellingItems(data.topSellingItems || []);
        setRecentOrders(data.recentOrders || []);
        setTopRestaurants(data.topRestaurants || []);
      }

      // ================= RESTAURANT =================
      if (isRestaurantMode && restaurantId) {
        const data = await dashboardAPI.getRestaurantDashboard({ restaurantId, ...filters });
        if (!data) throw new Error("Invalid restaurant dashboard response");

        setKpis({
          totalOrders: data.kpis?.totalOrders ?? 0,
          growthOrders: data.kpis?.growthOrders ?? 0,
          totalRevenue: data.kpis?.totalRevenue ?? 0,
          growthRevenue: data.kpis?.growthRevenue ?? 0,
          averageOrderValue: data.kpis?.averageOrderValue ?? data.kpis?.averageBasket ?? 0,
          growthBasket: data.kpis?.growthBasket ?? 0,
          totalCustomers: data.kpis?.totalCustomers ?? 0,
          growthCustomers: data.kpis?.growthCustomers ?? 0,
        });

        setRevenueData(data.charts?.revenue || []);
        setOrdersStatusData(data.charts?.ordersStatus || []);
        setTopSellingItems(data.topSellingItems || []);
        setRecentOrders(data.recentOrders || []);
        setHourlyOrders(data.hourlyOrders || []);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(t("dashboard.errors.fetchFailed", "Erreur lors du chargement du dashboard"));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminMode, isRestaurantMode, restaurantId, startDate, endDate, period, t]);

  // ===============================
  // EFFECT
  // ===============================
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ===============================
  // PARTIAL REFRESH
  // (conservé tel quel, même si tes routes actuelles ne les exposent pas)
  // ===============================
  const refreshTopRestaurants = async (limit = 5) => {
    if (!isAdminMode) return;
    const data = await dashboardAPI.getTopRestaurants({ limit });
    setTopRestaurants(data || []);
  };

  const refreshHourlyOrders = async (date = null) => {
    if (!isRestaurantMode || !restaurantId) return;
    const data = await dashboardAPI.getHourlyOrders({ restaurantId, date });
    setHourlyOrders(data || []);
  };

  // ===============================
  // RETURN
  // ===============================
  return {
    // Data
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems, // restaurant/admin (si dispo)
    recentOrders,
    topRestaurants, // admin only
    hourlyOrders, // restaurant only

    // States
    isLoading,
    error,

    // Context
    isAdminMode,
    isRestaurantMode,
    restaurantId,

    // Actions
    refresh: fetchDashboard,
    refreshTopRestaurants,
    refreshHourlyOrders,
  };
};

export default useDashboardData;
