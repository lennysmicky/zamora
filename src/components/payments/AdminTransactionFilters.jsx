// src/components/payments/AdminTransactionFilters.jsx
import React from 'react';
import { RiFilterLine, RiSearchLine, RiCloseLine } from 'react-icons/ri';
import './css/TransactionFilters.css';

const AdminTransactionFilters = ({ filters, updateFilters, resetFilters, t }) => {
  const hasActiveFilters = filters.status || filters.method || filters.restaurant || filters.search;

  return (
    <div className="payments-filters admin-filters">
      {/* Search */}
      <div className="payments-filter-search">
        <RiSearchLine />
        <input
          type="text"
          placeholder={t('payments.filters.search', 'Rechercher...')}
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      {/* Period */}
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

      {/* Status */}
      <div className="payments-filter-select">
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="">{t('payments.filters.allStatus', 'Tous les statuts')}</option>
          <option value="PAID">{t('payments.status.paid', 'Payé')}</option>
          <option value="PENDING">{t('payments.status.pending', 'En attente')}</option>
          <option value="FAILED">{t('payments.status.failed', 'Échoué')}</option>
          <option value="REFUNDED">{t('payments.status.refunded', 'Remboursé')}</option>
        </select>
      </div>

      {/* Method */}
      <div className="payments-filter-select">
        <select
          value={filters.method}
          onChange={(e) => updateFilters({ method: e.target.value })}
        >
          <option value="">{t('payments.filters.allMethods', 'Toutes les méthodes')}</option>
          <option value="cash">{t('payments.methods.cash', 'Espèces')}</option>
          <option value="mobile_money">{t('payments.methods.mobileMoney', 'Mobile Money')}</option>
          <option value="card">{t('payments.methods.card', 'Carte')}</option>
        </select>
      </div>

      {/* Restaurant (Admin only) */}
      <div className="payments-filter-select">
        <select
          value={filters.restaurant || ''}
          onChange={(e) => updateFilters({ restaurant: e.target.value })}
        >
          <option value="">{t('payments.filters.allRestaurants', 'Tous les restaurants')}</option>
          {/* Les restaurants seront chargés dynamiquement */}
        </select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          className="payments-filter-reset"
          onClick={resetFilters}
          title={t('common.reset', 'Réinitialiser')}
        >
          <RiCloseLine />
        </button>
      )}
    </div>
  );
};

export default AdminTransactionFilters;