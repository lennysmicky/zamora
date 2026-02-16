// src/hooks/useSpecialOffers.js
import { useState, useEffect, useCallback } from 'react';
import specialOffersApi from '../api/specialOffers';

const useSpecialOffers = (isAdmin = false) => {
  // States
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalViews: 0,
    totalRedemptions: 0,
    totalRevenue: 0,
    conversionRate: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    period: '30d',
    channel: '',
    search: '',
    category: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [loading, setLoading] = useState({
    offers: false,
    detail: false,
    saving: false,
    deleting: false,
    toggling: false,
    duplicating: false,
    stats: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear messages after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch offers
  const fetchOffers = useCallback(async () => {
    setLoading(prev => ({ ...prev, offers: true }));
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        isAdmin
      };

      const response = await specialOffersApi.getAll(params);
      const data = response.data;

      setOffers(data.offers || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(prev => ({ ...prev, offers: false }));
    }
  }, [filters, pagination.page, pagination.limit, isAdmin]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await specialOffersApi.getGlobalStats({ period: filters.period });
      setStats(response.data || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [filters.period]);

  // Initial fetch
  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, [fetchOffers, fetchStats]);

  // Get offer detail
  const fetchOfferDetail = async (id) => {
    setLoading(prev => ({ ...prev, detail: true }));
    try {
      const response = await specialOffersApi.getById(id);
      setSelectedOffer(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement de l\'offre');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  // Create offer
  const createOffer = async (data) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      await specialOffersApi.create(data);
      setSuccess('Offre créée avec succès');
      fetchOffers();
      fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Update offer
  const updateOffer = async (id, data) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      await specialOffersApi.update(id, data);
      setSuccess('Offre mise à jour avec succès');
      fetchOffers();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete offer
  const deleteOffer = async (id) => {
    setLoading(prev => ({ ...prev, deleting: true }));
    try {
      await specialOffersApi.delete(id);
      setSuccess('Offre supprimée avec succès');
      fetchOffers();
      fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  // Toggle status
  const toggleOfferStatus = async (id, isActive) => {
    setLoading(prev => ({ ...prev, toggling: true }));
    try {
      await specialOffersApi.toggleStatus(id, isActive);
      setSuccess(isActive ? 'Offre activée' : 'Offre désactivée');
      fetchOffers();
      fetchStats();
      return true;
    } catch (err) {
      setError('Erreur lors du changement de statut');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, toggling: false }));
    }
  };

  // Duplicate offer
  const duplicateOffer = async (id) => {
    setLoading(prev => ({ ...prev, duplicating: true }));
    try {
      await specialOffersApi.duplicate(id);
      setSuccess('Offre dupliquée avec succès');
      fetchOffers();
      return true;
    } catch (err) {
      setError('Erreur lors de la duplication');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, duplicating: false }));
    }
  };

  // Get offer history
  const fetchOfferHistory = async (id) => {
    try {
      const response = await specialOffersApi.getHistory(id);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  };

  // Generate promo code
  const generatePromoCode = async () => {
    try {
      const response = await specialOffersApi.generatePromoCode();
      return response.data?.code || '';
    } catch (err) {
      return '';
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      period: '30d',
      channel: '',
      search: '',
      category: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Change page
  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    // Data
    offers,
    selectedOffer,
    setSelectedOffer,
    stats,
    
    // Filters & Pagination
    filters,
    updateFilters,
    resetFilters,
    pagination,
    changePage,
    
    // Actions
    fetchOffers,
    fetchOfferDetail,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    duplicateOffer,
    fetchOfferHistory,
    generatePromoCode,
    
    // States
    loading,
    error,
    success
  };
};

export default useSpecialOffers;