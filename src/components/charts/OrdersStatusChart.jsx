import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import useDashboardData from '../../hooks/useDashboardData';
import './OrdersStatusChart.css';

const OrdersStatusChart = () => {
  const { t } = useTranslation();

  // Récupération des données du hook
  const { ordersStatusData, isLoading } = useDashboardData();

  // Configuration des couleurs par statut
  const statusColors = {
    delivered: '#10b981',
    preparing: '#f59e0b',
    pending: '#64748b',
    cancelled: '#ef4444'
  };

  // Préparer les données pour le PieChart
  const data = ordersStatusData?.labels?.map((label, i) => ({
    name: label,
    value: ordersStatusData?.data?.[i] || 0,
    color: ordersStatusData?.colors?.[i] || statusColors[label] || '#64748b'
  })) || [];

  const total = data.reduce((acc, item) => acc + item.value, 0);

  const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value);
  const calculatePercentage = (value) => (total === 0 ? 0 : Math.round((value / total) * 100));
  const getStatusLabel = (status) => t(`status.${status}`);

  // ================================
  // ÉTAT 1 : LOADING
  // ================================
  if (isLoading) {
    return (
      <div className="chart-card status-chart">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t('dashboard.ordersStatus')}</h3>
            <p>{t('dashboard.statusDistribution')}</p>
          </div>
        </div>
        <div className="status-chart-body">
          <div className="status-chart-donut">
            <div className="status-chart-skeleton-donut"></div>
          </div>
          <div className="status-chart-legend">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="status-legend-item skeleton-legend-item">
                <div className="status-legend-info">
                  <span className="skeleton-dot"></span>
                  <span className="skeleton-name"></span>
                </div>
                <span className="skeleton-value"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 2 : EMPTY
  // ================================
  if (data.length === 0 || total === 0) {
    return (
      <div className="chart-card status-chart">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t('dashboard.ordersStatus')}</h3>
            <p>{t('dashboard.statusDistribution')}</p>
          </div>
        </div>
        <div className="status-chart-body">
          <div className="status-chart-empty">
            <p>{t('dashboard.noOrders')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA
  // ================================
  return (
    <div className="chart-card status-chart">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <h3>{t('dashboard.ordersStatus')}</h3>
          <p>{t('dashboard.statusDistribution')}</p>
        </div>
      </div>

      <div className="status-chart-body">
        <div className="status-chart-donut">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="status-chart-center">
            <span className="status-chart-total">{formatNumber(total)}</span>
            <span className="status-chart-label">{t('status.total')}</span>
          </div>
        </div>

        <div className="status-chart-legend">
          {data.map((item, index) => (
            <div key={index} className="status-legend-item">
              <div className="status-legend-info">
                <span className="status-legend-dot" style={{ backgroundColor: item.color }} />
                <span className="status-legend-name">{getStatusLabel(item.name)}</span>
              </div>
              <span className="status-legend-value">{calculatePercentage(item.value)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersStatusChart;
