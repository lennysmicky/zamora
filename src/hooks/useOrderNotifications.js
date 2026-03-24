// src/hooks/useOrderNotifications.js
import { useEffect, useCallback, useState, useRef } from 'react';
import { usePusher } from './usePusher';
import useAuthStore from '../stores/authStore';

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
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2);

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('Son non supporté');
  }
};

/**
 * Demander la permission pour les notifications natives
 */
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log(' Notifications non supportées par ce navigateur');
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
 * Afficher une notification native
 */
const showNativeNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
      return notification;
    } catch (e) {
      console.error('Erreur notification native:', e);
    }
  }
  return null;
};

/**
 * Hook pour écouter les notifications de commandes via Pusher
 */
export const useOrderNotifications = (options = {}) => {
  const { 
    onNewOrder,
    onOrderStatusChanged,
    autoSubscribe = true 
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { on, isConnected, restaurantId } = usePusher();
  
  const user = useAuthStore((s) => s.user);
  const subscribedRef = useRef(false);

  // Déterminer les channels à écouter selon le rôle
  const getChannels = useCallback(() => {
    const channels = [];
    
    if (user?.role === 'admin') {
      // Admin écoute toutes les commandes
      channels.push('orders');
    } else if (user?.role === 'restaurant' || restaurantId) {
      // Restaurant écoute son channel spécifique
      const restId = restaurantId || user?.restaurant_id;
      if (restId) {
        channels.push(`restaurant.${restId}`);
        channels.push(`private-restaurant.${restId}`);
      }
    }
    
    // Channel global pour tous
    channels.push('orders');
    
    return [...new Set(channels)]; // Enlever les doublons
  }, [user, restaurantId]);

  // Handler pour nouvelle commande
  const handleNewOrder = useCallback((data) => {
    console.log(' Nouvelle commande reçue via Pusher:', data);
    
    const order = data.order || data;
    
    // Créer la notification
    const notification = {
      id: Date.now(),
      type: 'Zamora Restaurant',
      title: ' Nouvelle Commande!',
      message: `Commande #${order.id || order.orderNumber || 'N/A'} - ${(order.total || order.totalAmount || 0).toLocaleString()} FCFA`,
      order,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Garder max 50
    setUnreadCount(prev => prev + 1);

    // Jouer le son
    playNotificationSound();

    // Notification native si en arrière-plan
    if (document.hidden) {
      showNativeNotification(notification.title, {
        body: notification.message,
        tag: `order-${order.id}`,
      });
    }

    // Callback personnalisé
    if (onNewOrder) {
      onNewOrder(order, notification);
    }
  }, [onNewOrder]);

  // Handler pour changement de statut
  const handleStatusChanged = useCallback((data) => {
    console.log(' Statut commande changé:', data);
    
    const order = data.order || data;
    const status = data.status || order.status;
    
    const notification = {
      id: Date.now(),
      type: 'status_changed',
      title: ' Statut mis à jour',
      message: `Commande #${order.id || 'N/A'} → ${status}`,
      order,
      status,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);

    if (onOrderStatusChanged) {
      onOrderStatusChanged(order, status, notification);
    }
  }, [onOrderStatusChanged]);

  // S'abonner aux channels
  useEffect(() => {
    if (!autoSubscribe || !isConnected || subscribedRef.current) {
      return;
    }

    const channels = getChannels();
    
    if (channels.length === 0) {
      console.log(' Aucun channel à écouter');
      return;
    }

    console.log(' Abonnement aux channels:', channels);
    subscribedRef.current = true;

    const cleanupFns = [];

    channels.forEach(channel => {
      // Écouter différents formats d'événements (selon config backend)
      const events = [
        'new-order',
        'NewOrder', 
        'App\\Events\\NewOrder',
        'order.created',
      ];

      events.forEach(eventName => {
        const cleanup = on(channel, eventName, handleNewOrder);
        cleanupFns.push(cleanup);
      });

      // Écouter les changements de statut
      const statusEvents = [
        'order-status-changed',
        'OrderStatusChanged',
        'App\\Events\\OrderStatusChanged',
        'order.updated',
      ];

      statusEvents.forEach(eventName => {
        const cleanup = on(channel, eventName, handleStatusChanged);
        cleanupFns.push(cleanup);
      });
    });

    // Demander permission notifications
    requestNotificationPermission();

    return () => {
      cleanupFns.forEach(fn => fn && fn());
      subscribedRef.current = false;
    };
  }, [isConnected, autoSubscribe, getChannels, on, handleNewOrder, handleStatusChanged]);

  // Actions sur les notifications
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  return {
    // État
    notifications,
    unreadCount,
    isConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    
    // Utilitaires
    playNotificationSound,
    requestNotificationPermission,
  };
};

export default useOrderNotifications;