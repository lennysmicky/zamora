// src/utils/dashboardEvents.js
import { useEffect, useCallback } from 'react';

const DASHBOARD_REFRESH_EVENT = 'zamora:dashboard-refresh';
const ORDER_NOTIFICATION_EVENT = 'zamora:order-notification';

/**
 * Émettre un événement de rafraîchissement du dashboard
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
    console.log('Dashboard refresh émis:', eventDetail.reason, eventDetail);
  } catch (error) {
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(DASHBOARD_REFRESH_EVENT, true, true, eventDetail);
    window.dispatchEvent(event);
  }
};

/**
 * S'abonner aux événements de rafraîchissement
 */
export const onDashboardRefresh = (handler) => {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {};
  }

  const listener = (event) => {
    const detail = event?.detail ?? {};
    handler(detail);
  };

  window.addEventListener(DASHBOARD_REFRESH_EVENT, listener);

  return () => {
    window.removeEventListener(DASHBOARD_REFRESH_EVENT, listener);
  };
};

/**
 * Hook React pour écouter les rafraîchissements
 */
export const useDashboardRefresh = (callback, deps = []) => {
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    return onDashboardRefresh(memoizedCallback);
  }, [memoizedCallback]);
};

export { DASHBOARD_REFRESH_EVENT, ORDER_NOTIFICATION_EVENT };

export default {
  emitDashboardRefresh,
  onDashboardRefresh,
  useDashboardRefresh,
};