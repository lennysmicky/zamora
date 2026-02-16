// src/components/specialOffers/SpecialOffersTabs.jsx
import React from 'react';
import {
  RiGiftLine,
  RiRefreshLine,
  RiAddLine,
  RiLoader4Line
} from 'react-icons/ri';
import './css/SpecialOffersTabs.css';

const SpecialOffersTabs = ({
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

export default SpecialOffersTabs;