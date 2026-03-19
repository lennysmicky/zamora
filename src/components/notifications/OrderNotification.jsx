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
  RiAlertLine
} from 'react-icons/ri';
import './OrderNotification.css';

// Icônes selon le statut de la commande
const getStatusIcon = (status) => {
  const statusLower = String(status || '').toLowerCase();
  
  switch (statusLower) {
    case 'pending':
    case 'en_attente':
      return <RiTimeLine className="notification-icon pending" />;
    
    case 'confirmed':
    case 'confirmee':
      return <RiCheckLine className="notification-icon confirmed" />;
    
    case 'preparing':
    case 'en_preparation':
      return <RiShoppingBag2Line className="notification-icon preparing" />;
    
    case 'ready':
    case 'prete':
      return <RiCheckboxCircleLine className="notification-icon ready" />; //  Corrigé
    
    case 'delivered':
    case 'livree':
      return <RiTruckLine className="notification-icon delivered" />;
    
    case 'cancelled':
    case 'annulee':
      return <RiErrorWarningLine className="notification-icon cancelled" />;
    
    default:
      return <RiInformationLine className="notification-icon info" />;
  }
};

// Composant de notification personnalisé
const OrderNotification = ({ order, message, type = 'info', closeToast }) => {
  return (
    <div className={`order-notification ${type}`}>
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
          
          {order?.items && Array.isArray(order.items) && (
            <div className="notification-items">
              <span className="notification-items-count">
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
              {order.total && (
                <span className="notification-total">
                  {typeof order.total === 'number' ? order.total.toFixed(2) : order.total} FCFA
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
          order={order}
          message="Nouvelle commande reçue"
          type="new"
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
        progressClassName: 'custom-toast-progress-new',
      }
    );
  },

  // Commande confirmée
  confirmed: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Commande confirmée par le restaurant"
          type="confirmed"
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
        progressClassName: 'custom-toast-progress-confirmed',
      }
    );
  },

  // Commande en préparation
  preparing: (order) => {
    toast(
      ({ closeToast }) => (
        <OrderNotification
          order={order}
          message="Votre commande est en préparation"
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
          order={order}
          message="Votre commande est prête !"
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
          order={order}
          message="Commande livrée avec succès"
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
          order={order}
          message="Commande annulée"
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