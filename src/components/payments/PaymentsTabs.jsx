// src/components/payments/PaymentsTabs.jsx
import React from 'react';
import {
  RiExchangeDollarLine,
  RiSettings4Line,
  RiRefreshLine,
  RiDownloadLine,
  RiSave3Line,
  RiLoader4Line
} from 'react-icons/ri';
import './css/PaymentsTabs.css';

const PaymentsTabs = ({
  activeTab,
  onTabChange,
  onRefresh,
  onExport,
  onSave,
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
          className={`payments-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => onTabChange('config')}
        >
          <RiSettings4Line />
          <span>{t('payments.tabs.config', 'Configuration')}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="payments-header-actions">
        {activeTab === 'transactions' && (
          <>
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
          </>
        )}

        {activeTab === 'config' && (
          <button
            className="payments-btn-primary"
            onClick={onSave}
            disabled={loading.saving}
          >
            {loading.saving ? <RiLoader4Line className="spin" /> : <RiSave3Line />}
            <span>{t('common.save', 'Enregistrer')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentsTabs;