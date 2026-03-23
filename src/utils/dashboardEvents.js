// src/utils/dashboardEvents.js
import { useEffect, useCallback } from 'react';

const DASHBOARD_REFRESH_EVENT = 'zamora:dashboard-refresh';
const ORDER_NOTIFICATION_EVENT = 'zamora:order-notification';

/**
 * Émettre un événement de rafraîchissement du dashboard
 * @param {Object} detail - Détails de l'événement
 */
export const emitDashboardRefresh = (detail = {}) => {
  if (typeof window === 'undefined') return;

  const eventDetail = {
    timestamp: Date.now(),
    ...detail,
  };

  try {
    const event = new CustomEvent(DASHBOARD_REFRESH_EVENT, { 
      detail: eventDetail,
      bubbles: true,
    });
    window.dispatchEvent(event);
    console.log('📊 Dashboard refresh émis:', eventDetail);
  } catch (error) {
    // Fallback pour anciens navigateurs
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(DASHBOARD_REFRESH_EVENT, true, true, eventDetail);
    window.dispatchEvent(event);
  }
};

/**
 * S'abonner aux événements de rafraîchissement du dashboard
 * @param {Function} handler - Fonction de callback
 * @returns {Function} Fonction de désabonnement
 */
export const onDashboardRefresh = (handler) => {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {};
  }

  const listener = (event) => {
    const detail = event?.detail ?? {};
    console.log('📊 Dashboard refresh reçu:', detail);
    handler(detail);
  };

  window.addEventListener(DASHBOARD_REFRESH_EVENT, listener);
  
  return () => {
    window.removeEventListener(DASHBOARD_REFRESH_EVENT, listener);
  };
};

/**
 * Émettre une notification de commande
 * @param {Object} detail - Détails de la notification
 */
export const emitOrderNotification = (detail = {}) => {
  if (typeof window === 'undefined') return;

  const eventDetail = {
    timestamp: Date.now(),
    ...detail,
  };

  try {
    const event = new CustomEvent(ORDER_NOTIFICATION_EVENT, { 
      detail: eventDetail,
      bubbles: true,
    });
    window.dispatchEvent(event);
    console.log('🔔 Order notification émise:', eventDetail);
  } catch (error) {
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(ORDER_NOTIFICATION_EVENT, true, true, eventDetail);
    window.dispatchEvent(event);
  }
};

/**
 * S'abonner aux notifications de commandes
 * @param {Function} handler - Fonction de callback
 * @returns {Function} Fonction de désabonnement
 */
export const onOrderNotification = (handler) => {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {};
  }

  const listener = (event) => {
    const detail = event?.detail ?? {};
    handler(detail);
  };

  window.addEventListener(ORDER_NOTIFICATION_EVENT, listener);
  
  return () => {
    window.removeEventListener(ORDER_NOTIFICATION_EVENT, listener);
  };
};

/**
 * Hook React pour écouter les rafraîchissements du dashboard
 * @param {Function} callback - Fonction appelée lors d'un rafraîchissement
 * @param {Array} deps - Dépendances du callback
 */
export const useDashboardRefresh = (callback, deps = []) => {
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const unsubscribe = onDashboardRefresh(memoizedCallback);
    return unsubscribe;
  }, [memoizedCallback]);
};

/**
 * Hook React pour écouter les notifications de commandes
 * @param {Function} callback - Fonction appelée lors d'une notification
 * @param {Array} deps - Dépendances du callback
 */
export const useOrderNotification = (callback, deps = []) => {
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const unsubscribe = onOrderNotification(memoizedCallback);
    return unsubscribe;
  }, [memoizedCallback]);
};

/**
 * Types d'événements de rafraîchissement
 */
export const REFRESH_REASONS = {
  NEW_ORDER: 'new_order',
  ORDER_CREATED: 'order_created',
  STATUS_UPDATE: 'status_update',
  ORDER_DELETED: 'order_deleted',
  PAYMENT_UPDATED: 'payment_updated',
  MANUAL_REFRESH: 'manual_refresh',
};

export { DASHBOARD_REFRESH_EVENT, ORDER_NOTIFICATION_EVENT };

export default {
  emitDashboardRefresh,
  onDashboardRefresh,
  emitOrderNotification,
  onOrderNotification,
  useDashboardRefresh,
  useOrderNotification,
  REFRESH_REASONS,
  DASHBOARD_REFRESH_EVENT,
  ORDER_NOTIFICATION_EVENT,
};