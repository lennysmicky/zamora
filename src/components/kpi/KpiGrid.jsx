import React from 'react';
import { useTranslation } from 'react-i18next';
import KpiCard from './KpiCard';
import { 
  RiShoppingBag3Line, 
  RiMoneyDollarCircleLine, 
  RiShoppingCartLine,
  RiGroupLine 
} from 'react-icons/ri';
import useDashboardData from '../../hooks/useDashboardData';
import './KpiGrid.css';

const KpiGrid = () => {
  const { t } = useTranslation();

  // Récupération des données depuis le hook
  const { kpis, isLoading } = useDashboardData();

  // Sécuriser l'accès aux valeurs pour toujours afficher les cartes
  const safeKpis = {
    totalOrders: kpis?.totalOrders ?? 0,
    growthOrders: kpis?.growthOrders ?? 0,
    totalRevenue: kpis?.totalRevenue ?? 0,
    growthRevenue: kpis?.growthRevenue ?? 0,
    averageOrderValue: kpis?.averageOrderValue ?? 0,
    growthBasket: kpis?.growthBasket ?? 0, 
    totalCustomers: kpis?.totalCustomers ?? 0,
    growthCustomers: kpis?.growthCustomers ?? 0
  };

  const getChangeType = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = (value) => {
    if (!value) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Configuration des cartes KPI
  const kpiCards = [
    {
      id: 1,
      title: t('dashboard.kpi.totalOrders'),
      value: formatNumber(safeKpis.totalOrders),
      change: formatChange(safeKpis.growthOrders),
      changeType: getChangeType(safeKpis.growthOrders),
      icon: RiShoppingBag3Line,
      unit:''
    },
    {
      id: 2,
      title: t('dashboard.kpi.totalRevenue'),
      value: formatCurrency(safeKpis.totalRevenue),
      change: formatChange(safeKpis.growthRevenue),
      changeType: getChangeType(safeKpis.growthRevenue),
      icon: RiMoneyDollarCircleLine,
      unit: 'FCFA'
    },
    {
      id: 3,
      title: t('dashboard.kpi.averageBasket'),
      value: formatCurrency(safeKpis.averageOrderValue),
      change: formatChange(safeKpis.growthBasket),
      changeType: getChangeType(safeKpis.growthBasket),
      icon: RiShoppingCartLine,
      unit:''
    },
    {
      id: 4,
      title: t('dashboard.kpi.uniqueCustomers'),
      value: formatNumber(safeKpis.totalCustomers),
      change: formatChange(safeKpis.growthCustomers),
      changeType: getChangeType(safeKpis.growthCustomers),
      icon: RiGroupLine
    }
  ];

  return (
    <div className="kpi-grid">
      {kpiCards.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.title}
          value={isLoading ? '...' : kpi.value}
          change={isLoading ? '...' : kpi.change}
          changeType={kpi.changeType}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};

export default KpiGrid;
