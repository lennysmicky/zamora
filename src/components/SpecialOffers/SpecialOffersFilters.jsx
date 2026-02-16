// src/components/specialOffers/SpecialOffersFilters.jsx
import React from 'react';
import { RiFilterLine, RiSearchLine, RiCloseLine } from 'react-icons/ri';
import './css/SpecialOffersFilters.css';

const SpecialOffersFilters = ({ filters, updateFilters, resetFilters, t }) => {
  const hasActiveFilters = filters.status || filters.type || filters.channel || filters.search;

  return (
    <div className="offers-filters">
      {/* Search */}
      <div className="offers-filter-search">
        <RiSearchLine />
        <input
          type="text"
          placeholder={t('specialOffers.filters.search', 'Rechercher une offre...')}
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      {/* Status */}
      <div className="offers-filter-select">
        <RiFilterLine />
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="">{t('specialOffers.filters.allStatus', 'Tous les statuts')}</option>
          <option value="draft">{t('specialOffers.status.draft', 'Brouillon')}</option>
          <option value="active">{t('specialOffers.status.active', 'Active')}</option>
          <option value="scheduled">{t('specialOffers.status.scheduled', 'Planifiée')}</option>
          <option value="ended">{t('specialOffers.status.ended', 'Terminée')}</option>
          <option value="paused">{t('specialOffers.status.paused', 'En pause')}</option>
        </select>
      </div>

      {/* Type */}
      <div className="offers-filter-select">
        <select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
        >
          <option value="">{t('specialOffers.filters.allTypes', 'Tous les types')}</option>
          <option value="percentage">{t('specialOffers.types.percentage', '% Remise')}</option>
          <option value="fixed">{t('specialOffers.types.fixed', 'Montant fixe')}</option>
          <option value="special_price">{t('specialOffers.types.specialPrice', 'Prix spécial')}</option>
          <option value="bundle">{t('specialOffers.types.bundle', 'Bundle')}</option>
          <option value="bogo">{t('specialOffers.types.bogo', '1 acheté = 1 offert')}</option>
          <option value="free_delivery">{t('specialOffers.types.freeDelivery', 'Livraison gratuite')}</option>
        </select>
      </div>

      {/* Channel */}
      <div className="offers-filter-select">
        <select
          value={filters.channel}
          onChange={(e) => updateFilters({ channel: e.target.value })}
        >
          <option value="">{t('specialOffers.filters.allChannels', 'Tous les canaux')}</option>
          <option value="dine_in">{t('specialOffers.channels.dineIn', 'Sur place')}</option>
          <option value="takeaway">{t('specialOffers.channels.takeaway', 'À emporter')}</option>
          <option value="delivery">{t('specialOffers.channels.delivery', 'Livraison')}</option>
        </select>
      </div>

      {/* Period */}
      <div className="offers-filter-select">
        <select
          value={filters.period}
          onChange={(e) => updateFilters({ period: e.target.value })}
        >
          <option value="7d">{t('specialOffers.filters.7days', '7 jours')}</option>
          <option value="30d">{t('specialOffers.filters.30days', '30 jours')}</option>
          <option value="90d">{t('specialOffers.filters.90days', '90 jours')}</option>
          <option value="all">{t('specialOffers.filters.all', 'Tout')}</option>
        </select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          className="offers-filter-reset"
          onClick={resetFilters}
          title={t('common.reset', 'Réinitialiser')}
        >
          <RiCloseLine />
        </button>
      )}
    </div>
  );
};

export default SpecialOffersFilters;