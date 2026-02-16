// src/pages/Restaurant/Dashboard/RestaurantDashboardPage.jsx
import React from "react";
import useAuthStore from "../../../stores/authStore";

// Components
import KpiGrid from "../../../components/kpi/KpiGrid";
import RevenueChart from "../../../components/charts/RevenueChart";
import OrdersStatusChart from "../../../components/charts/OrdersStatusChart";
import TopSellingItems from "../../../components/dashboard/TopSellingItems";
import RecentOrdersTable from "../../../components/dashboard/RecentOrdersTable";

// Hook
import useDashboardData from "../../../hooks/useDashboardData";

// Styles
import "./restaurant.css";

const RestaurantDashboardPage = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const {
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems,
    recentOrders,
    isLoading,
    error,
    refresh,
  } = useDashboardData({ restaurantId });

  return (
    <div className="dashboard-page">
      {error && <div style={{ marginBottom: 12 }}>{error}</div>}

      {/* KPI */}
      <KpiGrid data={kpis} isLoading={isLoading} onRefresh={refresh} />

      {/* Graphiques */}
      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      {/* Listes */}
      <div className="dashboard-bottom">
        <TopSellingItems data={topSellingItems} isLoading={isLoading} />
        <RecentOrdersTable data={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
