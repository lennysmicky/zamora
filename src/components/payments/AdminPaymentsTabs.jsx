// src/components/payments/AdminPaymentsTabs.jsx
import React from 'react';
import {
  RiExchangeDollarLine,
  RiPieChartLine,
  RiRefreshLine,
  RiDownloadLine,
  RiLoader4Line
} from 'react-icons/ri';
import './css/PaymentsTabs.css';

const AdminPaymentsTabs = ({
  activeTab,
  onTabChange,
  onRefresh,
  onExport,
  loading,
  t
}) => {
  return (
    <div className="payments-header-row">
      {/* Tabs */}
      <div className="payments-tabs">
        <button
          className={`payments-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => onTabChange('transactions')}
        >
          <RiExchangeDollarLine />
          <span>{t('payments.tabs.transactions', 'Transactions')}</span>
        </button>
        <button
          className={`payments-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
        >
          <RiPieChartLine />
          <span>{t('payments.tabs.overview', 'Vue d\'ensemble')}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="payments-header-actions">
        <button
          className="payments-btn-secondary"
          onClick={onRefresh}
          disabled={loading.transactions}
          title={t('common.refresh', 'Rafraîchir')}
        >
          <RiRefreshLine className={loading.transactions ? 'spin' : ''} />
        </button>
        <button
          className="payments-btn-secondary"
          onClick={onExport}
          disabled={loading.exporting}
        >
          <RiDownloadLine />
          <span>{t('payments.export', 'Exporter')}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPaymentsTabs;