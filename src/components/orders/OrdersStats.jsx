import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiShoppingBag3Line, 
  RiTimeLine, 
  RiCheckboxCircleLine, 
  RiCloseCircleLine 
} from 'react-icons/ri';
import './css/OrdersStats.css';

const OrdersStats = ({ stats, loading }) => {
  const { t } = useTranslation();

  const statsConfig = [
    {
      id: 'total',
      label: t('orders.stats.total'),
      value: stats?.total || 0,
      icon: RiShoppingBag3Line,
      color: 'primary'
    },
    {
      id: 'pending',
      label: t('orders.stats.pending'),
      value: stats?.pending || 0,
      icon: RiTimeLine,
      color: 'warning'
    },
    {
      id: 'delivered',
      label: t('orders.stats.delivered'),
      value: stats?.delivered || 0,
      icon: RiCheckboxCircleLine,
      color: 'success'
    },
    {
      id: 'cancelled',
      label: t('orders.stats.cancelled'),
      value: stats?.cancelled || 0,
      icon: RiCloseCircleLine,
      color: 'error'
    }
  ];

  if (loading) {
    return (
      <div className="orders-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="orders-stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-value"></div>
              <div className="skeleton-label"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="orders-stats">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className={`orders-stat-card stat-${stat.color}`}>
            <div className="orders-stat-icon">
              <Icon />
            </div>
            <div className="orders-stat-content">
              <span className="orders-stat-value">{stat.value}</span>
              <span className="orders-stat-label">{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersStats;