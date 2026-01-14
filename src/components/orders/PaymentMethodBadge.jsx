import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiBankCardLine,
  RiCashLine,
  RiSmartphoneLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './css/OrdersBadges.css';

const PaymentMethodBadge = ({ method }) => {
  const { t } = useTranslation();

  const methodConfig = {
    CARD: {
      label: t('orders.paymentMethod.card'),
      icon: RiBankCardLine,
      className: 'method-card'
    },
    CASH_ON_DELIVERY: {
      label: t('orders.paymentMethod.cashOnDelivery'),
      icon: RiCashLine,
      className: 'method-cash'
    },
    MOBILE_MONEY: {
      label: t('orders.paymentMethod.mobileMoney'),
      icon: RiSmartphoneLine,
      className: 'method-mobile'
    },
    OTHER: {
      label: t('orders.paymentMethod.other'),
      icon: RiMoneyDollarCircleLine,
      className: 'method-other'
    }
  };

  const config = methodConfig[method] || methodConfig.OTHER;
  const Icon = config.icon;

  return (
    <span className={`method-badge ${config.className}`}>
      <Icon className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default PaymentMethodBadge;