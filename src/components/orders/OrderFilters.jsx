import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiSearchLine, 
  RiFilterLine, 
  RiCloseLine,
  RiCalendarLine,
  RiStoreLine,
  RiArrowDownSLine
} from 'react-icons/ri';
import './css/OrdersFilters.css';

const OrdersFilters = ({ filters, onFiltersChange }) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Options pour les filtres
  const statusOptions = [
    { value: '', label: t('orders.filters.allStatus') },
    { value: 'PENDING', label: t('orders.status.pending') },
    { value: 'IN_PREPARATION', label: t('orders.status.inPreparation') },
    { value: 'OUT_FOR_DELIVERY', label: t('orders.status.outForDelivery') },
    { value: 'DELIVERED', label: t('orders.status.delivered') },
    { value: 'CANCELLED', label: t('orders.status.cancelled') }
  ];

  const paymentStatusOptions = [
    { value: '', label: t('orders.filters.allPaymentStatus') },
    { value: 'PENDING', label: t('orders.paymentStatus.pending') },
    { value: 'PAID', label: t('orders.paymentStatus.paid') },
    { value: 'FAILED', label: t('orders.paymentStatus.failed') },
    { value: 'REFUNDED', label: t('orders.paymentStatus.refunded') }
  ];

  const paymentMethodOptions = [
    { value: '', label: t('orders.filters.allMethods') },
    { value: 'CARD', label: t('orders.paymentMethod.card') },
    { value: 'CASH_ON_DELIVERY', label: t('orders.paymentMethod.cashOnDelivery') },
    { value: 'MOBILE_MONEY', label: t('orders.paymentMethod.mobileMoney') },
    { value: 'OTHER', label: t('orders.paymentMethod.other') }
  ];

  const sourceOptions = [
    { value: '', label: t('orders.filters.allSources') },
    { value: 'MOBILE', label: t('orders.source.mobile') },
    { value: 'WEB', label: t('orders.source.web') },
    { value: 'OTHER', label: t('orders.source.other') }
  ];

  const periodOptions = [
    { value: 'today', label: t('orders.filters.today') },
    { value: '7days', label: t('orders.filters.last7Days') },
    { value: '30days', label: t('orders.filters.last30Days') },
    { value: 'custom', label: t('orders.filters.custom') }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      source: '',
      period: '30days',
      restaurant: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== '30days');

  return (
    <div className="orders-filters">
      {/* Ligne principale */}
      <div className="orders-filters-main">
        {/* Recherche */}
        <div className="orders-search">
          <RiSearchLine className="orders-search-icon" />
          <input
            type="text"
            placeholder={t('orders.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="orders-search-input"
          />
          {filters.search && (
            <button 
              className="orders-search-clear"
              onClick={() => handleFilterChange('search', '')}
            >
              <RiCloseLine />
            </button>
          )}
        </div>

        {/* Filtres rapides */}
        <div className="orders-filters-quick">
          {/* Statut commande */}
          <div className="orders-filter-select">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>

          {/* Statut paiement */}
          <div className="orders-filter-select">
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            >
              {paymentStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>

          {/* Période */}
          <div className="orders-filter-select">
            <RiCalendarLine className="select-icon" />
            <select
              value={filters.period || '30days'}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>
        </div>

        {/* Boutons */}
        <div className="orders-filters-actions">
          <button 
            className={`orders-filter-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <RiFilterLine />
            <span>{t('orders.filters.advanced')}</span>
          </button>

          {hasActiveFilters && (
            <button 
              className="orders-filter-reset"
              onClick={handleReset}
            >
              <RiCloseLine />
              <span>{t('orders.filters.reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="orders-filters-advanced">
          {/* Méthode de paiement */}
          <div className="orders-filter-group">
            <label>{t('orders.table.paymentMethod')}</label>
            <div className="orders-filter-select">
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                {paymentMethodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <RiArrowDownSLine className="select-arrow" />
            </div>
          </div>

          {/* Source */}
          <div className="orders-filter-group">
            <label>{t('orders.table.source')}</label>
            <div className="orders-filter-select">
              <select
                value={filters.source || ''}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                {sourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <RiArrowDownSLine className="select-arrow" />
            </div>
          </div>

          {/* Restaurant */}
          <div className="orders-filter-group">
            <label>{t('orders.table.restaurant')}</label>
            <div className="orders-filter-select">
              <RiStoreLine className="select-icon" />
              <select
                value={filters.restaurant || ''}
                onChange={(e) => handleFilterChange('restaurant', e.target.value)}
              >
                <option value="">{t('orders.filters.allRestaurants')}</option>
                {/* Options restaurants chargées dynamiquement */}
              </select>
              <RiArrowDownSLine className="select-arrow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;