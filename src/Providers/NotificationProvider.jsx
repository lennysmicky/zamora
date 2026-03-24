// src/Providers/NotificationProvider.jsx
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePusher } from '../hooks/usePusher';
import { showOrderNotification } from '../components/notifications/OrderNotification';
import { emitDashboardRefresh } from '../utils/dashboardEvents';
import useAuthStore from '../stores/authStore';
import env from '../config/env';

const NotificationProvider = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  // Utiliser Pusher au lieu de WebSocket
  const { isConnected, connectionState, on } = usePusher();

  // Écouter les événements de commandes via Pusher
  useEffect(() => {
    if (!token || !isConnected) {
      console.log(' En attente de connexion Pusher...', { token: !!token, isConnected });
      return;
    }

    console.log(' Configuration des listeners Pusher...');

    // Déterminer les channels selon le rôle
    const channels = [];
    
    if (user?.role === 'admin') {
      channels.push('orders');
    }
    
    if (user?.role === 'restaurant' || restaurantId) {
      const restId = restaurantId || user?.restaurant_id;
      if (restId) {
        channels.push(`restaurant.${restId}`);
      }
    }
    
    // Channel global
    if (!channels.includes('orders')) {
      channels.push('orders');
    }

    console.log(' Channels à écouter:', channels);

    // Handler pour nouvelle commande
    const handleNewOrder = (data) => {
      console.log(' Nouvelle commande reçue:', data);
      
      const order = data.order || data;
      const orderData = {
        orderNumber: order.id || order._id || order.orderNumber,
        restaurant: order.restaurantName || order.restaurant?.name,
        items: order.items || [],
        total: order.total || order.totalAmount,
        status: order.status || 'pending',
      };

      // Jouer le son
      playNotificationSound();

      // Afficher la notification toast
      showOrderNotification.newOrder(orderData);

      // // Notification native si en arrière-plan
      // if (document.hidden) {
      //   showNativeNotification(' Nouvelle Commande!', {
      //     body: `Commande #${orderData.orderNumber} - ${(orderData.total || 0).toLocaleString()} FCFA`,
      //     tag: `order-${orderData.orderNumber}`,
      //   });
      // }

      // Rafraîchir le dashboard
      emitDashboardRefresh({
        reason: 'new_order',
        orderId: orderData.orderNumber,
        restaurantId: data.restaurantId,
      });
    };

    // Handler pour changement de statut
    const handleStatusUpdate = (data) => {
      console.log(' Statut commande mis à jour:', data);
      
      const order = data.order || data;
      const newStatus = data.status || data.newStatus || order?.status;
      
      const orderData = {
        orderNumber: data.orderId || order?.id || order?._id,
        restaurant: data.restaurantName || order?.restaurantName,
        items: order?.items || [],
        total: order?.total,
        status: newStatus,
      };

      const statusLower = String(newStatus || '').toLowerCase();
      
      const notificationMap = {
        'confirmed': () => showOrderNotification.confirmed(orderData),
        'confirmee': () => showOrderNotification.confirmed(orderData),
        'preparing': () => showOrderNotification.preparing(orderData),
        'en_preparation': () => showOrderNotification.preparing(orderData),
        'in_preparation': () => showOrderNotification.preparing(orderData),
        'ready': () => showOrderNotification.ready(orderData),
        'prete': () => showOrderNotification.ready(orderData),
        'delivered': () => showOrderNotification.delivered(orderData),
        'livree': () => showOrderNotification.delivered(orderData),
        'cancelled': () => showOrderNotification.cancelled(orderData),
        'annulee': () => showOrderNotification.cancelled(orderData),
      };

      const notifyFn = notificationMap[statusLower];
      if (notifyFn) {
        notifyFn();
      } else {
        showOrderNotification.info(`Commande #${orderData.orderNumber}: ${newStatus}`);
      }

      emitDashboardRefresh({
        reason: 'status_update',
        orderId: orderData.orderNumber,
        status: newStatus,
      });
    };

    // S'abonner aux événements sur chaque channel
    const cleanupFns = [];

    channels.forEach(channel => {
      // Événements de nouvelle commande (différents formats possibles du backend)
      const newOrderEvents = [
        'new-order',
        'NewOrder',
        'App\\Events\\NewOrder',
        'order.created',
        'new_order',
      ];

      newOrderEvents.forEach(eventName => {
        const cleanup = on(channel, eventName, handleNewOrder);
        if (cleanup) cleanupFns.push(cleanup);
      });

      // Événements de changement de statut
      const statusEvents = [
        'order-status-changed',
        'OrderStatusChanged',
        'App\\Events\\OrderStatusChanged',
        'order.updated',
        'order_status_updated',
        'status_update',
      ];

      statusEvents.forEach(eventName => {
        const cleanup = on(channel, eventName, handleStatusUpdate);
        if (cleanup) cleanupFns.push(cleanup);
      });
    });

    console.log(' Listeners Pusher configurés');

    // Demander permission pour notifications natives
    requestNotificationPermission();

    return () => {
      console.log(' Nettoyage des listeners Pusher');
      cleanupFns.forEach(fn => fn && fn());
    };
  }, [token, isConnected, user, restaurantId, on]);

  // Debug: afficher l'état de connexion
  useEffect(() => {
    if (env.DEBUG) {
      console.log(` Pusher état: ${connectionState}, connecté: ${isConnected}`);
    }
  }, [isConnected, connectionState]);

  return (
    <>
      {children}
      
      {/* Container pour les notifications Toast */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />

      {/* Indicateur de connexion Pusher (en dev seulement) */}
      {env.IS_DEV && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            color: 'white',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isConnected ? '#fff' : '#fca5a5',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
          }} />
          Pusher: {connectionState}
        </div>
      )}
    </>
  );
};

// ============================================
// Fonctions utilitaires pour les notifications
// ============================================

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2);

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    // Silencieux si non supporté
  }
};

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.log('Permission notification non disponible');
    }
  }
};

const showNativeNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        vibrate: [200, 100, 200],
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    } catch (e) {
      // Silencieux
    }
  }
};

export default NotificationProvider;