import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiShoppingBag3Line, RiSearchLine } from 'react-icons/ri';
import './css/OrdersEmptyState.css';

const OrdersEmptyState = ({ filters, onReset }) => {
  const { t } = useTranslation();

  // Vérifier si des filtres sont actifs
  const hasFilters = filters && Object.values(filters).some(v => v !== '' && v !== '30days');

  return (
    <div className="orders-empty">
      <div className="orders-empty-icon">
        {hasFilters ? <RiSearchLine /> : <RiShoppingBag3Line />}
      </div>
      <h3>
        {hasFilters 
          ? t('orders.empty.noResults') 
          : t('orders.empty.noOrders')
        }
      </h3>
      <p>
        {hasFilters 
          ? t('orders.empty.noResultsDesc') 
          : t('orders.empty.noOrdersDesc')
        }
      </p>
      {hasFilters && onReset && (
        <button className="orders-empty-btn" onClick={onReset}>
          {t('orders.filters.reset')}
        </button>
      )}
    </div>
  );
};

export default OrdersEmptyState;