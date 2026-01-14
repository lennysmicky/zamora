import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import './css/OrderDetailsModal.css';

const OrderDetailsHeader = ({ order }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="order-details-header">
      <div className="order-details-header-left">
        <h3 className="order-number">
          {order.order_number || `ORD-${order.id}`}
        </h3>
        <span className="order-date">{formatDate(order.created_at)}</span>
      </div>

      <div className="order-details-header-right">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.payment_status} />
      </div>
    </div>
  );
};

export default OrderDetailsHeader;