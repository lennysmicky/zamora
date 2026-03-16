// src/components/orders/OrderDetailsPayment.jsx
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
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const paymentReference =
    order?.payment_reference ??
    order?.paymentReference ??
    order?.reference_paiement ??
    order?.referencePaiement ??
    '';

  const paidAt =
    order?.paid_at ??
    order?.paidAt ??
    order?.date_paiement ??
    order?.payment_date ??
    null;

  return (
    <div className="order-details-section">
      <h3>
        <RiBankCardLine />
        {t('orders.details.payment')}
      </h3>

      <div className="payment-details">
        <div className="payment-detail-row">
          <span className="payment-label">{t('orders.table.paymentStatus')}</span>
          <PaymentStatusBadge status={order?.payment_status} />
        </div>

        <div className="payment-detail-row">
          <span className="payment-label">{t('orders.table.paymentMethod')}</span>
          <PaymentMethodBadge method={order?.payment_method} />
        </div>

        {paymentReference && (
          <div className="payment-detail-row">
            <span className="payment-label">{t('orders.details.reference')}</span>
            <span className="payment-value">{paymentReference}</span>
          </div>
        )}

        {paidAt && (
          <div className="payment-detail-row">
            <span className="payment-label">{t('orders.details.paidAt')}</span>
            <span className="payment-value">{formatDate(paidAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPayment;