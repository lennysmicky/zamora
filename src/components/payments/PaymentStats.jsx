// src/components/payments/PaymentStats.jsx
import React from 'react';
import {
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine
} from 'react-icons/ri';
import './css/PaymentStats.css';

const PaymentStats = ({ stats, formatAmount, t }) => {
  return (
    <div className="payments-stats">
      <div className="payments-stat-card">
        <div className="payments-stat-icon total">
          <RiMoneyDollarCircleLine />
        </div>
        <div className="payments-stat-content">
          <span className="payments-stat-value">{formatAmount(stats.totalAmount)}</span>
          <span className="payments-stat-label">{t('payments.stats.total', 'Total')}</span>
        </div>
      </div>
      <div className="payments-stat-card">
        <div className="payments-stat-icon success">
          <RiCheckboxCircleLine />
        </div>
        <div className="payments-stat-content">
          <span className="payments-stat-value">{formatAmount(stats.paidAmount)}</span>
          <span className="payments-stat-label">{t('payments.stats.paid', 'Payé')}</span>
        </div>
      </div>
      <div className="payments-stat-card">
        <div className="payments-stat-icon warning">
          <RiTimeLine />
        </div>
        <div className="payments-stat-content">
          <span className="payments-stat-value">{formatAmount(stats.pendingAmount)}</span>
          <span className="payments-stat-label">{t('payments.stats.pending', 'En attente')}</span>
        </div>
      </div>
      <div className="payments-stat-card">
        <div className="payments-stat-icon error">
          <RiCloseCircleLine />
        </div>
        <div className="payments-stat-content">
          <span className="payments-stat-value">{formatAmount(stats.failedAmount)}</span>
          <span className="payments-stat-label">{t('payments.stats.failed', 'Échoué')}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;