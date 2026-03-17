// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationsLog,
  deleteNotificationLog,
  markNotificationAsRead,
  getNotificationStats,
  getUnreadNotificationCount,
} from "../api/notifications";
import useAuthStore from "../stores/authStore";

const defaultSettings = {
  events: {
    newOrder: true,
    orderClient: true,
    statusOrderChanged: true,
    promotion: false,
  },
  channels: {
    email: true,
    push: false,
  },
};

const normalizeStatus = (status) => {
  const value = String(status ?? "").toLowerCase();

  switch (value) {
    case "envoye":
    case "envoyé":
    case "sent":
      return "sent";

    case "en_attente":
    case "pending":
      return "pending";

    case "echec":
    case "échoué":
    case "failed":
    case "error":
      return "failed";

    default:
      return value || "pending";
  }
};

const normalizeEventType = (type) => {
  const value = String(type ?? "").toLowerCase();

  switch (value) {
    case "commande":
    case "new_order":
    case "neworder":
      return "new_order";

    case "changement_statut":
    case "status_change":
    case "statusorderchanged":
      return "status_change";

    case "promotion":
      return "promotion";

    default:
      return value || "default";
  }
};

const normalizeNotification = (item) => ({
  id: item?.id || item?._id || null,
  _id: item?._id || item?.id || null,
  title: item?.title || item?.titre || "",
  message: item?.message || item?.contenu || "",
  event_type: item?.event_type || normalizeEventType(item?.type),
  type: item?.type || item?.event_type || "default",
  status: normalizeStatus(item?.status),
  raw_status: item?.status || null,
  channel: item?.channel || "push",
  recipient: item?.recipient || "",
  is_read: item?.is_read ?? item?.read ?? item?.lue ?? false,
  lue: item?.lue ?? item?.is_read ?? item?.read ?? false,
  user: item?.user || null,
  created_at: item?.created_at || item?.createdAt || null,
  createdAt: item?.createdAt || item?.created_at || null,
  updated_at: item?.updated_at || item?.updatedAt || null,
  updatedAt: item?.updatedAt || item?.updated_at || null,
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
  const source = data?.data || data?.stats || data?.statistiques || data || {};

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
      0,
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

const getErrorMessage = (err, fallback) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

const normalizeSettingsResponse = (data) => {
  const source = data?.data || data || {};

  return {
    events: {
      newOrder: source?.events?.newOrder ?? true,
      orderClient: source?.events?.orderClient ?? true,
      statusOrderChanged: source?.events?.statusOrderChanged ?? true,
      promotion: source?.events?.promotion ?? false,
    },
    channels: {
      email: source?.channels?.email ?? true,
      push: source?.channels?.push ?? false,
    },
  };
};

const useNotifications = (restaurantId = null) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => String(s.userType ?? "").toLowerCase());
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);

  const targetRestaurantId =
    restaurantId ||
    storeRestaurantId ||
    (userType === "restaurant"
      ? user?.restaurantId || user?.restaurentId || null
      : null);

  const targetUserId = user?.id || user?._id || null;

  const fetchSettings = useCallback(async () => {
    if (!targetRestaurantId) {
      setSettings(defaultSettings);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getNotificationSettings(targetRestaurantId);
      setSettings(normalizeSettingsResponse(data));
    } catch (err) {
      setError(getErrorMessage(err, "Erreur lors du chargement des paramètres"));
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [targetRestaurantId]);

  const saveSettings = useCallback(
    async (newSettings) => {
      if (!targetRestaurantId) {
        setError("restaurantId introuvable pour enregistrer les paramètres");
        return false;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const data = await updateNotificationSettings(newSettings, targetRestaurantId);
        setSettings(normalizeSettingsResponse(data || newSettings));
        setSuccess("Paramètres enregistrés avec succès");
        return true;
      } catch (err) {
        setError(getErrorMessage(err, "Erreur lors de la sauvegarde"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [targetRestaurantId]
  );

  const updateSetting = useCallback((path, value) => {
    setSettings((prev) => {
      const [section, key] = String(path).split(".");

      if (!section || !key) return prev;

      return {
        ...prev,
        [section]: {
          ...(prev?.[section] || {}),
          [key]: value,
        },
      };
    });
  }, []);

  const fetchLogs = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = { ...params };

        if (targetRestaurantId) {
          queryParams.restaurant_id = targetRestaurantId;
          queryParams.restaurentId = targetRestaurantId;
        }

        if (targetUserId) {
          queryParams.user_id = targetUserId;
        }

        const data = await getNotificationsLog(queryParams);
        setLogs(normalizeLogsResponse(data));
      } catch (err) {
        setError(getErrorMessage(err, "Erreur lors du chargement du journal"));
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [targetRestaurantId, targetUserId]
  );

  const fetchStats = useCallback(async () => {
    try {
      const params = {};

      if (targetRestaurantId) {
        params.restaurant_id = targetRestaurantId;
        params.restaurentId = targetRestaurantId;
      }

      if (targetUserId) {
        params.user_id = targetUserId;
      }

      const data = await getNotificationStats(params);
      setStats(normalizeStatsResponse(data));
    } catch (err) {
      console.error("Erreur lors du chargement des stats notifications", err);
      setStats({
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0,
      });
    }
  }, [targetRestaurantId, targetUserId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!targetUserId) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getUnreadNotificationCount(targetUserId);
      setUnreadCount(extractUnreadCount(data));
    } catch (err) {
      console.error(
        "Erreur lors du chargement du nombre de notifications non lues",
        err
      );
      setUnreadCount(0);
    }
  }, [targetUserId]);

  const removeLog = useCallback(async (id) => {
    if (!id) return false;

    setError(null);
    setSuccess(null);

    try {
      await deleteNotificationLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id && log._id !== id));
      setSuccess("Notification supprimée");
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Erreur lors de la suppression"));
      return false;
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return false;

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
                  lue: true,
                }
              : item
          )
        );

        await fetchUnreadCount();
        return true;
      } catch (err) {
        setError(getErrorMessage(err, "Erreur lors du marquage comme lu"));
        return false;
      }
    },
    [fetchUnreadCount]
  );

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

    targetRestaurantId,
    targetUserId,

    fetchSettings,
    saveSettings,
    updateSetting,

    fetchLogs,
    fetchStats,
    fetchUnreadCount,
    removeLog,
    markAsRead,

    clearMessages,
  };
};

export default useNotifications;