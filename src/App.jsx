// src/App.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { subscribeToWebPush } from './push'; 

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';
import './App.css';
import './i18n';

// Router
import AppRouter from './routes/AppRouter';

// Notifications & Services
import { showOrderNotification } from './components/notifications/OrderNotification';
import { emitDashboardRefresh } from './utils/dashboardEvents';
import useAuthStore from './stores/authStore';
import client from './api/client';
import { pusherService } from './services/pusher';

// ========================================
// UTILITAIRES
// ========================================

// Son de notification
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(988, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.2);
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silencieux
  }
};

// Enregistrer le Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log(' Service Worker enregistré:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Erreur Service Worker:', error);
    }
  }
  return null;
};

// Demander permission pour les notifications
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

// Afficher une notification système (même app en background)
const showSystemNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo192.jpg',
        badge: '/logo192.jpg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (e) {
      // Sur mobile, utiliser le Service Worker
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        });
      }
    }
  }
};

// ========================================
// GESTIONNAIRE PUSHER (Temps réel)
// ========================================
const PusherNotificationManager = ({ onNewOrder }) => {
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [status, setStatus] = useState('initializing');
  const subscribedRef = useRef(false);
  const cleanupRef = useRef([]);

  useEffect(() => {
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;

    if (!pusherKey) {
      console.log('VITE_PUSHER_KEY non configuré');
      setStatus('no_key');
      return;
    }

    if (!token || !restaurantId) {
      console.log(' En attente de connexion...', { hasToken: !!token, restaurantId });
      setStatus('waiting_auth');
      return;
    }

    if (subscribedRef.current) {
      console.log('Déjà abonné');
      return;
    }

    console.log(' Configuration Pusher pour restaurant:', restaurantId);
    setStatus('connecting');

    // Initialiser Pusher
    const pusher = pusherService.init();
    
    if (!pusher) {
      console.error('Échec init Pusher');
      setStatus('init_failed');
      return;
    }

    // Fonction de setup des abonnements
    const setupSubscriptions = () => {
      if (subscribedRef.current) return;
      subscribedRef.current = true;
      setStatus('connected');

      console.log(' Configuration des channels...');

      // Channels à écouter
      const channels = [
        `user-${restaurantId}`,               // ← Channel utilisé par sendNotification sur ton backend
        `orders-restaurant-${restaurantId}`,  // Channel des commandes
        'orders',                             // Channel global
      ];

      // Événements à écouter
      const events = [
        'new-notification',       // ← Événement envoyé par sendNotification.js du backend
        'new-order',
        'new_order', 
        'order-created',
        'order-status-updated',
      ];

      // S'abonner à tous les channels et événements
      channels.forEach(channelName => {
        events.forEach(eventName => {
          const unsub = pusherService.on(channelName, eventName, (data) => {
            console.log(`[Pusher] ${channelName}/${eventName}:`, data);
            
            // Vérifier si c'est pour notre restaurant
            const orderRestaurantId = data.restaurantId || data.restaurant_id || 
                                      data.order?.restaurantId || data.order?.restaurant_id ||
                                      data.order?.restaurant?._id || data.user;
            
            if (!orderRestaurantId || orderRestaurantId === restaurantId) {
              handleOrderEvent(eventName, data);
            }
          });
          cleanupRef.current.push(unsub);
        });
      });

      console.log(' Abonnements Pusher configurés');
    };

    // Gestion des événements de commande et de notifications
    const handleOrderEvent = (eventName, data) => {
      //  Si c'est l'événement envoyé par ton sendNotification.js backend
      if (eventName === 'new-notification' && data.type === 'commande') {
        handleNewOrderFromNotification(data);
        return;
      }

      const isNewOrder = eventName.includes('new') || eventName.includes('created');
      const isStatusUpdate = eventName.includes('status') || eventName.includes('updated');

      if (isNewOrder) {
        handleNewOrder(data);
      } else if (isStatusUpdate) {
        handleStatusUpdate(data);
      }
    };

    // Handler pour les notifications génériques du backend (Option 1)
    const handleNewOrderFromNotification = (data) => {
      console.log(' Nouvelle commande reçue via Notification user:', data);

      // On extrait le numéro de commande du texte (ex: CMD-1234)
      const match = data.contenu?.match(/\(([^)]+)\)/);
      const orderNumber = match ? match[1] : 'N/A';

      const orderData = {
        orderNumber: orderNumber,
        restaurant: 'Mon Restaurant',
        items: [],
        total: 0,
        status: 'en_attente',
      };

      // Toast dans l'application
      showOrderNotification.newOrder(orderData);

      // Notification OS
      showSystemNotification('' + data.titre, {
        body: data.contenu,
        tag: `order-${orderNumber}`,
        requireInteraction: true,
      });

      // Rafraîchir l'écran
      emitDashboardRefresh({
        reason: 'new_order',
        orderId: orderNumber,
        source: 'pusher-notification',
        timestamp: Date.now(),
      });

      playNotificationSound();
    };

    // Nouvelle commande (Handler standard)
    const handleNewOrder = (data) => {
      console.log(' Nouvelle commande Pusher standard:', data);
      
      const order = data.order || data;
      
      const orderData = {
        orderNumber: order.orderNumber || order.order_number || order._id || order.id,
        restaurant: order.restaurantName || order.restaurant_name || order.restaurant?.name || 'Restaurant',
        items: order.items || [],
        total: order.total || order.totalAmount || order.total_amount || 0,
        status: order.status || 'pending',
      };

      showOrderNotification.newOrder(orderData);

      showSystemNotification('Nouvelle commande !', {
        body: `Commande #${orderData.orderNumber}\n${orderData.total.toLocaleString('fr-FR')} FCFA`,
        tag: `order-${orderData.orderNumber}`,
        requireInteraction: true,
      });

      emitDashboardRefresh({
        reason: 'new_order',
        orderId: orderData.orderNumber,
        source: 'pusher',
        timestamp: Date.now(),
      });

      playNotificationSound();

      if (onNewOrder) onNewOrder(orderData);
    };

    // Mise à jour de statut
    const handleStatusUpdate = (data) => {
      console.log(' Mise à jour statut:', data);
      
      const order = data.order || data;
      const newStatus = data.newStatus || data.new_status || data.status || order.status;
      
      const orderData = {
        orderNumber: data.orderId || data.order_id || order.orderNumber || order._id,
        restaurant: data.restaurantName || order.restaurantName,
        status: newStatus,
      };

      const statusNotifications = {
        confirmed: showOrderNotification.confirmed,
        confirmee: showOrderNotification.confirmed,
        preparing: showOrderNotification.preparing,
        en_preparation: showOrderNotification.preparing,
        in_preparation: showOrderNotification.preparing,
        ready: showOrderNotification.ready,
        prete: showOrderNotification.ready,
        delivered: showOrderNotification.delivered,
        livree: showOrderNotification.delivered,
        cancelled: showOrderNotification.cancelled,
        annulee: showOrderNotification.cancelled,
      };

      const notifyFn = statusNotifications[newStatus?.toLowerCase()];
      if (notifyFn) {
        notifyFn(orderData);
      }

      emitDashboardRefresh({
        reason: 'status_update',
        orderId: orderData.orderNumber,
        newStatus,
        source: 'pusher',
      });
    };

    // Écouter la connexion
    const unsubConnected = pusherService.onConnectionChange('connected', () => {
      console.log(' Pusher connecté, setup abonnements...');
      setupSubscriptions();
    });

    const unsubDisconnected = pusherService.onConnectionChange('disconnected', () => {
      console.log(' Pusher déconnecté');
      setStatus('disconnected');
      subscribedRef.current = false;
    });

    cleanupRef.current.push(unsubConnected, unsubDisconnected);

    if (pusherService.isConnected()) {
      setupSubscriptions();
    }

    return () => {
      console.log(' Cleanup Pusher...');
      cleanupRef.current.forEach(fn => fn && fn());
      cleanupRef.current = [];
      subscribedRef.current = false;
    };
  }, [token, restaurantId, onNewOrder]);

  if (import.meta.env.DEV) {
    const statusColors = {
      initializing: '#f59e0b',
      no_key: '#6b7280',
      waiting_auth: '#f59e0b',
      connecting: '#3b82f6',
      connected: '#10b981',
      disconnected: '#ef4444',
      init_failed: '#ef4444',
    };

    const statusLabels = {
      initializing: 'Init...',
      no_key: 'Pas de clé',
      waiting_auth: 'Auth...',
      connecting: 'Connexion...',
      connected: 'Pusher OK',
      disconnected: 'Déconnecté',
      init_failed: 'Échec',
    };

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 50,
          left: 10,
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: statusColors[status] || '#6b7280',
          color: 'white',
          zIndex: 99999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontFamily: 'system-ui',
        }}
      >
        {statusLabels[status] || status}
      </div>
    );
  }

  return null;
};

// ========================================
// GESTIONNAIRE POLLING (Backup)
// ========================================
const PollingNotificationManager = () => {
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [isPolling, setIsPolling] = useState(false);
  const lastOrderIdsRef = useRef(new Set());
  const lastCheckRef = useRef(Date.now());
  const pollingIntervalRef = useRef(null);

  const checkNewOrders = useCallback(async () => {
    if (!token || !restaurantId) return;

    try {
      const response = await client.get(`/order/${restaurantId}`, {
        params: {
          limit: 10,
          sort: '-createdAt',
        },
      });

      const orders = response.data?.orders || response.data?.data || response.data || [];
      
      if (!Array.isArray(orders)) return;

      orders.forEach((order) => {
        const orderId = order._id || order.id;
        const createdAt = new Date(order.createdAt).getTime();
        
        if (!lastOrderIdsRef.current.has(orderId)) {
          const isNew = Date.now() - createdAt < 60000;
          
          if (isNew && lastOrderIdsRef.current.size > 0) {
            console.log(' [Polling] Nouvelle commande:', orderId);
            
            const orderData = {
              orderNumber: order.orderNumber || orderId,
              restaurant: order.restaurantName || order.restaurant?.name || 'Restaurant',
              items: order.items || [],
              total: order.total || order.totalAmount || 0,
              status: order.status || 'pending',
            };

            showOrderNotification.newOrder(orderData);
            
            showSystemNotification(' Nouvelle commande !', {
              body: `Commande #${orderData.orderNumber}`,
              tag: `order-${orderData.orderNumber}`,
            });

            emitDashboardRefresh({
              reason: 'new_order',
              orderId: orderData.orderNumber,
              source: 'polling',
              timestamp: Date.now(),
            });

            playNotificationSound();
          }
          
          lastOrderIdsRef.current.add(orderId);
        }
      });

      lastCheckRef.current = Date.now();

      if (lastOrderIdsRef.current.size > 100) {
        const arr = Array.from(lastOrderIdsRef.current);
        lastOrderIdsRef.current = new Set(arr.slice(-50));
      }

    } catch (error) {
      // Silencieux
    }
  }, [token, restaurantId]);

  useEffect(() => {
    if (!token || !restaurantId) {
      setIsPolling(false);
      return;
    }

    console.log('  Démarrage polling (interval: 15s)');
    setIsPolling(true);

    checkNewOrders();

    pollingIntervalRef.current = setInterval(checkNewOrders, 15000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setIsPolling(false);
    };
  }, [token, restaurantId, checkNewOrders]);

  return null;
};

// ========================================
// APP PRINCIPALE
// ========================================
function App() {
  const [swRegistered, setSwRegistered] = useState(false);
  const token = useAuthStore((s) => s.token); // <-- Récupère le token de connexion

  useEffect(() => {
    const init = async () => {
      const registration = await registerServiceWorker();
      setSwRegistered(true);
      
      const permission = await requestNotificationPermission();

      //  NOUVEAU : On l'abonne au Web Push si on a l'autorisation ET qu'il est connecté
      if (permission && registration && token) {
        console.log(" Lancement de l'abonnement Web Push...");
        subscribeToWebPush();
      }
    };
    
    init();
  }, [token]); // <-- Le useEffect se relance quand le token de connexion apparaît (connexion réussie)

  return (
    <BrowserRouter>
      {/* PUSHER - Notifications temps réel */}
      <PusherNotificationManager />
      
      {/* POLLING - Backup toutes les 15s */}
      <PollingNotificationManager />

      {/* Routes de l'application */}
      <AppRouter />

      {/* Container des toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        limit={5}
        style={{
          top: '80px',
          right: '1rem',
          zIndex: 9999,
        }}
      />
    </BrowserRouter>
  );
}

export default App;