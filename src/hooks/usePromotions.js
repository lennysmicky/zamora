import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { promotionsAPI } from '../api/promotions';

export const usePromotions = (restaurantId = null) => {
  const { t } = useTranslation();

  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Récupérer les promotions
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        ...(restaurantId && { restaurant_id: restaurantId })
      };

      const response = restaurantId
        ? await promotionsAPI.getByRestaurant(restaurantId, params)
        : await promotionsAPI.getAll(params);

      if (response.data) {
        setPromotions(response.data.promotions || response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Fetch promotions error:', err);
      setError(t('promotions.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, restaurantId, t]);

  // Récupérer les stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await promotionsAPI.getStats();
      if (response.data) {
        setStats(response.data.stats || response.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  // Créer une promotion
  const createPromotion = useCallback(async (data) => {
    try {
      const response = await promotionsAPI.create(data);
      if (response.data) {
        await fetchPromotions();
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Create promotion error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || t('promotions.errors.createFailed') 
      };
    }
  }, [fetchPromotions, t]);

  // Mettre à jour une promotion
  const updatePromotion = useCallback(async (id, data) => {
    try {
      const response = await promotionsAPI.update(id, data);
      if (response.data) {
        await fetchPromotions();
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Update promotion error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || t('promotions.errors.updateFailed') 
      };
    }
  }, [fetchPromotions, t]);

  // Supprimer une promotion
  const deletePromotion = useCallback(async (id) => {
    try {
      await promotionsAPI.delete(id);
      await fetchPromotions();
      return { success: true };
    } catch (err) {
      console.error('Delete promotion error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || t('promotions.errors.deleteFailed') 
      };
    }
  }, [fetchPromotions, t]);

  // Toggle statut
  const togglePromotionStatus = useCallback(async (id) => {
    try {
      const response = await promotionsAPI.toggleStatus(id);
      if (response.data) {
        setPromotions(prev => 
          prev.map(promo => 
            promo.id === id ? { ...promo, is_active: !promo.is_active } : promo
          )
        );
        return { success: true };
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || t('promotions.errors.toggleFailed') 
      };
    }
  }, [t]);

  // Calculer le statut d'une promotion
  const getPromotionStatus = useCallback((promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) {
      return 'inactive';
    }
    if (now < startDate) {
      return 'scheduled';
    }
    if (now > endDate) {
      return 'expired';
    }
    return 'active';
  }, []);

  // Effect pour charger les données
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    promotions,
    stats,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getPromotionStatus
  };
};

export default usePromotions;