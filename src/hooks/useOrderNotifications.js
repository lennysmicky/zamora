// src/hooks/useOrderNotifications.js
import { useCallback } from 'react';
import { showOrderNotification } from '../components/notifications/OrderNotification';

/**
 * Jouer un son de notification
 */
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Mélodie de notification
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // La
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1); // Si
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2); // Do

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    // Silencieux si non supporté
    console.log('Son non supporté');
  }
};

/**
 * Demander la permission pour les notifications natives
 */
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications non supportées');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Afficher une notification native (même si l'app est en arrière-plan)
 */
const showNativeNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo192.png', // Votre logo
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-fermer après 10 secondes
      setTimeout(() => notification.close(), 50000);

      return notification;
    } catch (e) {
      console.error('Erreur notification native:', e);
    }
  }
  return null;
};

/**
 * Hook personnalisé pour gérer les notifications de commandes
 */
export const useOrderNotifications = () => {
  // Demander la permission au montage
  useCallback(() => {
    requestNotificationPermission();
  }, []);

  // Notifier une nouvelle commande (Toast + Son + Native)
  const notifyNewOrder = useCallback((order, options = {}) => {
    const { playSound = true, showNative = true } = options;

    // 1. Afficher le Toast
    showOrderNotification.newOrder(order);

    // 2. Jouer le son
    if (playSound) {
      playNotificationSound();
    }

    // 3. Notification native (si l'app est en arrière-plan)
    if (showNative && document.hidden) {
      const orderNumber = order?.orderNumber || order?.id || 'N/A';
      const total = order?.total || order?.totalAmount || 0;
      
      showNativeNotification(' Nouvelle Commande!', {
        body: `Commande #${orderNumber} - ${total.toLocaleString()} FCFA`,
        tag: `order-${orderNumber}`,
        data: { orderId: order?.id, type: 'new_order' },
      });
    }
  }, []);

  // Notifier un changement de statut
  const notifyStatusChange = useCallback((order, status, options = {}) => {
    const { playSound = true, showNative = false } = options;
    
    const statusLower = String(status || '').toLowerCase();

    const notificationMap = {
      'confirmed': showOrderNotification.confirmed,
      'confirmee': showOrderNotification.confirmed,
      'preparing': showOrderNotification.preparing,
      'en_preparation': showOrderNotification.preparing,
      'in_preparation': showOrderNotification.preparing,
      'ready': showOrderNotification.ready,
      'prete': showOrderNotification.ready,
      'delivered': showOrderNotification.delivered,
      'livree': showOrderNotification.delivered,
      'livres': showOrderNotification.delivered,
      'cancelled': showOrderNotification.cancelled,
      'annulee': showOrderNotification.cancelled,
      'annules': showOrderNotification.cancelled,
    };

    const notifyFn = notificationMap[statusLower];
    if (notifyFn) {
      notifyFn(order);
    } else {
      showOrderNotification.info(`Statut mis à jour : ${status}`);
    }

    if (playSound) {
      playNotificationSound();
    }

    // Notification native pour les statuts importants
    if (showNative && document.hidden) {
      const orderNumber = order?.orderNumber || order?.id || 'N/A';
      showNativeNotification(` Commande #${orderNumber}`, {
        body: `Statut: ${status}`,
        tag: `order-status-${orderNumber}`,
      });
    }
  }, []);

  // Notifications simples
  const notifySuccess = useCallback((message, options = {}) => {
    showOrderNotification.success(message);
    if (options.playSound) {
      playNotificationSound();
    }
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
    playNotificationSound,
    requestNotificationPermission,
  };
};

export default useOrderNotifications;