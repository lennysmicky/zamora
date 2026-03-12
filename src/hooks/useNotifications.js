// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationsLog,
  deleteNotificationLog,
  markNotificationAsRead,
  getNotificationStats,
  getUnreadNotificationCount
} from '../api/notifications';
import useAuthStore from '../stores/authStore';

const defaultSettings = {
  notify_owner_new_order: true,
  notify_client_order_created: true,
  notify_client_status_change: true,
  notify_client_new_promotion: false,
  channel_email: true,
  channel_push: false
};

const normalizeStatus = (status) => {
  switch (status) {
    case 'envoye':
      return 'sent';
    case 'en_attente':
      return 'pending';
    case 'echec':
      return 'failed';
    default:
      return status || 'pending';
  }
};

const normalizeEventType = (type) => {
  switch (type) {
    case 'commande':
      return 'new_order';
    case 'changement_statut':
      return 'status_change';
    case 'promotion':
      return 'promotion';
    default:
      return type || 'default';
  }
};

const normalizeNotification = (item) => ({
  id: item?.id || item?._id || null,
  _id: item?._id || item?.id || null,
  title: item?.title || item?.titre || '',
  message: item?.message || item?.contenu || '',
  event_type: item?.event_type || normalizeEventType(item?.type),
  type: item?.type || item?.event_type || 'default',
  status: normalizeStatus(item?.status),
  raw_status: item?.status || null,
  channel: item?.channel || 'push',
  recipient: item?.recipient || '',
  is_read: item?.is_read ?? item?.read ?? item?.lue ?? false,
  lue: item?.lue ?? item?.is_read ?? item?.read ?? false,
  user: item?.user || null,
  created_at: item?.created_at || item?.createdAt || null,
  createdAt: item?.createdAt || item?.created_at || null,
  updated_at: item?.updated_at || item?.updatedAt || null,
  updatedAt: item?.updatedAt || item?.updated_at || null
});

const normalizeLogsResponse = (data) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data?.results)
    ? data.results
    : [];

  return list.map(normalizeNotification);
};

const normalizeStatsResponse = (data) => {
  const source =
    data?.data ||
    data?.stats ||
    data?.statistiques ||
    data ||
    {};

  return {
    total:
      source?.total ??
      source?.all ??
      source?.count ??
      source?.notificationsTotal ??
      source?.totalNotifications ??
      0,

    sent:
      source?.sent ??
      source?.envoye ??
      source?.envoyees ??
      source?.success ??
      source?.succeeded ??
      0,

    pending:
      source?.pending ??
      source?.en_attente ??
      source?.attente ??
      0,

    failed:
      source?.failed ??
      source?.echec ??
      source?.error ??
      source?.errors ??
      0
  };
};

const extractUnreadCount = (data) => {
  return (
    data?.count ??
    data?.data?.count ??
    data?.unreadCount ??
    data?.data?.unreadCount ??
    data?.nonLues ??
    data?.data?.nonLues ??
    0
  );
};

const useNotifications = (restaurantId = null) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useAuthStore();

  const targetRestaurantId =
    restaurantId || (user?.role === 'restaurant' ? user?.restaurantId : null);

  const targetUserId = user?.id || user?._id || null;

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNotificationSettings(targetRestaurantId);
      setSettings(data?.data || data || defaultSettings);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, [targetRestaurantId]);

  const saveSettings = useCallback(async (newSettings) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await updateNotificationSettings(newSettings, targetRestaurantId);
      setSettings(data?.data || data || newSettings);
      setSuccess('Paramètres enregistrés avec succès');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetRestaurantId]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = { ...params };

      if (targetRestaurantId) {
        queryParams.restaurant_id = targetRestaurantId;
      }

      if (targetUserId) {
        queryParams.user_id = targetUserId;
      }

      const data = await getNotificationsLog(queryParams);
      setLogs(normalizeLogsResponse(data));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du journal');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [targetRestaurantId, targetUserId]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};

      if (targetRestaurantId) {
        params.restaurant_id = targetRestaurantId;
      }

      if (targetUserId) {
        params.user_id = targetUserId;
      }

      const data = await getNotificationStats(params);
      const normalized = normalizeStatsResponse(data);
      setStats(normalized);
    } catch (err) {
      console.error('Erreur lors du chargement des stats notifications', err);
      setStats({
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0
      });
    }
  }, [targetRestaurantId, targetUserId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const data = await getUnreadNotificationCount(targetUserId);
      setUnreadCount(extractUnreadCount(data));
    } catch (err) {
      console.error('Erreur lors du chargement du nombre de notifications non lues', err);
      setUnreadCount(0);
    }
  }, [targetUserId]);

  const removeLog = useCallback(async (id) => {
    setError(null);
    setSuccess(null);

    try {
      await deleteNotificationLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id && log._id !== id));
      setSuccess('Notification supprimée');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    setError(null);
    setSuccess(null);

    try {
      await markNotificationAsRead(notificationId);

      setLogs((prev) =>
        prev.map((item) =>
          item.id === notificationId || item._id === notificationId
            ? {
                ...item,
                is_read: true,
                lue: true
              }
            : item
        )
      );

      await fetchUnreadCount();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du marquage comme lu');
      return false;
    }
  }, [fetchUnreadCount]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    logs,
    stats,
    unreadCount,
    loading,
    saving,
    error,
    success,

    fetchSettings,
    saveSettings,
    updateSetting,

    fetchLogs,
    fetchStats,
    fetchUnreadCount,
    removeLog,
    markAsRead,

    clearMessages
  };
};

export default useNotifications;