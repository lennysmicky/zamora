// src/components/specialOffers/SpecialOfferCard.jsx
import React from 'react';
import { RiTimeLine, RiPercentLine } from 'react-icons/ri';
import './css/SpecialOfferCard.css';

const SpecialOfferCard = ({ offer, formatAmount }) => {
  const getValueDisplay = () => {
    switch (offer.type) {
      case 'percentage':
        return `-${offer.value}%`;
      case 'fixed':
        return `-${formatAmount(offer.value)} F`;
      case 'special_price':
        return `${formatAmount(offer.value)} F`;
      case 'bogo':
        return '1+1';
      case 'free_delivery':
        return 'Livraison gratuite';
      case 'bundle':
        return 'Bundle';
      default:
        return offer.value;
    }
  };

  return (
    <div className="offer-preview-card">
      {offer.image ? (
        <div className="preview-image">
          <img src={offer.image} alt={offer.title} />
          <div className="preview-badge">
            {getValueDisplay()}
          </div>
        </div>
      ) : (
        <div className="preview-image placeholder">
          <div className="preview-badge large">
            {getValueDisplay()}
          </div>
        </div>
      )}
      
      <div className="preview-content">
        <h3 className="preview-title">{offer.title}</h3>
        {offer.description && (
          <p className="preview-description">{offer.description}</p>
        )}
        
        {offer.promoCode && (
          <div className="preview-code">
            <span className="code-label">Code:</span>
            <span className="code-value">{offer.promoCode}</span>
          </div>
        )}
        
        <div className="preview-meta">
          <RiTimeLine />
          <span>
            Jusqu'au {new Date(offer.endDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferCard;