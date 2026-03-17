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