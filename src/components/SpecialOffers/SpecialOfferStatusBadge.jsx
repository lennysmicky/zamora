// src/components/specialOffers/SpecialOfferStatusBadge.jsx
import React from 'react';
import './css/SpecialOffersBadges.css';

const SpecialOfferStatusBadge = ({ status, t }) => {
  const statusConfig = {
    draft: {
      label: t('specialOffers.status.draft', 'Brouillon'),
      class: 'draft'
    },
    active: {
      label: t('specialOffers.status.active', 'Active'),
      class: 'active'
    },
    scheduled: {
      label: t('specialOffers.status.scheduled', 'Planifiée'),
      class: 'scheduled'
    },
    ended: {
      label: t('specialOffers.status.ended', 'Terminée'),
      class: 'ended'
    },
    paused: {
      label: t('specialOffers.status.paused', 'En pause'),
      class: 'paused'
    }
  };

  const config = statusConfig[status] || { label: status, class: 'default' };

  return (
    <span className={`offer-status-badge ${config.class}`}>
      {config.label}
    </span>
  );
};

export default SpecialOfferStatusBadge;