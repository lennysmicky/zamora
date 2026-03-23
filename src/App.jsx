// src/App.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';
import './App.css';
import './i18n';

// Router
import AppRouter from './routes/AppRouter';

// Notifications
import { showOrderNotification } from './components/notifications/OrderNotification';
import { emitDashboardRefresh } from './utils/dashboardEvents';
import useAuthStore from './stores/authStore';
import client from './api/client';

// ========================================
// GESTIONNAIRE DE NOTIFICATIONS (POLLING)
// ========================================
const OrderNotificationManager = () => {
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const [isPolling, setIsPolling] = useState(false);
  const lastOrderIdsRef = useRef(new Set());
  const lastCheckRef = useRef(Date.now());
  const pollingIntervalRef = useRef(null);

  // Fonction pour récupérer les nouvelles commandes
  const checkNewOrders = useCallback(async () => {
    if (!token || !restaurantId) return;

    try {
      // Récupérer les commandes récentes (dernières 2 minutes)
      const response = await client.get(`/order/${restaurantId}`, {
        params: {
          limit: 10,
          sort: '-createdAt',
          // Filtrer les commandes créées après la dernière vérification
          createdAfter: new Date(lastCheckRef.current - 120000).toISOString(),
        },
      });

      const orders = response.data?.orders || response.data?.data || response.data || [];
      
      if (!Array.isArray(orders)) return;

      // Vérifier les nouvelles commandes
      orders.forEach((order) => {
        const orderId = order._id || order.id;
        const createdAt = new Date(order.createdAt).getTime();
        
        // Si c'est une nouvelle commande qu'on n'a pas encore vue
        if (!lastOrderIdsRef.current.has(orderId) && createdAt > lastCheckRef.current - 120000) {
          // Vérifier si c'est vraiment une nouvelle commande (créée dans les dernières 30 secondes)
          const isNew = Date.now() - createdAt < 30000;
          
          if (isNew) {
            console.log(' Nouvelle commande détectée:', orderId);
            
            const orderData = {
              orderNumber: order.orderNumber || orderId,
              restaurant: order.restaurantName || order.restaurant?.name || 'Restaurant',
              items: order.items || [],
              total: order.total || order.totalAmount || 0,
              status: order.status || 'pending',
            };

            // Afficher la notification
            showOrderNotification.newOrder(orderData);

            // Rafraîchir le dashboard
            emitDashboardRefresh({
              reason: 'new_order',
              orderId: orderData.orderNumber,
              restaurantId,
              timestamp: Date.now(),
            });

            // Jouer un son
            playNotificationSound();
          }
          
          // Marquer comme vue
          lastOrderIdsRef.current.add(orderId);
        }
      });

      // Mettre à jour le timestamp de dernière vérification
      lastCheckRef.current = Date.now();

      // Nettoyer les anciennes IDs (garder seulement les 100 dernières)
      if (lastOrderIdsRef.current.size > 100) {
        const idsArray = Array.from(lastOrderIdsRef.current);
        lastOrderIdsRef.current = new Set(idsArray.slice(-50));
      }

    } catch (error) {
      // Ignorer les erreurs silencieusement (éviter le spam dans la console)
      if (import.meta.env.DEV) {
        console.log('Polling check:', error.message);
      }
    }
  }, [token, restaurantId]);

  // Démarrer le polling
  useEffect(() => {
    if (!token || !restaurantId) {
      setIsPolling(false);
      return;
    }

    console.log(' Démarrage du polling des commandes...');
    setIsPolling(true);

    // Première vérification immédiate
    checkNewOrders();

    // Polling toutes les 10 secondes
    pollingIntervalRef.current = setInterval(() => {
      checkNewOrders();
    }, 10000);

    return () => {
      console.log('Arrêt du polling');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setIsPolling(false);
    };
  }, [token, restaurantId, checkNewOrders]);

  // Indicateur de statut en mode dev
  // if (import.meta.env.DEV) {
  //   return (
  //     <div
  //       style={{
  //         position: 'fixed',
  //         bottom: 10,
  //         right: 10,
  //         padding: '6px 12px',
  //         borderRadius: 6,
  //         fontSize: 11,
  //         fontWeight: 500,
  //         backgroundColor: isPolling ? '#10b981' : '#6b7280',
  //         color: 'white',
  //         zIndex: 99999,
  //         display: 'flex',
  //         alignItems: 'center',
  //         gap: 6,
  //         boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  //       }}
  //     >
  //       {/* <span
  //         style={{
  //           width: 8,
  //           height: 8,
  //           borderRadius: '50%',
  //           backgroundColor: isPolling ? '#34d399' : '#9ca3af',
  //         }}
  //       />
  //       {isPolling ? ' Polling actif' : 'Polling inactif'} */}
  //     </div>
  //   );
  // }

  return null;
};

// ========================================
// GESTIONNAIRE WebSocket (si URL configurée)
// ========================================
const WebSocketNotificationManager = () => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  // Si pas d'URL WebSocket, ne rien faire
  if (!wsUrl || wsUrl.trim() === '') {
    return null;
  }

  // Import dynamique pour éviter les erreurs si WebSocket non configuré
  const { useWebSocket, wsService } = require('./hooks/useWebSocket');
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const { isConnected, connectionState } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  });

  useEffect(() => {
    if (!token) return;

    const handleNewOrder = (data) => {
      console.log(' [WS] Nouvelle commande:', data);
      
      const order = data.order || data;
      showOrderNotification.newOrder({
        orderNumber: order.id || order._id || order.orderNumber,
        restaurant: order.restaurantName || order.restaurant?.name,
        items: order.items || [],
        total: order.total || order.totalAmount,
        status: order.status || 'pending',
      });

      emitDashboardRefresh({ reason: 'new_order', orderId: order.id });
      playNotificationSound();
    };

    const handleStatusUpdate = (data) => {
      console.log(' [WS] Statut mis à jour:', data);
      
      const { order, orderId, newStatus, restaurantName } = data;
      const orderData = {
        orderNumber: orderId || order?.id,
        restaurant: restaurantName || order?.restaurantName,
        status: newStatus,
      };

      const statusMap = {
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

      const notify = statusMap[newStatus?.toLowerCase()];
      if (notify) notify(orderData);

      emitDashboardRefresh({ reason: 'status_update', orderId, newStatus });
    };

    const unsubs = [
      wsService.on('new_order', handleNewOrder),
      wsService.on('order_status_updated', handleStatusUpdate),
    ];

    return () => unsubs.forEach((u) => u?.());
  }, [token, restaurantId]);

  if (import.meta.env.DEV) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 11,
          backgroundColor: isConnected ? '#10b981' : '#ef4444',
          color: 'white',
          zIndex: 99999,
        }}
      >
        WS: {connectionState}
      </div>
    );
  }

  return null;
};

// ========================================
// FONCTION SON NOTIFICATION
// ========================================
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Son de notification agréable
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // La note
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1); // Si
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2); // Do
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Silencieux si non supporté
  }
};

// ========================================
// APP PRINCIPALE
// ========================================
function App() {
  const wsUrl = import.meta.env.VITE_WS_URL;
  const usePolling = !wsUrl || wsUrl.trim() === '';

  return (
    <BrowserRouter>
      {/* Choisir le mode de notification */}
      {usePolling ? (
        <OrderNotificationManager />
      ) : (
        <WebSocketNotificationManager />
      )}

      {/* Routes */}
      <AppRouter />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
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