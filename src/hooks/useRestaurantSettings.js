// src/hooks/useRestaurantSettings.js
import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settings';
import useAuthStore from '../stores/authStore';

export const useRestaurantSettings = () => {
  const { restaurantId, logout } = useAuthStore();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Charger les infos du restaurant
  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) return;
    
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

  // Mettre à jour les infos
  const updateInfo = async (data) => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateRestaurantInfo(restaurantId, data);
      setRestaurant(updated);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de mise à jour' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour le logo
  const updateLogo = async (file) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const updated = await settingsApi.updateLogo(restaurantId, formData);
      setRestaurant(updated);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur upload logo' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Changer le mot de passe
  const changePassword = async (data) => {
    setSaving(true);
    try {
      await settingsApi.changePassword(restaurantId, data);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur changement mot de passe' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Activer/Désactiver
  const toggleActive = async (activate) => {
    setSaving(true);
    try {
      const updated = activate 
        ? await settingsApi.activateRestaurant(restaurantId)
        : await settingsApi.deactivateRestaurant(restaurantId);
      setRestaurant(updated);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de mise à jour' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Supprimer le compte
  const deleteAccount = async (password) => {
    setSaving(true);
    try {
      await settingsApi.deleteAccount(restaurantId, password);
      logout(); // Déconnexion après suppression
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de suppression' 
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