// src/hooks/useNotifications.js

import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationsLog,
  deleteNotificationLog
} from '../api/notifications';
import useAuthStore from '../stores/authStore';

// ============================================
// 🔧 MOCK DATA - À SUPPRIMER QUAND BACKEND PRÊT
// ============================================
const USE_MOCK = true; // ← Mettre à false quand backend prêt

const MOCK_SETTINGS = {
  id: 1,
  restaurant_id: null,
  notify_owner_new_order: true,
  notify_client_order_created: true,
  notify_client_status_change: true,
  notify_client_new_promotion: false,
  channel_email: true,
  channel_push: false
};

const MOCK_LOGS = [
  {
    id: 1,
    event_type: 'new_order',
    title: 'Nouvelle commande #1234',
    message: 'Une nouvelle commande a été passée par Jean Dupont',
    channel: 'email',
    status: 'sent',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    event_type: 'status_change',
    title: 'Commande #1234 en préparation',
    message: 'Le statut de la commande a été mis à jour',
    channel: 'push',
    status: 'sent',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    event_type: 'promotion',
    title: 'Nouvelle promotion activée',
    message: 'La promotion "Pizza -20%" a été envoyée aux clients',
    channel: 'email',
    status: 'pending',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    event_type: 'new_order',
    title: 'Nouvelle commande #1235',
    message: 'Une nouvelle commande a été passée par Marie Martin',
    channel: 'push',
    status: 'failed',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];
// ============================================
// FIN MOCK DATA
// ============================================

const useNotifications = (restaurantId = null) => {
  // States pour les paramètres
  const [settings, setSettings] = useState({
    notify_owner_new_order: true,
    notify_client_order_created: true,
    notify_client_status_change: true,
    notify_client_new_promotion: false,
    channel_email: true,
    channel_push: false
  });

  // States pour le journal (optionnel)
  const [logs, setLogs] = useState([]);

  // States communs
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auth store pour récupérer l'ID restaurant si besoin
  const { user } = useAuthStore();

  // Déterminer l'ID à utiliser
  const targetId = restaurantId || (user?.role === 'restaurant' ? user?.restaurantId : null);

  // Charger les paramètres
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ============================================
      // 🔧 MOCK - À REMPLACER QUAND BACKEND PRÊT
      // ============================================
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSettings(MOCK_SETTINGS);
      } else {
        const data = await getNotificationSettings(targetId);
        setSettings(data);
      }
      // ============================================
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  // Sauvegarder les paramètres
  const saveSettings = useCallback(async (newSettings) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // ============================================
      // 🔧 MOCK - À REMPLACER QUAND BACKEND PRÊT
      // ============================================
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSettings(newSettings);
      } else {
        const data = await updateNotificationSettings(newSettings, targetId);
        setSettings(data);
      }
      // ============================================
      
      setSuccess('Paramètres enregistrés avec succès');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetId]);

  // Mettre à jour un paramètre individuellement
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Charger le journal des notifications
  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // ============================================
      // 🔧 MOCK - À REMPLACER QUAND BACKEND PRÊT
      // ============================================
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLogs(MOCK_LOGS);
      } else {
        const data = await getNotificationsLog({
          ...params,
          restaurant_id: targetId
        });
        setLogs(data);
      }
      // ============================================
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du journal');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  // Supprimer une entrée du journal
  const removeLog = useCallback(async (id) => {
    try {
      // ============================================
      // 🔧 MOCK - À REMPLACER QUAND BACKEND PRÊT
      // ============================================
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await deleteNotificationLog(id);
      }
      // ============================================
      
      setLogs(prev => prev.filter(log => log.id !== id));
      setSuccess('Notification supprimée');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    }
  }, []);

  // Effacer les messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Charger les paramètres au montage
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    // États
    settings,
    logs,
    loading,
    saving,
    error,
    success,

    // Actions paramètres
    fetchSettings,
    saveSettings,
    updateSetting,

    // Actions journal
    fetchLogs,
    removeLog,

    // Utilitaires
    clearMessages
  };
};

export default useNotifications;