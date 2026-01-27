import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiStore2Line,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine
} from 'react-icons/ri';

import { restaurantsAPI } from '../../api/restaurants';
import RestaurantsTable from '../../components/tables/RestaurantsTable';
import RestaurantsForm from '../../components/forms/RestaurantsForm';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Restaurants.css';

const RestaurantsPage = () => {
  const { t } = useTranslation();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    restaurant: null
  });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await restaurantsAPI.getAll();
      
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data.restaurants)) {
          data = response.data.restaurants;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
      }
      
      setRestaurants(data);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError(err.response?.data?.message || t('restaurants.errors.load', 'Erreur de chargement'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const getId = (r) => r._id || r.id;

  const filteredRestaurants = restaurants.filter(r => {
    const matchSearch = 
      !filters.search ||
      r.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.address?.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchStatus = 
      !filters.status || 
      r.status === filters.status;

    return matchSearch && matchStatus;
  });

  const stats = {
    total: restaurants.length,
    active: restaurants.filter(r => r.status === 'active').length,
    inactive: restaurants.filter(r => r.status === 'inactive').length
  };

  const handleCreate = () => {
    setSelectedRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone ? Number(String(formData.phone).replace(/\D/g, '')) : null,
        email: formData.email.trim().toLowerCase(),
        status: formData.status || 'active'
      };

      if (selectedRestaurant) {
        await restaurantsAPI.update(getId(selectedRestaurant), payload);
      } else {
        await restaurantsAPI.create(payload);
      }
      
      setIsModalOpen(false);
      setSelectedRestaurant(null);
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || t('restaurants.errors.save', 'Erreur'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (restaurant) => {
    setDeleteConfirm({ isOpen: true, restaurant });
  };

  const handleDeleteConfirm = async () => {
    try {
      await restaurantsAPI.delete(getId(deleteConfirm.restaurant));
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || t('restaurants.errors.delete', 'Erreur'));
    } finally {
      setDeleteConfirm({ isOpen: false, restaurant: null });
    }
  };

  const handleToggleStatus = async (restaurant) => {
    const newStatus = restaurant.status === 'active' ? 'inactive' : 'active';
    try {
      await restaurantsAPI.update(getId(restaurant), { ...restaurant, status: newStatus });
      fetchRestaurants();
    } catch (err) {
      setRestaurants(prev => 
        prev.map(r => getId(r) === getId(restaurant) ? { ...r, status: newStatus } : r)
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="restaurants-page">
      {/* Header */}
      <div className="restaurants-header">
        <div className="restaurants-header-info">
          <h1>
            <RiStore2Line />
            {t('restaurants.title', 'Restaurants')}
          </h1>
          <p>{t('restaurants.subtitle', 'Gérez tous vos restaurants')}</p>
        </div>
        <div className="restaurants-header-actions">
          <button 
            className="restaurants-btn-secondary" 
            onClick={fetchRestaurants}
            disabled={loading}
          >
            <RiRefreshLine className={loading ? 'spin' : ''} />
            <span>{t('common.refresh', 'Actualiser')}</span>
          </button>
          <button className="restaurants-btn-primary" onClick={handleCreate}>
            <RiAddLine />
            <span>{t('restaurants.add', 'Ajouter')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="restaurants-stats">
        <div className="restaurants-stat-card">
          <div className="restaurants-stat-icon primary">
            <RiStore2Line />
          </div>
          <div className="restaurants-stat-content">
            <span className="restaurants-stat-value">{stats.total}</span>
            <span className="restaurants-stat-label">{t('restaurants.stats.total', 'Total')}</span>
          </div>
        </div>
        <div className="restaurants-stat-card">
          <div className="restaurants-stat-icon success">
            <RiStore2Line />
          </div>
          <div className="restaurants-stat-content">
            <span className="restaurants-stat-value">{stats.active}</span>
            <span className="restaurants-stat-label">{t('restaurants.stats.active', 'Actifs')}</span>
          </div>
        </div>
        <div className="restaurants-stat-card">
          <div className="restaurants-stat-icon error">
            <RiStore2Line />
          </div>
          <div className="restaurants-stat-content">
            <span className="restaurants-stat-value">{stats.inactive}</span>
            <span className="restaurants-stat-label">{t('restaurants.stats.inactive', 'Inactifs')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="restaurants-filters">
        <div className="restaurants-search">
          <RiSearchLine />
          <input
            type="text"
            placeholder={t('restaurants.search', 'Rechercher...')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="restaurants-filter-select">
          <RiFilterLine />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">{t('restaurants.allStatus', 'Tous')}</option>
            <option value="active">{t('restaurants.active', 'Actifs')}</option>
            <option value="inactive">{t('restaurants.inactive', 'Inactifs')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="restaurants-content">
        {loading ? (
          <div className="restaurants-loading">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="restaurants-error">
            <p>{error}</p>
            <button onClick={fetchRestaurants}>{t('common.retry', 'Réessayer')}</button>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="restaurants-empty">
            <div className="restaurants-empty-icon">
              <RiStore2Line />
            </div>
            <h3>
              {filters.search || filters.status 
                ? t('restaurants.noResults', 'Aucun résultat') 
                : t('restaurants.noRestaurants', 'Aucun restaurant')
              }
            </h3>
            <p>
              {filters.search || filters.status 
                ? t('restaurants.noResultsDesc', 'Modifiez vos filtres') 
                : t('restaurants.noRestaurantsDesc', 'Créez votre premier restaurant')
              }
            </p>
          </div>
        ) : (
          <RestaurantsTable
            restaurants={filteredRestaurants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRestaurant(null);
        }}
        title={selectedRestaurant 
          ? t('restaurants.editTitle', 'Modifier le restaurant') 
          : t('restaurants.createTitle', 'Nouveau restaurant')
        }
        size="medium"
      >
        <RestaurantsForm
          restaurant={selectedRestaurant}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedRestaurant(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, restaurant: null })}
        onConfirm={handleDeleteConfirm}
        title={t('restaurants.deleteTitle', 'Supprimer le restaurant')}
        message={t('restaurants.deleteMessage', `Supprimer "${deleteConfirm.restaurant?.name}" ?`)}
        confirmText={t('common.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
      />
    </div>
  );
};

export default RestaurantsPage;