import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiBankCardLine,
  RiCashLine,
  RiSmartphoneLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './css/OrdersBadges.css';

const normalize = (s) => String(s ?? '').trim().toLowerCase();

const toUIMethod = (m) => {
  const v = normalize(m);

  // backend enum: espece | virement (+ tmoney dans tes données)
  if (['espece', 'espèce', 'cash', 'cash_on_delivery', 'cod'].includes(v)) return 'CASH_ON_DELIVERY';
  if (['virement', 'bank', 'bank_transfer', 'transfer'].includes(v)) return 'CARD'; // si tu veux un badge dédié "virement", dis-le
  if (['tmoney', 't-money', 'mobile_money', 'momo', 'moovmoney', 'orangemoney', 'wave'].includes(v)) return 'MOBILE_MONEY';

  // déjà en format UI ?
  if (['card', 'cash_on_delivery', 'mobile_money', 'other'].includes(v)) return v.toUpperCase();

  return 'OTHER';
};

const PaymentMethodBadge = ({ method }) => {
  const { t } = useTranslation();
  const key = toUIMethod(method);

  const methodConfig = {
    CARD: { label: t('orders.paymentMethod.card'), icon: RiBankCardLine, className: 'method-card' },
    CASH_ON_DELIVERY: { label: t('orders.paymentMethod.cashOnDelivery'), icon: RiCashLine, className: 'method-cash' },
    MOBILE_MONEY: { label: t('orders.paymentMethod.mobileMoney'), icon: RiSmartphoneLine, className: 'method-mobile' },
    OTHER: { label: t('orders.paymentMethod.other'), icon: RiMoneyDollarCircleLine, className: 'method-other' }
  };

  const config = methodConfig[key] || methodConfig.OTHER;
  const Icon = config.icon;

  return (
    <span className={`method-badge ${config.className}`}>
      <Icon className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default PaymentMethodBadge;
