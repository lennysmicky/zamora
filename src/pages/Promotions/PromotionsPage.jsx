import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiPercentLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine
} from 'react-icons/ri';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsTable from '../../components/Promotions/PromotionsTable';
import PromotionForm from '../../components/Promotions/PromotionForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './PromotionsPage.css';

const PromotionsPage = () => {
  const { t } = useTranslation();
  
  const {
    promotions,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getPromotionStatus
  } = usePromotions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Données des restaurants (à récupérer depuis l'API)
  const [restaurants] = useState([]);

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
      await deletePromotion(promotionToDelete.id);
      setIsDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    let result;
    
    if (selectedPromotion) {
      result = await updatePromotion(selectedPromotion.id, data);
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
        <div className="promotions-header-left">
          <h1>{t('promotions.title')}</h1>
          <p>{t('promotions.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <RiAddLine />
          {t('promotions.addNew')}
        </button>
      </div>

      {/* Stats */}
      <div className="promotions-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <RiPercentLine />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">{t('promotions.stats.total')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <RiCheckboxCircleLine />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">{t('promotions.stats.active')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon scheduled">
            <RiTimeLine />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.scheduled}</span>
            <span className="stat-label">{t('promotions.stats.scheduled')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expired">
            <RiCloseCircleLine />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.expired}</span>
            <span className="stat-label">{t('promotions.stats.expired')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="promotions-filters">
        <div className="search-box">
          <RiSearchLine />
          <input
            type="text"
            placeholder={t('promotions.searchPlaceholder')}
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filters.status === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            {t('promotions.filters.all')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('active')}
          >
            {t('promotions.filters.active')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'scheduled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('scheduled')}
          >
            {t('promotions.filters.scheduled')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'expired' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('expired')}
          >
            {t('promotions.filters.expired')}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="promotions-error">
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      <PromotionsTable
        promotions={promotions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        getPromotionStatus={getPromotionStatus}
      />

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
        title={t('promotions.deleteDialog.title')}
        message={t('promotions.deleteDialog.message', { title: promotionToDelete?.title })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
};

export default PromotionsPage;