import React, { useMemo } from "react";

// Hook
import useDashboardData from "../../hooks/useDashboardData";

// Components
import KpiGrid from "../../components/kpi/KpiGrid";
import RevenueChart from "../../components/charts/RevenueChart";
import OrdersStatusChart from "../../components/charts/OrdersStatusChart";
import TopSellingItems from "../../components/dashboard/TopSellingItems";
import RecentOrdersTable from "../../components/dashboard/RecentOrdersTable";

// Styles
import "./DashboardPage.css";

const DashboardPage = () => {
  // ✅ Un seul hook ici (les enfants reçoivent data/props)
  const {
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems,
    recentOrders,
    isLoading,
    error,
    refresh,
    // si plus tard tu ajoutes des filtres dans useDashboardData:
    // restaurantId, ...
  } = useDashboardData();

  // ✅ Filtres pour "View all" (query params)
  // Pour l’instant, pas de filtres => query vide. Plus tard: period/from/to/restaurant
  const linkFilters = useMemo(
    () => ({
      // period,
      // from: startDate,
      // to: endDate,
      // restaurant: selectedRestaurantId,
    }),
    []
  );

  return (
    <div className="dashboard-page">
      {error && <div style={{ marginBottom: 12 }}>{error}</div>}

      <KpiGrid data={kpis} isLoading={isLoading} onRefresh={refresh} />

      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      <div className="dashboard-lists">
        {/* Passe data + isLoading + filtres view-all */}
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

export default DashboardPage;
