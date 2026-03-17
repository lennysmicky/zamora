import React from 'react';
import toast from 'react-hot-toast';
import { 
  RiCheckCircleLine, 
  RiErrorWarningLine, 
  RiInformationLine,
  RiCloseLine,
  RiShoppingBag2Line,
  RiTimeLine,
  RiCheckLine,
  RiTruckLine
} from 'react-icons/ri';
import './OrderNotification.css';

// Icônes selon le statut de la commande
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <RiTimeLine className="notification-icon pending" />;
    case 'confirmed':
      return <RiCheckLine className="notification-icon confirmed" />;
    case 'preparing':
      return <RiShoppingBag2Line className="notification-icon preparing" />;
    case 'ready':
      return <RiCheckCircleLine className="notification-icon ready" />;
    case 'delivered':
      return <RiTruckLine className="notification-icon delivered" />;
    case 'cancelled':
      return <RiErrorWarningLine className="notification-icon cancelled" />;
    default:
      return <RiInformationLine className="notification-icon info" />;
  }
};

// Composant de notification personnalisé
const OrderNotification = ({ t, order, message, type = 'info' }) => {
  return (
    <div
      className={`order-notification ${
        t.visible ? 'notification-enter' : 'notification-leave'
      } ${type}`}
    >
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
          
          {order?.items && (
            <div className="notification-items">
              <span className="notification-items-count">
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
              {order.total && (
                <span className="notification-total">
                  {order.total.toFixed(2)} €
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="notification-actions">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="notification-close"
          aria-label="Fermer"
        >
          <RiCloseLine />
        </button>
      </div>
    </div>
  );
};

// Fonctions helper pour afficher les notifications
export const showOrderNotification = {
  // Nouvelle commande
  newOrder: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Nouvelle commande reçue"
          type="new"
        />
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  },

  // Commande confirmée
  confirmed: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Commande confirmée par le restaurant"
          type="confirmed"
        />
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  },

  // Commande en préparation
  preparing: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Votre commande est en préparation"
          type="preparing"
        />
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  },

  // Commande prête
  ready: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Votre commande est prête !"
          type="ready"
        />
      ),
      {
        duration: 7000,
        position: 'top-right',
      }
    );
  },

  // Commande livrée
  delivered: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Commande livrée avec succès"
          type="delivered"
        />
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  },

  // Commande annulée
  cancelled: (order) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          order={order}
          message="Commande annulée"
          type="cancelled"
        />
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  },

  // Notification générique de succès
  success: (message) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          message={message}
          type="success"
        />
      ),
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  },

  // Notification d'erreur
  error: (message) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          message={message}
          type="error"
        />
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  },

  // Notification d'information
  info: (message) => {
    toast.custom(
      (t) => (
        <OrderNotification
          t={t}
          message={message}
          type="info"
        />
      ),
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  },
};

export default OrderNotification;