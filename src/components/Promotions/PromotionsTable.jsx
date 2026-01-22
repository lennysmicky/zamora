import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiEditLine,
  RiDeleteBinLine,
  RiToggleLine,
  RiToggleFill,
  RiCalendarLine,
  RiPercentLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './PromotionsTable.css';

const PromotionsTable = ({
  promotions,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  getPromotionStatus
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDiscount = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}%`;
    }
    return `${promotion.discount_value} FCFA`;
  };

  const getStatusBadge = (promotion) => {
    const status = getPromotionStatus(promotion);
    const statusConfig = {
      active: { label: t('promotions.status.active'), class: 'status-active' },
      scheduled: { label: t('promotions.status.scheduled'), class: 'status-scheduled' },
      expired: { label: t('promotions.status.expired'), class: 'status-expired' },
      inactive: { label: t('promotions.status.inactive'), class: 'status-inactive' }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return <span className={`promotion-status-badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="promotions-table-loading">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="promotions-table-skeleton-row" />
        ))}
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="promotions-table-empty">
        <RiPercentLine className="empty-icon" />
        <h3>{t('promotions.empty.title')}</h3>
        <p>{t('promotions.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="promotions-table-wrapper">
      <table className="promotions-table">
        <thead>
          <tr>
            <th>{t('promotions.table.title')}</th>
            <th>{t('promotions.table.restaurant')}</th>
            <th>{t('promotions.table.discount')}</th>
            <th>{t('promotions.table.period')}</th>
            <th>{t('promotions.table.status')}</th>
            <th>{t('promotions.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map(promotion => (
            <tr key={promotion.id}>
              <td>
                <div className="promotion-info">
                  <span className="promotion-title">{promotion.title}</span>
                  {promotion.code && (
                    <span className="promotion-code">{promotion.code}</span>
                  )}
                </div>
              </td>
              <td>
                <span className="promotion-restaurant">
                  {promotion.restaurant?.name || t('promotions.allRestaurants')}
                </span>
              </td>
              <td>
                <div className="promotion-discount">
                  {promotion.discount_type === 'percentage' ? (
                    <RiPercentLine />
                  ) : (
                    <RiMoneyDollarCircleLine />
                  )}
                  <span>{formatDiscount(promotion)}</span>
                </div>
              </td>
              <td>
                <div className="promotion-period">
                  <RiCalendarLine />
                  <span>
                    {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                  </span>
                </div>
              </td>
              <td>{getStatusBadge(promotion)}</td>
              <td>
                <div className="promotion-actions">
                  <button
                    className="action-btn toggle-btn"
                    onClick={() => onToggleStatus(promotion.id)}
                    title={promotion.is_active ? t('promotions.deactivate') : t('promotions.activate')}
                  >
                    {promotion.is_active ? <RiToggleFill /> : <RiToggleLine />}
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(promotion)}
                    title={t('common.edit')}
                  >
                    <RiEditLine />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(promotion)}
                    title={t('common.delete')}
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
  );
};

export default PromotionsTable;