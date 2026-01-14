import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KpiCard from './KpiCard';
import { 
  RiShoppingBag3Line, 
  RiMoneyDollarCircleLine, 
  RiShoppingCartLine,
  RiGroupLine 
} from 'react-icons/ri';
import './KpiGrid.css';

const KpiGrid = () => {
  const { t } = useTranslation();

  // État initialisé à zéro (prêt pour le backend)
  const [kpiData, setKpiData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageBasket: 0,
    uniqueCustomers: 0,
    totalOrdersChange: 0,
    totalRevenueChange: 0,
    averageBasketChange: 0,
    uniqueCustomersChange: 0
  });

  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données depuis le backend
  const fetchKpiData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/dashboard/kpis');
      // const data = await response.json();
      // setKpiData(data);
      
      setKpiData({
        totalOrders: 0,
        totalRevenue: 0,
        averageBasket: 0,
        uniqueCustomers: 0,
        totalOrdersChange: 0,
        totalRevenueChange: 0,
        averageBasketChange: 0,
        uniqueCustomersChange: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, []);

  const getChangeType = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = (value) => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Configuration des cartes KPI (avec traductions)
  const kpiCards = [
    {
      id: 1,
      title: t('dashboard.kpi.totalOrders'),
      value: formatNumber(kpiData.totalOrders),
      change: formatChange(kpiData.totalOrdersChange),
      changeType: getChangeType(kpiData.totalOrdersChange),
      icon: RiShoppingBag3Line
    },
    {
      id: 2,
      title: t('dashboard.kpi.totalRevenue'),
      value: formatCurrency(kpiData.totalRevenue),
      change: formatChange(kpiData.totalRevenueChange),
      changeType: getChangeType(kpiData.totalRevenueChange),
      icon: RiMoneyDollarCircleLine
    },
    {
      id: 3,
      title: t('dashboard.kpi.averageBasket'),
      value: formatCurrency(kpiData.averageBasket),
      change: formatChange(kpiData.averageBasketChange),
      changeType: getChangeType(kpiData.averageBasketChange),
      icon: RiShoppingCartLine
    },
    {
      id: 4,
      title: t('dashboard.kpi.uniqueCustomers'),
      value: formatNumber(kpiData.uniqueCustomers),
      change: formatChange(kpiData.uniqueCustomersChange),
      changeType: getChangeType(kpiData.uniqueCustomersChange),
      icon: RiGroupLine
    }
  ];

  if (loading) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card-skeleton">
            {t('common.loading')}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      {kpiCards.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          changeType={kpi.changeType}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};

export default KpiGrid;