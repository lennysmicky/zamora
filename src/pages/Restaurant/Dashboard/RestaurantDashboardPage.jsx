// src/pages/Restaurant/Dashboard/RestaurantDashboardPage.jsx
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../stores/authStore';

// Composants existants
import KpiGrid from '../../../components/kpi/KpiGrid';
import RevenueChart from '../../../components/charts/RevenueChart';
import OrdersStatusChart from '../../../components/charts/OrdersStatusChart';
import TopSellingItems from '../../../components/dashboard/TopSellingItems';
import RecentOrdersTable from '../../../components/dashboard/RecentOrdersTable';

// Hook Dashboard
import useDashboardData from '../../../hooks/useDashboardData';

import './restaurant.css'; 

const RestaurantDashboardPage = () => {
  const { t } = useTranslation();
  const { restaurantId } = useAuthStore();

  //  Passer restaurantId sous forme d'objet
  const { kpis, charts, recentOrders, isLoading } = useDashboardData({ restaurantId });

  // Extraire les datas depuis charts
  const revenueData = charts?.revenue || [];
  const ordersStatusData = charts?.ordersStatus || [];
  const topSellingItems = charts?.topSellingItems || [];

  return (
    <div className="dashboard-page">
      {/* KPI */}
      <KpiGrid kpis={kpis} isLoading={isLoading} />

      {/* Graphiques */}
      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      {/* Listes */}
      <div className="dashboard-bottom">
        <TopSellingItems items={topSellingItems} isLoading={isLoading} />
        <RecentOrdersTable orders={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
