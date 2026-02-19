// src/pages/Restaurant/Dashboard/RestaurantDashboardPage.jsx
import React, { useMemo } from "react";
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

  //  filtres "View all" (plus tard: period/from/to)
  const linkFilters = useMemo(
    () => ({
      restaurant: restaurantId, // utile côté restaurant aussi (safe)
    }),
    [restaurantId]
  );

  return (
    <div className="dashboard-page">
      {error && <div style={{ marginBottom: 12 }}>{error}</div>}

      <KpiGrid data={kpis} isLoading={isLoading} onRefresh={refresh} />

      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      <div className="dashboard-bottom">
        <TopSellingItems
          data={topSellingItems}
          isLoading={isLoading}
          linkFilters={linkFilters}
        />
        <RecentOrdersTable
          data={recentOrders}
          isLoading={isLoading}
          linkFilters={linkFilters}
        />
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
