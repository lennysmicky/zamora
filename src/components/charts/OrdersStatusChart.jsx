import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './OrdersStatusChart.css';

const OrdersStatusChart = () => {
  const { t } = useTranslation();

  // État initialisé à tableau vide (prêt pour le backend)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration des couleurs par statut
  const statusColors = {
    delivered: '#10b981',
    preparing: '#f59e0b',
    pending: '#64748b',
    cancelled: '#ef4444'
  };

  // Fonction pour charger les données depuis le backend
  const fetchOrdersStatusData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/dashboard/orders-status');
      // const rawData = await response.json();
      // const formattedData = rawData.map(item => ({
      //   ...item,
      //   color: statusColors[item.name] || '#64748b',
      //   label: t(`status.${item.name}`)
      // }));
      // setData(formattedData);

      // Pour l'instant, on garde le tableau vide
      setData([]);
    } catch (error) {
      console.error('Erreur lors du chargement des statuts de commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersStatusData();
  }, []);

  // Calcul du total
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // Fonction pour formater le nombre
  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Fonction pour calculer le pourcentage
  const calculatePercentage = (value) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Fonction pour obtenir le label traduit du statut
  const getStatusLabel = (status) => {
    return t(`status.${status}`);
  };

  // ================================
  // ÉTAT 1 : LOADING (Skeleton)
  // ================================
  if (loading) {
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
  // ÉTAT 2 : EMPTY (Aucune donnée)
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
  // ÉTAT 3 : DATA (Affichage normal)
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
                <span 
                  className="status-legend-dot" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="status-legend-name">{getStatusLabel(item.name)}</span>
              </div>
              <span className="status-legend-value">
                {calculatePercentage(item.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersStatusChart;