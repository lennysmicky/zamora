// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import { showOrderNotification } from '../components/notifications/OrderNotification';

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
claude-sonnet-4-5-20250929
Code complet corrigé - Système de notifications instantané
1. src/components/notifications/OrderNotification.jsx (Complet)

React

import React from 'react';
import { toast } from 'react-toastify';
import { 
  RiCheckCircleLine, 
  RiErrorWarningLine, 
  RiInformationLine,
  RiCloseLine,
  RiShoppingBag2Line,
  RiTimeLine,
  RiCheckLine,
  RiTruckLine,
  RiAlertLine
} from 'react-icons/ri';
import './OrderNotification.css';

// Icônes selon le statut de la commande
const getStatusIcon = (status) => {
  const statusLower = String(status || '').toLowerCase();
  
  switch (statusLower) {
    case 'pending':
    case 'en_attente':
      return <RiTimeLine className="notification-icon pending" />;
    case 'confirmed':
    case 'confirmee':
      return <RiCheckLine className="notification-icon confirmed" />;
    case 'preparing':
    case 'en_preparation':
      return <RiShoppingBag2Line className="notification-icon preparing" />;
    case 'ready':
    case 'prete':
      return <RiCheckCircleLine className="notification-icon ready" />;
    case 'delivered':
    case 'livree':
      return <RiTruckLine className="notification-icon delivered" />;
    case 'cancelled':
    case 'annulee':
      return <RiErrorWarningLine className="notification-icon cancelled" />;
    default:
      return <RiInformationLine className="notification-icon info" />;
  }
};

// Composant de notification personnalisé
const OrderNotification = ({ order, message, type = 'info', closeToast }) => {
  return (
    <div className={`order-notification ${type}`}>
      <div className="notification-content">
        <div className="notification-icon-wrapper">
          {order?.status ? getStatusIcon(order.status) : getStatusIcon(type)}
        </div>
        
        <div className="notification-body">
          <div className="notification-header">
            <p className="notification-title">
              {order?.orderNumber ? `Commande #${order.orderNumber}` : 'Notification'}
            </p>
            {order?.restaurant && (
              <p className="notification-restaurant">{order.restaurant}</p>
            )}
          </div>
          
          <p className="notification-message">{message}</p>
          
          {order?.items && Array.isArray(order.items) && (
            <div className="notification-items">
              <span className="notification-items-count">
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
              {order.total && (
                <span className="notification-total">
                  {typeof order.total === 'number' ? order.total.toFixed(2) : order.total} €
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={closeToast}
        className="notification-close"
        aria-label="Fermer"
      >
        <RiCloseLine />
      </button>
    </div>
  );
};

// Fonctions helper pour afficher les notifications
export const showOrderNotification = {
  // Nouvelle commande
  newOrder: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Nouvelle commande reçue"
          type="new"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-new',
      }
    );
  },

  // Commande confirmée
  confirmed: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Commande confirmée par le restaurant"
          type="confirmed"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-confirmed',
      }
    );
  },

  // Commande en préparation
  preparing: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Votre commande est en préparation"
          type="preparing"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-preparing',
      }
    );
  },

  // Commande prête
  ready: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Votre commande est prête !"
          type="ready"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-ready',
      }
    );
  },

  // Commande livrée
  delivered: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Commande livrée avec succès"
          type="delivered"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-delivered',
      }
    );
  },

  // Commande annulée
  cancelled: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Commande annulée"
          type="cancelled"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-cancelled',
      }
    );
  },

  // Notification générique de succès
  success: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          message={message}
          type="success"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-success',
      }
    );
  },

  // Notification d'erreur
  error: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          message={message}
          type="error"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-error',
      }
    );
  },

  // Notification d'information
  info: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          message={message}
          type="info"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-info',
      }
    );
  },
};

export default OrderNotification;

2. src/components/notifications/OrderNotification.css (Complet)

CSS

/* ========================================
   Order Notification Component
   ======================================== */

/* Reset des styles par défaut de react-toastify */
.custom-toast {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  margin-bottom: 0.5rem !important;
}

.custom-toast-body {
  padding: 0 !important;
  margin: 0 !important;
}

/* Container de la notification */
.order-notification {
  max-width: 420px;
  width: 100%;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  pointer-events: auto;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border-left: 4px solid #2563eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-notification:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* Types de notifications */
.order-notification.new {
  border-left-color: #3b82f6;
}

.order-notification.confirmed {
  border-left-color: #10b981;
}

.order-notification.preparing {
  border-left-color: #f59e0b;
}

.order-notification.ready {
  border-left-color: #22c55e;
}

.order-notification.delivered {
  border-left-color: #06b6d4;
}

.order-notification.cancelled {
  border-left-color: #ef4444;
}

.order-notification.success {
  border-left-color: #10b981;
}

.order-notification.error {
  border-left-color: #ef4444;
}

.order-notification.info {
  border-left-color: #3b82f6;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Content */
.notification-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.notification-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
}

.notification-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.order-notification:hover .notification-icon {
  transform: scale(1.1);
}

.notification-icon.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.notification-icon.confirmed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-icon.preparing {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-icon.ready {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.notification-icon.delivered {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.notification-icon.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.notification-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.notification-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.notification-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.notification-header {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.notification-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
  margin: 0;
}

.notification-restaurant {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-message {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.notification-items {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.notification-items-count {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.notification-total {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2563eb;
  margin-left: auto;
}

/* Close button */
.notification-close {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem 0.75rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #475569;
  background: rgba(0, 0, 0, 0.02);
}

.notification-close svg {
  width: 20px;
  height: 20px;
}

/* Progress bar customization */
.custom-toast-progress-new {
  background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
}

.custom-toast-progress-confirmed {
  background: linear-gradient(90deg, #10b981, #059669) !important;
}

.custom-toast-progress-preparing {
  background: linear-gradient(90deg, #f59e0b, #d97706) !important;
}

.custom-toast-progress-ready {
  background: linear-gradient(90deg, #22c55e, #16a34a) !important;
}

.custom-toast-progress-delivered {
  background: linear-gradient(90deg, #06b6d4, #0891b2) !important;
}

.custom-toast-progress-cancelled {
  background: linear-gradient(90deg, #ef4444, #dc2626) !important;
}

.custom-toast-progress-success {
  background: linear-gradient(90deg, #10b981, #059669) !important;
}

.custom-toast-progress-error {
  background: linear-gradient(90deg, #ef4444, #dc2626) !important;
}

.custom-toast-progress-info {
  background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
}

/* Responsive */
@media (max-width: 640px) {
  .order-notification {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }

  .notification-content {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }

  .notification-title {
    font-size: 0.875rem;
  }

  .notification-message {
    font-size: 0.8125rem;
  }

  .notification-close {
    padding: 0.875rem 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .order-notification {
    background: #1e293b;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .notification-title {
    color: #f1f5f9;
  }

  .notification-restaurant {
    color: #94a3b8;
  }

  .notification-message {
    color: #cbd5e1;
  }

  .notification-items {
    border-top-color: #334155;
  }

  .notification-items-count {
    color: #94a3b8;
  }

  .notification-close {
    color: #94a3b8;
  }

  .notification-close:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
  }
}

3. src/hooks/useOrderNotifications.js (Nouveau)

JavaScript

import { useCallback } from 'react';
import { showOrderNotification } from '../components/notifications/OrderNotification';

/**
 * Hook personnalisé pour gérer les notifications de commandes
 */
export const useOrderNotifications = () => {
  // Notifier une nouvelle commande
  const notifyNewOrder = useCallback((order) => {
    showOrderNotification.newOrder(order);
  }, []);

  // Notifier un changement de statut
  const notifyStatusChange = useCallback((order, status) => {
    const statusLower = String(status || '').toLowerCase();
    
    const notificationMap = {
      'confirmed': showOrderNotification.confirmed,
      'confirmee': showOrderNotification.confirmed,
      'preparing': showOrderNotification.preparing,
      'en_preparation': showOrderNotification.preparing,
      'ready': showOrderNotification.ready,
      'prete': showOrderNotification.ready,
      'delivered': showOrderNotification.delivered,
      'livree': showOrderNotification.delivered,
      'cancelled': showOrderNotification.cancelled,
      'annulee': showOrderNotification.cancelled,
    };

    const notifyFn = notificationMap[statusLower];
    if (notifyFn) {
      notifyFn(order);
    } else {
      showOrderNotification.info(`Statut mis à jour : ${status}`);
    }
  }, []);

  // Notifications simples
  const notifySuccess = useCallback((message) => {
    showOrderNotification.success(message);
  }, []);

  const notifyError = useCallback((message) => {
    showOrderNotification.error(message);
  }, []);

  const notifyInfo = useCallback((message) => {
    showOrderNotification.info(message);
  }, []);

  return {
    notifyNewOrder,
    notifyStatusChange,
    notifySuccess,
    notifyError,
    notifyInfo,
  };
};

export default useNotifications;