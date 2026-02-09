// src/components/payments/TransactionFilters.jsx
import React from 'react';
import { RiFilterLine } from 'react-icons/ri';
import './css/TransactionFilters.css';

const TransactionFilters = ({ filters, updateFilters, t }) => {
  return (
    <div className="payments-filters">
      <div className="payments-filter-select">
        <RiFilterLine />
        <select
          value={filters.period}
          onChange={(e) => updateFilters({ period: e.target.value })}
        >
          <option value="7d">{t('payments.filters.7days', '7 jours')}</option>
          <option value="30d">{t('payments.filters.30days', '30 jours')}</option>
          <option value="90d">{t('payments.filters.90days', '90 jours')}</option>
          <option value="custom">{t('payments.filters.custom', 'Personnalisé')}</option>
        </select>
      </div>
      <div className="payments-filter-select">
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="">{t('payments.filters.allStatus', 'Tous les statuts')}</option>
          <option value="PAID">{t('payments.status.paid', 'Payé')}</option>
          <option value="PENDING">{t('payments.status.pending', 'En attente')}</option>
          <option value="FAILED">{t('payments.status.failed', 'Échoué')}</option>
        </select>
      </div>
      <div className="payments-filter-select">
        <select
          value={filters.method}
          onChange={(e) => updateFilters({ method: e.target.value })}
        >
          <option value="">{t('payments.filters.allMethods', 'Toutes les méthodes')}</option>
          <option value="cash">{t('payments.methods.cash', 'Espèces')}</option>
          <option value="mobile_money">{t('payments.methods.mobileMoney', 'Mobile Money')}</option>
        </select>
      </div>
    </div>
  );
};

export default TransactionFilters;