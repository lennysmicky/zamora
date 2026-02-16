// src/components/specialOffers/SpecialOfferDetail.jsx
import React from 'react';
import {
  RiEditLine,
  RiPlayLine,
  RiPauseLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiHistoryLine
} from 'react-icons/ri';
import SpecialOfferCard from './SpecialOfferCard';
import SpecialOfferStatusBadge from './SpecialOfferStatusBadge';
import SpecialOfferTypeBadge from './SpecialOfferTypeBadge';
import './css/SpecialOfferDetail.css';

const SpecialOfferDetail = ({
  offer,
  history,
  onEdit,
  onToggleStatus,
  formatAmount,
  formatDate,
  t
}) => {
  return (
    <div className="offer-detail">
      {/* Preview Card */}
      <div className="detail-section">
        <h4 className="detail-section-title">
          {t('specialOffers.detail.preview', 'Aperçu client')}
        </h4>
        <SpecialOfferCard offer={offer} formatAmount={formatAmount} />
      </div>

      {/* Info Grid */}
      <div className="detail-section">
        <h4 className="detail-section-title">
          {t('specialOffers.detail.info', 'Informations')}
        </h4>
        
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.status', 'Statut')}</span>
            <SpecialOfferStatusBadge status={offer.status} t={t} />
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.type', 'Type')}</span>
            <SpecialOfferTypeBadge type={offer.type} t={t} />
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.value', 'Valeur')}</span>
            <span className="detail-value highlight">
              {offer.type === 'percentage' && `${offer.value}%`}
              {offer.type === 'fixed' && `${formatAmount(offer.value)} F CFA`}
              {offer.type === 'special_price' && `${formatAmount(offer.value)} F CFA`}
              {offer.type === 'bundle' && t('specialOffers.types.bundle', 'Bundle')}
              {offer.type === 'bogo' && t('specialOffers.types.bogo', '1+1')}
              {offer.type === 'free_delivery' && t('specialOffers.types.freeDelivery', 'Gratuit')}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.promoCode', 'Code promo')}</span>
            <span className="detail-value code">{offer.promoCode || '-'}</span>
          </div>
        </div>
      </div>

      {/* Period */}
      <div className="detail-section">
        <h4 className="detail-section-title">
          <RiCalendarLine />
          {t('specialOffers.detail.period', 'Période')}
        </h4>
        
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.startDate', 'Début')}</span>
            <span className="detail-value">{formatDate(offer.startDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('specialOffers.detail.endDate', 'Fin')}</span>
            <span className="detail-value">{formatDate(offer.endDate)}</span>
          </div>
          {offer.startTime && (
            <div className="detail-item">
              <span className="detail-label">{t('specialOffers.detail.timeSlot', 'Créneau')}</span>
              <span className="detail-value">{offer.startTime} - {offer.endTime}</span>
            </div>
          )}
          {offer.daysOfWeek && offer.daysOfWeek.length > 0 && (
            <div className="detail-item">
              <span className="detail-label">{t('specialOffers.detail.days', 'Jours')}</span>
              <span className="detail-value">{offer.daysOfWeek.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="detail-section">
        <h4 className="detail-section-title">
          {t('specialOffers.detail.stats', 'Statistiques')}
        </h4>
        
        <div className="detail-stats">
          <div className="stat-item">
            <span className="stat-value">{formatAmount(offer.views || 0)}</span>
            <span className="stat-label">{t('specialOffers.stats.views', 'Vues')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{offer.usageCount || 0}</span>
            <span className="stat-label">{t('specialOffers.stats.redemptions', 'Utilisations')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatAmount(offer.revenue || 0)} F</span>
            <span className="stat-label">{t('specialOffers.stats.revenue', 'CA généré')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{offer.conversionRate || 0}%</span>
            <span className="stat-label">{t('specialOffers.stats.conversion', 'Conversion')}</span>
          </div>
        </div>
      </div>

      {/* History */}
      {history && history.length > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">
            <RiHistoryLine />
            {t('specialOffers.detail.history', 'Historique')}
          </h4>
          
          <div className="detail-history">
            {history.map((log, index) => (
              <div key={index} className="history-item">
                <div className="history-icon">
                  <RiUserLine />
                </div>
                <div className="history-content">
                  <span className="history-action">{log.action}</span>
                  <span className="history-meta">
                    {log.userName} • {formatDate(log.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="detail-actions">
        <button className="btn-secondary" onClick={onEdit}>
          <RiEditLine />
          <span>{t('common.edit', 'Modifier')}</span>
        </button>
        <button 
          className={`btn-${offer.status === 'active' ? 'warning' : 'success'}`}
          onClick={onToggleStatus}
        >
          {offer.status === 'active' ? <RiPauseLine /> : <RiPlayLine />}
          <span>
            {offer.status === 'active' 
              ? t('common.deactivate', 'Désactiver')
              : t('common.activate', 'Activer')
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default SpecialOfferDetail;