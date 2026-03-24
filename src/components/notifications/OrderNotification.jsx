// src/components/notifications/OrderNotification.jsx
import React from 'react';
import { toast } from 'react-toastify';
import { 
  RiCheckboxCircleLine,     
  RiErrorWarningLine, 
  RiInformationLine,
  RiCloseLine,
  RiShoppingBag2Line,
  RiTimeLine,
  RiCheckLine,
  RiTruckLine,
} from 'react-icons/ri';
import './OrderNotification.css';

// Icônes selon le statut de la commande
const getStatusIcon = (status) => {
  const statusLower = String(status || '').toLowerCase();
  
  switch (statusLower) {
    case 'pending':
    case 'en_attente':
    case 'new':
      return <RiTimeLine className="notification-icon pending" />;
    
    case 'confirmed':
    case 'confirmee':
      return <RiCheckLine className="notification-icon confirmed" />;
    
    case 'preparing':
    case 'en_preparation':
    case 'in_preparation':
      return <RiShoppingBag2Line className="notification-icon preparing" />;
    
    case 'ready':
    case 'prete':
      return <RiCheckboxCircleLine className="notification-icon ready" />;
    
    case 'delivered':
    case 'livree':
    case 'livres':
      return <RiTruckLine className="notification-icon delivered" />;
    
    case 'cancelled':
    case 'annulee':
    case 'annules':
      return <RiErrorWarningLine className="notification-icon cancelled" />;
    
    case 'success':
      return <RiCheckboxCircleLine className="notification-icon success" />;
    
    case 'error':
      return <RiErrorWarningLine className="notification-icon error" />;
    
    default:
      return <RiInformationLine className="notification-icon info" />;
  }
};

// Formater le numéro de commande (enlever les IDs MongoDB longs)
const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return null;
  
  const str = String(orderNumber);
  
  // Si c'est un ID MongoDB (24 caractères hex), ne pas l'afficher
  if (/^[a-f0-9]{24}$/i.test(str)) {
    return null;
  }
  
  // Si c'est trop long (plus de 10 caractères), tronquer
  if (str.length > 10) {
    return str.slice(-6).toUpperCase();
  }
  
  return str;
};

// Composant de notification personnalisé
const OrderNotification = ({ order, message, type = 'info', closeToast }) => {
  const formattedOrderNumber = formatOrderNumber(order?.orderNumber);
  const hasOrderInfo = formattedOrderNumber || order?.restaurant;
  
  return (
    <div className={`order-notification ${type}`}>
      <div className="notification-content">
        <div className="notification-icon-wrapper">
          {getStatusIcon(order?.status || type)}
        </div>
        
        <div className="notification-body">
          {hasOrderInfo && (
            <div className="notification-header">
              {formattedOrderNumber && (
                <p className="notification-title">
                  Commande #{formattedOrderNumber}
                </p>
              )}
              {order?.restaurant && (
                <p className="notification-restaurant">{order.restaurant}</p>
              )}
            </div>
          )}
          
          <p className="notification-message">{message}</p>
          
          {order?.items && Array.isArray(order.items) && order.items.length > 0 && (
            <div className="notification-items">
              <span className="notification-items-count">
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
              {order?.total > 0 && (
                <span className="notification-total">
                  {Number(order.total).toLocaleString('fr-FR')} FCFA
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={closeToast}
        className="notification-close"
        aria-label="Fermer"
      >
        <RiCloseLine />
      </button>
    </div>
  );
};

// Fonctions helper pour afficher les notifications
export const showOrderNotification = {
  // Nouvelle commande
  newOrder: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'new' }}
          message=" Nouvelle commande reçue !"
          type="new"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 30000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast custom-toast-new',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-new',
      }
    );
  },

  // Commande confirmée
  confirmed: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'confirmed' }}
          message=" Commande confirmée"
          type="confirmed"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 30000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-confirmed',
      }
    );
  },

  // Commande en préparation
  preparing: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'preparing' }}
          message=" Commande en préparation"
          type="preparing"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-preparing',
      }
    );
  },

  // Commande prête
  ready: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'ready' }}
          message=" Commande prête !"
          type="ready"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-ready',
      }
    );
  },

  // Commande livrée
  delivered: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'delivered' }}
          message=" Commande livrée"
          type="delivered"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-delivered',
      }
    );
  },

  // Commande annulée
  cancelled: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ ...order, status: 'cancelled' }}
          message=" Commande annulée"
          type="cancelled"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-cancelled',
      }
    );
  },

  // Notification générique de succès
  success: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ status: 'success' }}
          message={message}
          type="success"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-success',
      }
    );
  },

  // Notification d'erreur
  error: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ status: 'error' }}
          message={message}
          type="error"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-error',
      }
    );
  },

  // Notification d'information
  info: (message) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={{ status: 'info' }}
          message={message}
          type="info"
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-info',
      }
    );
  },
};

export default OrderNotification;