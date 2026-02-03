import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiAddLine,
  RiSearchLine,
  RiPercentLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
  RiEditLine,
  RiDeleteBinLine,
  RiToggleLine,
  RiToggleFill,
  RiCalendarLine,
  RiPriceTag3Line
} from 'react-icons/ri';
import { promotionsAPI } from '../../../api/promotions';
import useAuthStore from '../../../stores/authStore';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './promotions.css';

const RestaurantPromotionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // États
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    promotion: null
  });

  // Obtenir l'ID du restaurant
  const getRestaurantId = useCallback(() => {
    return user?.restaurantId || user?.restaurant_id || user?.restaurant?.id || user?.restaurant?._id || user?._id;
  }, [user]);

  // Obtenir l'ID de la promotion
  const getPromotionId = (promotion) => {
    return promotion._id || promotion.id;
  };

  // Récupérer le statut d'une promotion
  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) return 'inactive';
    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'expired';
    return 'active';
  };

  // Charger les promotions du restaurant
  const fetchPromotions = useCallback(async () => {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      console.warn('Restaurant ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await promotionsAPI.getByRestaurant(restaurantId);

      let data = [];
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data.promotions)) {
          data = response.data.promotions;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
      }

      setPromotions(data);
    } catch (err) {
      console.error('Erreur chargement promotions:', err);
      // Pas d'affichage d'erreur, on garde juste la liste vide
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [getRestaurantId]);

  // Chargement initial
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Calculer les stats
  const stats = {
    total: promotions.length,
    active: promotions.filter(p => getPromotionStatus(p) === 'active').length,
    scheduled: promotions.filter(p => getPromotionStatus(p) === 'scheduled').length,
    expired: promotions.filter(p => getPromotionStatus(p) === 'expired').length
  };

  // Filtrer les promotions
  const filteredPromotions = promotions.filter(p => {
    const matchSearch = !filters.search ||
      p.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description?.toLowerCase().includes(filters.search.toLowerCase());

    const status = getPromotionStatus(p);
    const matchStatus = !filters.status || status === filters.status;

    return matchSearch && matchStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setFormErrors({});
  };

  // Handlers
  const handleRefresh = () => {
    fetchPromotions();
  };

  const handleCreate = () => {
    setSelectedPromotion(null);
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      discountType: promotion.discountType || 'percentage',
      discountValue: promotion.discountValue || '',
      startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
      endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
      isActive: promotion.isActive !== false
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPromotion(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'required';
    if (!formData.discountValue) errors.discountValue = 'required';
    if (!formData.startDate) errors.startDate = 'required';
    if (!formData.endDate) errors.endDate = 'required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = 'invalidRange';
      }
    }

    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      errors.discountValue = 'maxPercentage';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const restaurantId = getRestaurantId();
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        restaurantId
      };

      if (selectedPromotion) {
        await promotionsAPI.update(getPromotionId(selectedPromotion), payload);
      } else {
        await promotionsAPI.create(payload);
      }

      handleCloseForm();
      fetchPromotions();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert(err.response?.data?.message || t('promotions.errors.save', 'Erreur'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (promotion) => {
    setDeleteConfirm({ isOpen: true, promotion });
  };

  const handleCloseDelete = () => {
    setDeleteConfirm({ isOpen: false, promotion: null });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.promotion) return;

    try {
      await promotionsAPI.delete(getPromotionId(deleteConfirm.promotion));
      handleCloseDelete();
      fetchPromotions();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(err.response?.data?.message || t('promotions.errors.delete', 'Erreur'));
    }
  };

  const handleToggleStatus = async (promotion) => {
    const id = getPromotionId(promotion);

    try {
      await promotionsAPI.toggleStatus(id);
      fetchPromotions();
    } catch (err) {
      console.error('Erreur changement statut:', err);
      setPromotions(prev =>
        prev.map(p =>
          getPromotionId(p) === id
            ? { ...p, isActive: !p.isActive }
            : p
        )
      );
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format discount
  const formatDiscount = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`;
    }
    return `${promotion.discountValue} €`;
  };

  // Status badge config
  const getStatusBadge = (status) => {
    const config = {
      active: { label: t('promotions.status.active', 'Active'), class: 'success' },
      scheduled: { label: t('promotions.status.scheduled', 'Programmée'), class: 'warning' },
      expired: { label: t('promotions.status.expired', 'Expirée'), class: 'error' },
      inactive: { label: t('promotions.status.inactive', 'Inactive'), class: 'muted' }
    };
    return config[status] || config.inactive;
  };

  // Render content
  const renderContent = () => {
    // Loading
    if (loading) {
      return (
        <div className="promotions-loading">
          <LoadingSpinner />
        </div>
      );
    }

    // Liste vide ou aucun résultat
    if (filteredPromotions.length === 0) {
      return (
        <div className="promotions-empty">
          <div className="promotions-empty-icon">
            <RiPercentLine />
          </div>
          <h3>
            {filters.search || filters.status
              ? t('promotions.noResults', 'Aucun résultat')
              : t('promotions.noPromotions', 'Aucune promotion')
            }
          </h3>
          <p>
            {filters.search || filters.status
              ? t('promotions.noResultsDesc', 'Modifiez vos filtres')
              : t('promotions.noPromotionsDesc', 'Créez votre première promotion')
            }
          </p>
        </div>
      );
    }

    // Table avec données
    return (
      <div className="promotions-table-wrapper">
        <table className="promotions-table">
          <thead>
            <tr>
              <th>{t('promotions.table.title', 'Promotion')}</th>
              <th>{t('promotions.table.discount', 'Réduction')}</th>
              <th>{t('promotions.table.period', 'Période')}</th>
              <th>{t('promotions.table.status', 'Statut')}</th>
              <th>{t('promotions.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const badge = getStatusBadge(status);

              return (
                <tr key={getPromotionId(promotion)}>
                  <td>
                    <div className="promotion-cell">
                      <div className="promotion-icon">
                        <RiPriceTag3Line />
                      </div>
                      <div className="promotion-info">
                        <span className="promotion-title">{promotion.title}</span>
                        {promotion.description && (
                          <span className="promotion-description">{promotion.description}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="discount-badge">
                      {formatDiscount(promotion)}
                    </span>
                  </td>
                  <td>
                    <div className="period-cell">
                      <RiCalendarLine />
                      <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`status-badge ${badge.class}`}
                      onClick={() => handleToggleStatus(promotion)}
                    >
                      {promotion.isActive ? <RiToggleFill /> : <RiToggleLine />}
                      <span>{badge.label}</span>
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(promotion)}
                        title={t('common.edit', 'Modifier')}
                      >
                        <RiEditLine />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(promotion)}
                        title={t('common.delete', 'Supprimer')}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="restaurant-promotions-page">
      {/* Header */}
      <div className="promotions-header">
        <div className="promotions-header-info">
          <h1>
            <RiPercentLine />
            {t('promotions.title', 'Promotions')}
          </h1>
          <p>{t('promotions.subtitle', 'Gérez vos promotions et offres')}</p>
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
            <span className="promotions-stat-value">{stats.total}</span>
            <span className="promotions-stat-label">{t('promotions.stats.total', 'Total')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon active">
            <RiCheckboxCircleLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats.active}</span>
            <span className="promotions-stat-label">{t('promotions.stats.active', 'Actives')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon scheduled">
            <RiTimeLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats.scheduled}</span>
            <span className="promotions-stat-label">{t('promotions.stats.scheduled', 'Programmées')}</span>
          </div>
        </div>
        <div className="promotions-stat-card">
          <div className="promotions-stat-icon expired">
            <RiCloseCircleLine />
          </div>
          <div className="promotions-stat-content">
            <span className="promotions-stat-value">{stats.expired}</span>
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
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="promotions-filter-buttons">
          <button
            className={`filter-btn ${filters.status === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            {t('promotions.filters.all', 'Toutes')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('active')}
          >
            {t('promotions.filters.active', 'Actives')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'scheduled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('scheduled')}
          >
            {t('promotions.filters.scheduled', 'Programmées')}
          </button>
          <button
            className={`filter-btn ${filters.status === 'expired' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('expired')}
          >
            {t('promotions.filters.expired', 'Expirées')}
          </button>
        </div>
      </div>

      {/* Content - Une seule section */}
      <div className="promotions-content">
        {renderContent()}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedPromotion
          ? t('promotions.editTitle', 'Modifier la promotion')
          : t('promotions.createTitle', 'Nouvelle promotion')
        }
        size="medium"
      >
        <form className="promotion-form" onSubmit={handleSubmit}>
          {/* Titre */}
          <div className={`form-group ${formErrors.title ? 'error' : ''}`}>
            <label>
              {t('promotions.form.title', 'Titre')} <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder={t('promotions.form.titlePlaceholder', 'Ex: Offre de lancement')}
            />
            {formErrors.title && (
              <span className="form-error">{t('common.required', 'Ce champ est requis')}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>{t('promotions.form.description', 'Description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder={t('promotions.form.descriptionPlaceholder', 'Description de la promotion...')}
              rows={3}
            />
          </div>

          {/* Type et valeur de réduction */}
          <div className="form-row">
            <div className="form-group">
              <label>{t('promotions.form.discountType', 'Type de réduction')}</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleFormChange}
              >
                <option value="percentage">{t('promotions.form.percentage', 'Pourcentage (%)')}</option>
                <option value="fixed">{t('promotions.form.fixed', 'Montant fixe (€)')}</option>
              </select>
            </div>

            <div className={`form-group ${formErrors.discountValue ? 'error' : ''}`}>
              <label>
                {t('promotions.form.discountValue', 'Valeur')} <span className="required">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleFormChange}
                placeholder={formData.discountType === 'percentage' ? '10' : '5'}
                min="0"
                max={formData.discountType === 'percentage' ? '100' : undefined}
              />
              {formErrors.discountValue && (
                <span className="form-error">
                  {formErrors.discountValue === 'maxPercentage'
                    ? t('promotions.form.maxPercentage', 'Maximum 100%')
                    : t('common.required', 'Ce champ est requis')
                  }
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className={`form-group ${formErrors.startDate ? 'error' : ''}`}>
              <label>
                {t('promotions.form.startDate', 'Date de début')} <span className="required">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
              />
              {formErrors.startDate && (
                <span className="form-error">{t('common.required', 'Ce champ est requis')}</span>
              )}
            </div>

            <div className={`form-group ${formErrors.endDate ? 'error' : ''}`}>
              <label>
                {t('promotions.form.endDate', 'Date de fin')} <span className="required">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleFormChange}
              />
              {formErrors.endDate && (
                <span className="form-error">
                  {formErrors.endDate === 'invalidRange'
                    ? t('promotions.form.invalidRange', 'Date invalide')
                    : t('common.required', 'Ce champ est requis')
                  }
                </span>
              )}
            </div>
          </div>

          {/* Statut actif */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                {t('promotions.form.isActive', 'Promotion active')}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCloseForm}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Annuler')}
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="btn-spinner"></span> : t('common.save', 'Enregistrer')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
        title={t('promotions.deleteTitle', 'Supprimer la promotion')}
        message={t('promotions.deleteMessage', `Supprimer "${deleteConfirm.promotion?.title}" ?`)}
        confirmText={t('common.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
      />
    </div>
  );
};

export default RestaurantPromotionsPage;