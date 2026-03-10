import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settings';
import useAuthStore from '../stores/authStore';

export const useRestaurantSettings = () => {
  const { restaurantId, logout } = useAuthStore();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await settingsApi.getRestaurantInfo(restaurantId);
      setRestaurant(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const updateInfo = async (data) => {
    setSaving(true);
    try {
      await settingsApi.updateRestaurantInfo(restaurantId, data);
      await fetchRestaurant();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Erreur de mise à jour',
      };
    } finally {
      setSaving(false);
    }
  };

  const updateLogo = async (file) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      await settingsApi.updateLogo(restaurantId, formData);
      await fetchRestaurant();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Erreur upload logo',
      };
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (data) => {
    setSaving(true);
    try {
      await settingsApi.changePassword(data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Erreur changement mot de passe',
      };
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (Ouvert) => {
    setSaving(true);
    try {
      const status = Ouvert ? 'Ouvert' : 'Fermé';

      await settingsApi.changeRestaurantStatus(restaurantId, status);
      await fetchRestaurant();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Erreur de mise à jour du statut',
      };
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (password) => {
    setSaving(true);
    try {
      await settingsApi.deleteAccount(restaurantId, password);
      logout();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || 'Erreur de suppression',
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    restaurant,
    loading,
    error,
    saving,
    fetchRestaurant,
    updateInfo,
    updateLogo,
    changePassword,
    toggleActive,
    deleteAccount,
  };
};