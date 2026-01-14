import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiCloseLine, RiPrinterLine } from 'react-icons/ri';
import OrderDetailsHeader from './OrderDetailsHeader';
import OrderDetailsCustomer from './OrderDetailsCustomer';
import OrderDetailsItems from './OrderDetailsItems';
import OrderDetailsPayment from './OrderDetailsPayment';
import OrderDetailsHistory from './OrderDetailsHistory';
import OrderStatusSelect from './OrderStatusSelect';
import './css/OrderDetailsModal.css';

const OrderDetailsModal = ({ order, isOpen, onClose, onUpdateStatus }) => {
  const { t } = useTranslation();

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header du modal */}
        <div className="order-modal-header">
          <h2>{t('orders.details.title')}</h2>
          <button className="order-modal-close" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        {/* Contenu */}
        <div className="order-modal-content">
          {/* En-tête commande */}
          <OrderDetailsHeader order={order} />

          {/* Infos client */}
          <OrderDetailsCustomer customer={order.customer} />

          {/* Articles commandés */}
          <OrderDetailsItems items={order.items} order={order} />

          {/* Changer le statut */}
          <div className="order-details-section">
            <h3>{t('orders.details.statusUpdate')}</h3>
            <OrderStatusSelect 
              currentStatus={order.status}
              onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)}
            />
          </div>

          {/* Paiement */}
          <OrderDetailsPayment order={order} />

          {/* Historique */}
          <OrderDetailsHistory history={order.history} />
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <button className="order-modal-btn secondary" onClick={handlePrint}>
            <RiPrinterLine />
            <span>{t('orders.details.print')}</span>
          </button>
          <button className="order-modal-btn primary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;