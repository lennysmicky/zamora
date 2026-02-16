import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import './css/OrderDetailsModal.css';

const OrderDetailsHeader = ({ order }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const orderNumber =
    order?.order_number || order?.orderNumber || (order?.id ? `ORD-${order.id}` : '-');

  const createdAt = order?.created_at || order?.createdAt || null;

  return (
    <div className="order-details-header">
      <div className="order-details-header-left">
        <h3 className="order-number">{orderNumber}</h3>
        <span className="order-date">{formatDate(createdAt)}</span>
      </div>

      <div className="order-details-header-right">
        <OrderStatusBadge status={order?.status} />
        <PaymentStatusBadge status={order?.payment_status} />
      </div>
    </div>
  );
};

export default OrderDetailsHeader;
