import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiBankCardLine } from 'react-icons/ri';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentMethodBadge from './PaymentMethodBadge';
import './css/OrderDetailsModal.css';

const OrderDetailsPayment = ({ order }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="order-details-section">
      <h3>
        <RiBankCardLine />
        {t('orders.details.payment')}
      </h3>

      <div className="payment-details">
        <div className="payment-detail-row">
          <span className="payment-label">{t('orders.table.paymentStatus')}</span>
          <PaymentStatusBadge status={order.payment_status} />
        </div>

        <div className="payment-detail-row">
          <span className="payment-label">{t('orders.table.paymentMethod')}</span>
          <PaymentMethodBadge method={order.payment_method} />
        </div>

        {order.payment_reference && (
          <div className="payment-detail-row">
            <span className="payment-label">{t('orders.details.reference')}</span>
            <span className="payment-value">{order.payment_reference}</span>
          </div>
        )}

        {order.paid_at && (
          <div className="payment-detail-row">
            <span className="payment-label">{t('orders.details.paidAt')}</span>
            <span className="payment-value">{formatDate(order.paid_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPayment;