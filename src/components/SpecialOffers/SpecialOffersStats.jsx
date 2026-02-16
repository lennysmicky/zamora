// src/components/specialOffers/SpecialOffersStats.jsx
import React from 'react';
import {
  RiGiftLine,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiCoupon3Line,
  RiMoneyDollarCircleLine,
  RiPercentLine
} from 'react-icons/ri';
import './css/SpecialOffersStats.css';

const SpecialOffersStats = ({ stats, formatAmount, t }) => {
  return (
    <div className="offers-stats">
      <div className="offers-stat-card">
        <div className="offers-stat-icon total">
          <RiGiftLine />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{stats.totalOffers || 0}</span>
          <span className="offers-stat-label">{t('specialOffers.stats.total', 'Total offres')}</span>
        </div>
      </div>
      <div className="offers-stat-card">
        <div className="offers-stat-icon success">
          <RiCheckboxCircleLine />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{stats.activeOffers || 0}</span>
          <span className="offers-stat-label">{t('specialOffers.stats.active', 'Actives')}</span>
        </div>
      </div>
      <div className="offers-stat-card">
        <div className="offers-stat-icon info">
          <RiEyeLine />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{formatAmount(stats.totalViews)}</span>
          <span className="offers-stat-label">{t('specialOffers.stats.views', 'Vues')}</span>
        </div>
      </div>
      <div className="offers-stat-card">
        <div className="offers-stat-icon warning">
          <RiCoupon3Line />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{formatAmount(stats.totalRedemptions)}</span>
          <span className="offers-stat-label">{t('specialOffers.stats.redemptions', 'Utilisations')}</span>
        </div>
      </div>
      <div className="offers-stat-card">
        <div className="offers-stat-icon revenue">
          <RiMoneyDollarCircleLine />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{formatAmount(stats.totalRevenue)}</span>
          <span className="offers-stat-label">{t('specialOffers.stats.revenue', 'CA généré')}</span>
        </div>
      </div>
      <div className="offers-stat-card">
        <div className="offers-stat-icon conversion">
          <RiPercentLine />
        </div>
        <div className="offers-stat-content">
          <span className="offers-stat-value">{stats.conversionRate || 0}%</span>
          <span className="offers-stat-label">{t('specialOffers.stats.conversion', 'Conversion')}</span>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersStats;