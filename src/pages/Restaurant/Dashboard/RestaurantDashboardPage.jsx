// src/pages/Restaurant/Dashboard/RestaurantDashboardPage.jsx
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../stores/authStore';

// ✅ IMPORTER les composants existants
import KpiGrid from '../../../components/kpi/KpiGrid';
import RevenueChart from '../../../components/charts/RevenueChart';
import OrdersStatusChart from '../../../components/charts/OrdersStatusChart';
import TopSellingItems from '../../../components/dashboard/TopSellingItems';
import RecentOrdersTable from '../../../components/dashboard/RecentOrdersTable';

// Réutiliser le hook existant avec filtre
import { useDashboardData } from '../../../hooks/useDashboardData';

import './restaurant.css'; // Réutiliser le CSS

const RestaurantDashboardPage = () => {
  const { t } = useTranslation();
  const { restaurantId } = useAuthStore();

  // ✅ Passer restaurantId pour filtrer les données
  const { kpis, revenueData, ordersStatusData, topSellingItems, recentOrders, isLoading } = 
    useDashboardData(restaurantId);

  return (
    <div className="dashboard-page">
      <KpiGrid kpis={kpis} isLoading={isLoading} />

      <div className="dashboard-charts">
        <RevenueChart data={revenueData} isLoading={isLoading} />
        <OrdersStatusChart data={ordersStatusData} isLoading={isLoading} />
      </div>

      <div className="dashboard-bottom">
        <TopSellingItems items={topSellingItems} isLoading={isLoading} />
        <RecentOrdersTable orders={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;