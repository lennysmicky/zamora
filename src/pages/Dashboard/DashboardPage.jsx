import React from 'react';

// Components
import KpiGrid from '../../components/kpi/KpiGrid';
import RevenueChart from '../../components/charts/RevenueChart';
import OrdersStatusChart from '../../components/charts/OrdersStatusChart';
import TopSellingItems from '../../components/dashboard/TopSellingItems';
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable';

// Styles
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      {/* KPI Section */}
      <KpiGrid />

      {/* Charts Section */}
      <div className="dashboard-charts">
        <RevenueChart />
        <OrdersStatusChart />
      </div>

      {/* Lists Section */}
      <div className="dashboard-lists">
        <TopSellingItems />
        <RecentOrdersTable />
      </div>
    </div>
  );
};

export default DashboardPage;