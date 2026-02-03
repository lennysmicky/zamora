import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiAddLine,
  RiSearchLine,
  RiPercentLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine
} from 'react-icons/ri';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsTable from '../../components/Promotions/PromotionsTable';
import PromotionForm from '../../components/Promotions/PromotionForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './PromotionsPage.css';

const PromotionsPage = () => {
  const { t } = useTranslation();
  
  const {
    promotions,
    stats,
    loading,
    filters,
    setFilters,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getPromotionStatus,
    refetch
  } = usePromotions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [restaurants] = useState([]);

  const handleRefresh = () => {
    if (refetch) refetch();
  };

  const handleCreate = () => {
    setSelectedPromotion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (promotionToDelete) {
      await deletePromotion(promotionToDelete.id || promotionToDelete._id);
      setIsDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    let result;
    
    if (selectedPromotion) {
      result = await updatePromotion(selectedPromotion.id || selectedPromotion._id, data);
    } else {
      result = await createPromotion(data);
    }

    setFormLoading(false);
    
    if (result.success) {
      setIsFormOpen(false);
      setSelectedPromotion(null);
    }
  };

  const handleToggleStatus = async (id) => {
    await togglePromotionStatus(id);
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ 
      ...prev, 
      status: prev.status === status ? '' : status 
    }));
  };

  return (
    <div className="promotions-page">
      {/* Header */}
      <div className="promotions-header">
        <div className="promotions-header-info">
          <h1>
            <RiPercentLine />
            {t('promotions.title', 'Promotions')}
          </h1>
          <p>{t('promotions.subtitle', 'Gérez toutes les promotions')}</p>
        </div>
        <div className="promotions-header-actions">
          <button
            className="promotions-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RiRefreshLine className={loading ? 'spin' : ''} />
            <span>{t('common.refresh', 'Actualiser')}</span>
          </button>
          <button className="promotions-btn-primary" onClick={handleCreate}>
            <RiAddLine />
            <span>{t('promotions.add', 'Ajouter')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="promotions-stats">
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon total">
            <RiPercentLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats?.total || 0}</span>
            <span className="promotions-stat-label">{t('promotions.stats.total', 'Total')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon active">
            <RiCheckboxCircleLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats?.active || 0}</span>
            <span className="promotions-stat-label">{t('promotions.stats.active', 'Actives')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon scheduled">
            <RiTimeLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats?.scheduled || 0}</span>
            <span className="promotions-stat-label">{t('promotions.stats.scheduled', 'Programmées')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon expired">
            <RiCloseCircleLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats?.expired || 0}</span>
            <span className="promotions-stat-label">{t('promotions.stats.expired', 'Expirées')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="promotions-filters">
        <div className="promotions-search">
          <RiSearchLine />
          <input
            type="text"
            placeholder={t('promotions.search', 'Rechercher...')}
            value={filters?.search || ''}
            onChange={handleSearch}
          />
        </div>
        <div className="promotions-filter-buttons">
          <button
            className={`filter-btn ${filters?.status === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            {t('promotions.filters.all', 'Toutes')}
          </button>
          <button
            className={`filter-btn ${filters?.status === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('active')}
          >
            {t('promotions.filters.active', 'Actives')}
          </button>
          <button
            className={`filter-btn ${filters?.status === 'scheduled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('scheduled')}
          >
            {t('promotions.filters.scheduled', 'Programmées')}
          </button>
          <button
            className={`filter-btn ${filters?.status === 'expired' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('expired')}
          >
            {t('promotions.filters.expired', 'Expirées')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="promotions-content">
        {loading ? (
          <div className="promotions-loading">
            <LoadingSpinner />
          </div>
        ) : promotions?.length === 0 ? (
          <div className="promotions-empty">
            <div className="promotions-empty-icon">
              <RiPercentLine />
            </div>
            <h3>
              {filters?.search || filters?.status
                ? t('promotions.noResults', 'Aucun résultat')
                : t('promotions.noPromotions', 'Aucune promotion')
              }
            </h3>
            <p>
              {filters?.search || filters?.status
                ? t('promotions.noResultsDesc', 'Modifiez vos filtres')
                : t('promotions.noPromotionsDesc', 'Créez votre première promotion')
              }
            </p>
          </div>
        ) : (
          <PromotionsTable
            promotions={promotions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            getPromotionStatus={getPromotionStatus}
          />
        )}
      </div>

      {/* Form Modal */}
      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPromotion(null);
        }}
        onSubmit={handleFormSubmit}
        promotion={selectedPromotion}
        restaurants={restaurants}
        loading={formLoading}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPromotionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t('promotions.deleteTitle', 'Supprimer la promotion')}
        message={t('promotions.deleteMessage', `Supprimer "${promotionToDelete?.title}" ?`)}
        confirmText={t('common.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
      />
    </div>
  );
};

export default PromotionsPage;