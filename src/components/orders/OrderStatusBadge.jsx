import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiTimeLine,
  RiRestaurantLine,
  RiTruckLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine
} from 'react-icons/ri';
import './css/OrdersBadges.css';

const normalize = (s) => String(s ?? '').trim().toLowerCase();

const toUIStatus = (s) => {
  const v = normalize(s);
  if (['en_attente', 'pending'].includes(v)) return 'PENDING';
  if (['livres', 'livré', 'delivered'].includes(v)) return 'DELIVERED';
  if (['annules', 'annulé', 'cancelled'].includes(v)) return 'CANCELLED';
  if (['in_preparation', 'preparing', 'preparation', 'préparation'].includes(v)) return 'IN_PREPARATION';
  if (['out_for_delivery'].includes(v)) return 'OUT_FOR_DELIVERY';
  return String(s ?? 'PENDING').toUpperCase();
};

const OrderStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const key = toUIStatus(status);

  const statusConfig = {
    PENDING: { label: t('orders.status.pending'), icon: RiTimeLine, className: 'status-pending' },
    IN_PREPARATION: { label: t('orders.status.inPreparation'), icon: RiRestaurantLine, className: 'status-preparation' },
    OUT_FOR_DELIVERY: { label: t('orders.status.outForDelivery'), icon: RiTruckLine, className: 'status-delivery' },
    DELIVERED: { label: t('orders.status.delivered'), icon: RiCheckboxCircleLine, className: 'status-delivered' },
    CANCELLED: { label: t('orders.status.cancelled'), icon: RiCloseCircleLine, className: 'status-cancelled' },
  };

  const config = statusConfig[key] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`order-badge ${config.className}`}>
      <Icon className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
