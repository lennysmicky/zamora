// src/components/specialOffers/SpecialOffersTable.jsx
import React from 'react';
import {
  RiGiftLine,
  RiEyeLine,
  RiEditLine,
  RiPlayLine,
  RiPauseLine,
  RiFileCopyLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import SpecialOfferStatusBadge from './SpecialOfferStatusBadge';
import SpecialOfferTypeBadge from './SpecialOfferTypeBadge';
import './css/SpecialOffersTable.css';

const SpecialOffersTable = ({
  offers,
  loading,
  pagination,
  changePage,
  onView,
  onEdit,
  onToggleStatus,
  onDuplicate,
  onDelete,
  formatAmount,
  formatDate,
  t
}) => {
  // Empty state
  if (!loading.offers && offers.length === 0) {
    return (
      <div className="offers-content">
        <div className="offers-empty">
          <div className="offers-empty-icon">
            <RiGiftLine />
          </div>
          <h3>{t('specialOffers.empty.title', 'Aucune offre')}</h3>
          <p>{t('specialOffers.empty.message', 'Créez votre première offre spéciale')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`offers-content ${loading.offers ? 'loading' : ''}`}>
        <div className="offers-table-wrapper">
          <table className="offers-table">
            <thead>
              <tr>
                <th>{t('specialOffers.table.title', 'Titre')}</th>
                <th>{t('specialOffers.table.type', 'Type')}</th>
                <th>{t('specialOffers.table.value', 'Valeur')}</th>
                <th>{t('specialOffers.table.period', 'Période')}</th>
                <th>{t('specialOffers.table.target', 'Cible')}</th>
                <th>{t('specialOffers.table.status', 'Statut')}</th>
                <th>{t('specialOffers.table.usage', 'Utilisations')}</th>
                <th>{t('specialOffers.table.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer._id || offer.id}>
                  <td>
                    <div className="offer-title-cell">
                      {offer.image && (
                        <img 
                          src={offer.image} 
                          alt={offer.title}
                          className="offer-thumbnail"
                        />
                      )}
                      <div className="offer-title-info">
                        <span className="offer-title">{offer.title}</span>
                        {offer.promoCode && (
                          <span className="offer-code">{offer.promoCode}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <SpecialOfferTypeBadge type={offer.type} t={t} />
                  </td>
                  <td>
                    <span className="offer-value">
                      {offer.type === 'percentage' && `${offer.value}%`}
                      {offer.type === 'fixed' && `${formatAmount(offer.value)} F`}
                      {offer.type === 'special_price' && `${formatAmount(offer.value)} F`}
                      {offer.type === 'bundle' && t('specialOffers.types.bundle', 'Bundle')}
                      {offer.type === 'bogo' && t('specialOffers.types.bogo', '1+1')}
                      {offer.type === 'free_delivery' && t('specialOffers.types.freeDelivery', 'Gratuit')}
                    </span>
                  </td>
                  <td>
                    <div className="offer-period">
                      <span>{formatDate(offer.startDate)}</span>
                      <span className="period-separator">→</span>
                      <span>{formatDate(offer.endDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="offer-target">
                      {offer.targetType === 'item' && offer.targetItems?.length > 0 && (
                        `${offer.targetItems.length} article(s)`
                      )}
                      {offer.targetType === 'category' && offer.targetCategory && (
                        offer.targetCategoryName || 'Catégorie'
                      )}
                      {offer.targetType === 'all' && t('specialOffers.target.all', 'Tout le menu')}
                    </span>
                  </td>
                  <td>
                    <SpecialOfferStatusBadge status={offer.status} t={t} />
                  </td>
                  <td>
                    <div className="offer-usage">
                      <span className="usage-count">{offer.usageCount || 0}</span>
                      {offer.maxRedemptions && (
                        <span className="usage-max">/ {offer.maxRedemptions}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="offers-actions-cell">
                      <button
                        className="offer-action-btn view"
                        onClick={() => onView(offer)}
                        title={t('common.view', 'Voir')}
                      >
                        <RiEyeLine />
                      </button>
                      <button
                        className="offer-action-btn edit"
                        onClick={() => onEdit(offer)}
                        title={t('common.edit', 'Modifier')}
                      >
                        <RiEditLine />
                      </button>
                      <button
                        className={`offer-action-btn ${offer.status === 'active' ? 'pause' : 'play'}`}
                        onClick={() => onToggleStatus(offer)}
                        title={offer.status === 'active' 
                          ? t('common.deactivate', 'Désactiver')
                          : t('common.activate', 'Activer')
                        }
                      >
                        {offer.status === 'active' ? <RiPauseLine /> : <RiPlayLine />}
                      </button>
                      <button
                        className="offer-action-btn duplicate"
                        onClick={() => onDuplicate(offer)}
                        title={t('common.duplicate', 'Dupliquer')}
                      >
                        <RiFileCopyLine />
                      </button>
                      <button
                        className="offer-action-btn delete"
                        onClick={() => onDelete(offer)}
                        title={t('common.delete', 'Supprimer')}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="offers-pagination">
          <button
            className="pagination-btn"
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            {t('common.previous', 'Précédent')}
          </button>
          <span className="pagination-info">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            {t('common.next', 'Suivant')}
          </button>
        </div>
      )}
    </>
  );
};

export default SpecialOffersTable;