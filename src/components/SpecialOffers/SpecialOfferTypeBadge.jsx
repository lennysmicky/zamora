// src/components/specialOffers/SpecialOfferTypeBadge.jsx
import React from 'react';
import {
  RiPercentLine,
  RiPriceTag3Line,
  RiVipCrownLine,
  RiStackLine,
  RiGift2Line,
  RiTruckLine
} from 'react-icons/ri';
import './css/SpecialOffersBadges.css';

const SpecialOfferTypeBadge = ({ type, t }) => {
  const typeConfig = {
    percentage: {
      label: t('specialOffers.types.percentage', '% Remise'),
      icon: RiPercentLine,
      class: 'percentage'
    },
    fixed: {
      label: t('specialOffers.types.fixed', 'Montant fixe'),
      icon: RiPriceTag3Line,
      class: 'fixed'
    },
    special_price: {
      label: t('specialOffers.types.specialPrice', 'Prix spécial'),
      icon: RiVipCrownLine,
      class: 'special-price'
    },
    bundle: {
      label: t('specialOffers.types.bundle', 'Bundle'),
      icon: RiStackLine,
      class: 'bundle'
    },
    bogo: {
      label: t('specialOffers.types.bogo', '1+1'),
      icon: RiGift2Line,
      class: 'bogo'
    },
    free_delivery: {
      label: t('specialOffers.types.freeDelivery', 'Livraison gratuite'),
      icon: RiTruckLine,
      class: 'free-delivery'
    }
  };

  const config = typeConfig[type] || { 
    label: type, 
    icon: RiGift2Line, 
    class: 'default' 
  };

  const Icon = config.icon;

  return (
    <span className={`offer-type-badge ${config.class}`}>
      <Icon />
      <span>{config.label}</span>
    </span>
  );
};

export default SpecialOfferTypeBadge;