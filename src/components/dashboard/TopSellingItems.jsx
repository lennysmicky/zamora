import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiArrowRightSLine } from 'react-icons/ri';
import useDashboardData from '../../hooks/useDashboardData';
import './TopSellingItems.css';

const TopSellingItems = () => {
  const { t } = useTranslation();

  //  Récupération des données depuis le hook
  const { topSellingItems, isLoading } = useDashboardData();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatSold = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // ================================
  // ÉTAT 1 : LOADING
  // ================================
  if (isLoading) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t('dashboard.topSelling')}</h3>
          <button className="top-selling-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="top-selling-item skeleton-item">
              <div className="skeleton-rank"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-meta"></div>
              </div>
              <div className="skeleton-stats"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 2 : EMPTY
  // ================================
  if (!topSellingItems || topSellingItems.length === 0) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t('dashboard.topSelling')}</h3>
          <button className="top-selling-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-empty">
          <p>{t('dashboard.noSales')}</p>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA
  // ================================
  return (
    <div className="top-selling-card">
      <div className="top-selling-header">
        <h3>{t('dashboard.topSelling')}</h3>
        <button className="top-selling-link">
          {t('dashboard.viewAll')}
          <RiArrowRightSLine />
        </button>
      </div>

      <div className="top-selling-list">
        {topSellingItems.map((item, index) => (
          <div key={item.id} className="top-selling-item">
            <div className={`top-selling-rank rank-${index + 1}`}>
              {index + 1}
            </div>
            <div className="top-selling-info">
              <span className="top-selling-name">{item.name}</span>
              <span className="top-selling-meta">
                {formatCurrency(item.price)} • {item.category}
              </span>
            </div>
            <div className="top-selling-stats">
              <span className="top-selling-sold">{formatSold(item.sold)}</span>
              <span className="top-selling-sold-label">{t('common.sold')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
