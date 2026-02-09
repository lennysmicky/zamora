import React from "react";

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
  const {
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems,
    recentOrders,
    isLoading,
    error,
    refresh,
  } = useDashboardData();

  return (
    <div className="dashboard-page">
      {/* Optionnel: erreurs/chargement (sans toucher au CSS, tu peux retirer si tu veux) */}
      {error && <div style={{ marginBottom: 12 }}>{error}</div>}

      {/* KPI Section */}
      <KpiGrid data={kpis} isLoading={isLoading} onRefresh={refresh} />

      {/* Charts Section */}
      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      {/* Lists Section */}
      <div className="dashboard-lists">
        <TopSellingItems data={topSellingItems} isLoading={isLoading} />
        <RecentOrdersTable data={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardPage;
