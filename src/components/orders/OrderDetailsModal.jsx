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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
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

  const handlePrint = () => window.print();

  // ✅ Fallbacks robustes (si un jour tu ouvres ce modal depuis un autre endpoint)
  const customer =
    order.customer ??
    {
      name: order.customer_name ?? order.customerName ?? '',
      phone: order.customer_phone ?? order.customerPhone ?? '',
    };

  const items = Array.isArray(order.items) ? order.items : [];
  const history = Array.isArray(order.history) ? order.history : [];

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h2>{t('orders.details.title')}</h2>
          <button className="order-modal-close" onClick={onClose} type="button">
            <RiCloseLine />
          </button>
        </div>

        <div className="order-modal-content">
          <OrderDetailsHeader order={order} />

          <OrderDetailsCustomer customer={customer} />

          <OrderDetailsItems items={items} order={order} />

          {/* Changer le statut (guard si handler absent) */}
          {typeof onUpdateStatus === 'function' && (
            <div className="order-details-section">
              <h3>{t('orders.details.statusUpdate')}</h3>
              <OrderStatusSelect
                currentStatus={order.status}
                onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)}
              />
            </div>
          )}

          <OrderDetailsPayment order={order} />

          <OrderDetailsHistory history={history} />
        </div>

        <div className="order-modal-footer">
          <button className="order-modal-btn secondary" onClick={handlePrint} type="button">
            <RiPrinterLine />
            <span>{t('orders.details.print')}</span>
          </button>
          <button className="order-modal-btn primary" onClick={onClose} type="button">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
