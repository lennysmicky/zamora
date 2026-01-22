import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiArrowRightSLine } from 'react-icons/ri';
import useDashboardData from '../../hooks/useDashboardData';
import './RecentOrdersTable.css';

const RecentOrdersTable = () => {
  const { t } = useTranslation();

  //  Récupération des données depuis le hook
  const { recentOrders, isLoading } = useDashboardData();

  const getStatusClass = (status) => {
    const statusClasses = {
      delivered: 'status-delivered',
      preparing: 'status-preparing',
      pending: 'status-pending',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  const getStatusLabel = (status) => t(`status.${status}`);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatItems = (count) => {
    if (count === 0) return `0 ${t('orders.item')}`;
    if (count === 1) return `1 ${t('orders.item')}`;
    return `${count} ${t('orders.itemPlural')}`;
  };

  // ================================
  // ÉTAT 1 : LOADING
  // ================================
  if (isLoading) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t('dashboard.recentOrders')}</h3>
          <button className="recent-orders-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="recent-orders-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell cell-id"></div>
              <div className="skeleton-cell cell-customer"></div>
              <div className="skeleton-cell cell-items"></div>
              <div className="skeleton-cell cell-total"></div>
              <div className="skeleton-cell cell-status"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 2 : EMPTY
  // ================================
  if (!recentOrders || recentOrders.length === 0) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t('dashboard.recentOrders')}</h3>
          <button className="recent-orders-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="recent-orders-empty">
          <p>{t('dashboard.noOrders')}</p>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA
  // ================================
  return (
    <div className="recent-orders-card">
      <div className="recent-orders-header">
        <h3>{t('dashboard.recentOrders')}</h3>
        <button className="recent-orders-link">
          {t('dashboard.viewAll')}
          <RiArrowRightSLine />
        </button>
      </div>

      <div className="recent-orders-table-wrapper">
        <table className="recent-orders-table">
          <thead>
            <tr>
              <th>{t('orders.orderId')}</th>
              <th>{t('orders.customer')}</th>
              <th>{t('orders.items')}</th>
              <th>{t('orders.total')}</th>
              <th>{t('orders.status')}</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td className="order-customer">{order.customer}</td>
                <td className="order-items">{formatItems(order.items)}</td>
                <td className="order-total">{formatCurrency(order.total)}</td>
                <td>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
