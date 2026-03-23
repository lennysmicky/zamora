// src/providers/NotificationProvider.jsx
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWebSocket, wsService } from '../hooks/useWebSocket';
import { showOrderNotification } from '../components/notifications/OrderNotification';
import { emitDashboardRefresh } from '../utils/dashboardEvents';
import useAuthStore from '../stores/authStore';

const NotificationProvider = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  // Initialiser WebSocket
  const { isConnected, connectionState } = useWebSocket({
    url: import.meta.env.VITE_WS_URL,
    autoConnect: true,
  });

  // Écouter les événements de commandes
  useEffect(() => {
    if (!token) return;

    // Handler pour nouvelle commande
    const handleNewOrder = (data) => {
      console.log('🆕 Nouvelle commande reçue:', data);
      
      const order = data.order || data;
      const orderData = {
        orderNumber: order.id || order._id || order.orderNumber,
        restaurant: order.restaurantName || order.restaurant?.name,
        items: order.items || [],
        total: order.total || order.totalAmount,
        status: order.status || 'pending',
      };

      // Afficher la notification toast
      showOrderNotification.newOrder(orderData);

      // Rafraîchir le dashboard
      emitDashboardRefresh({
        reason: 'new_order',
        orderId: orderData.orderNumber,
        restaurantId: data.restaurantId,
      });
    };

    // Handler pour changement de statut
    const handleStatusUpdate = (data) => {
      console.log('🔄 Statut commande mis à jour:', data);
      
      const { order, orderId, newStatus, restaurantName } = data;
      
      const orderData = {
        orderNumber: orderId || order?.id || order?._id,
        restaurant: restaurantName || order?.restaurantName,
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

    // Handler pour commande créée
    const handleOrderCreated = (data) => {
      console.log('✅ Commande créée:', data);
      showOrderNotification.success('Nouvelle commande créée avec succès');
      emitDashboardRefresh({ reason: 'order_created' });
    };

    // S'abonner aux événements
    const unsubNewOrder = wsService.on('new_order', handleNewOrder);
    const unsubStatusUpdate = wsService.on('order_status_updated', handleStatusUpdate);
    const unsubStatusUpdate2 = wsService.on('status_update', handleStatusUpdate);
    const unsubOrderCreated = wsService.on('order_created', handleOrderCreated);

    console.log('🔔 Notification listeners activés');

    return () => {
      unsubNewOrder();
      unsubStatusUpdate();
      unsubStatusUpdate2();
      unsubOrderCreated();
    };
  }, [token]);

  // Debug: afficher l'état de connexion
  useEffect(() => {
    console.log(`🔌 WebSocket état: ${connectionState}, connecté: ${isConnected}`);
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

      {/* Indicateur de connexion WebSocket (optionnel, pour debug) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            padding: '5px 10px',
            borderRadius: 4,
            fontSize: 12,
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            color: 'white',
            zIndex: 9999,
          }}
        >
          WS: {connectionState}
        </div>
      )}
    </>
  );
};

export default NotificationProvider;