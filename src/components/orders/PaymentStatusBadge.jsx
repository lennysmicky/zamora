import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiTimeLine, RiCheckboxCircleLine, RiCloseCircleLine, RiRefund2Line } from 'react-icons/ri';
import './css/OrdersBadges.css';

const PaymentStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const statusConfig = {
	PENDING: { label: t('orders.paymentStatus.pending'), icon: RiTimeLine, className: 'payment-pending' },
	PAID: { label: t('orders.paymentStatus.paid'), icon: RiCheckboxCircleLine, className: 'payment-paid' },
	FAILED: { label: t('orders.paymentStatus.failed'), icon: RiCloseCircleLine, className: 'payment-failed' },
	REFUNDED: { label: t('orders.paymentStatus.refunded'), icon: RiRefund2Line, className: 'payment-refunded' }
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
	<span className={`payment-badge ${config.className}`}>
	  <Icon className="badge-icon" />
	  <span className="badge-label">{config.label}</span>
	</span>
  );
};

export default PaymentStatusBadge;