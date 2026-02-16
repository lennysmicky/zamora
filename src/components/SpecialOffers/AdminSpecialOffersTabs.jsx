// src/components/specialOffers/AdminSpecialOffersTabs.jsx
import React from 'react';
import {
  RiGiftLine,
  RiFileList3Line,
  RiPieChartLine,
  RiRefreshLine,
  RiAddLine,
  RiLoader4Line
} from 'react-icons/ri';
import './css/SpecialOffersTabs.css';

const AdminSpecialOffersTabs = ({
  activeTab,
  onTabChange,
  onRefresh,
  onCreate,
  loading,
  t
}) => {
  return (
    <div className="offers-header-row">
      {/* Tabs */}
      <div className="offers-tabs">
        <button
          className={`offers-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => onTabChange('list')}
        >
          <RiGiftLine />
          <span>{t('specialOffers.tabs.list', 'Offres')}</span>
        </button>
        <button
          className={`offers-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          <RiFileList3Line />
          <span>{t('specialOffers.tabs.templates', 'Templates')}</span>
        </button>
        <button
          className={`offers-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <RiPieChartLine />
          <span>{t('specialOffers.tabs.analytics', 'Analytiques')}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="offers-header-actions">
        <button
          className="offers-btn-secondary"
          onClick={onRefresh}
          disabled={loading.offers}
          title={t('common.refresh', 'Rafraîchir')}
        >
          <RiRefreshLine className={loading.offers ? 'spin' : ''} />
        </button>
        <button
          className="offers-btn-primary"
          onClick={onCreate}
          disabled={loading.saving}
        >
          {loading.saving ? <RiLoader4Line className="spin" /> : <RiAddLine />}
          <span>{t('specialOffers.newOffer', 'Nouvelle offre')}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSpecialOffersTabs;