import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiEyeLine,
  RiMoreLine,
  RiEditLine,
  RiPrinterLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentMethodBadge from './PaymentMethodBadge';
import SourceBadge from './SourceBadge';
import './css/OrdersTableRow.css';

const OrdersTableRow = ({ 
  order, 
  isSelected, 
  onSelect, 
  onViewDetails,
  onUpdateStatus 
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formater le montant
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <tr className={`orders-table-row ${isSelected ? 'selected' : ''}`}>
      {/* Checkbox */}
      <td className="orders-table-checkbox">
        <button 
          className="orders-checkbox-btn"
          onClick={() => onSelect(order.id)}
        >
          {isSelected ? (
            <RiCheckboxLine className="checked" />
          ) : (
            <RiCheckboxBlankLine />
          )}
        </button>
      </td>

      {/* N° Commande */}
      <td className="orders-table-id">
        <span className="order-id">{order.order_number || `ORD-${order.id}`}</span>
      </td>

      {/* Client */}
      <td className="orders-table-customer">
        <div className="customer-info">
          <span className="customer-name">{order.customer?.name || '-'}</span>
          <span className="customer-phone">{order.customer?.phone || ''}</span>
        </div>
      </td>

      {/* Restaurant */}
      <td className="orders-table-restaurant">
        <span>{order.restaurant?.name || '-'}</span>
      </td>

      {/* Montant */}
      <td className="orders-table-amount">
        <span className="amount">{formatCurrency(order.total_amount)}</span>
      </td>

      {/* Statut commande */}
      <td className="orders-table-status">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Statut paiement */}
      <td className="orders-table-payment-status">
        <PaymentStatusBadge status={order.payment_status} />
      </td>

      {/* Méthode paiement */}
      <td className="orders-table-payment-method">
        <PaymentMethodBadge method={order.payment_method} />
      </td>

      {/* Source */}
      <td className="orders-table-source">
        <SourceBadge source={order.source} />
      </td>

      {/* Date */}
      <td className="orders-table-date">
        <span>{formatDate(order.created_at)}</span>
      </td>

      {/* Actions */}
      <td className="orders-table-actions">
        <div className="actions-wrapper">
          <button 
            className="action-btn action-btn-view"
            onClick={() => onViewDetails(order)}
            title={t('common.view')}
          >
            <RiEyeLine />
          </button>

          <div className="actions-dropdown-wrapper">
            <button 
              className="action-btn action-btn-more"
              onClick={() => setShowActions(!showActions)}
            >
              <RiMoreLine />
            </button>

            {showActions && (
              <div className="actions-dropdown">
                <button onClick={() => onViewDetails(order)}>
                  <RiEyeLine />
                  <span>{t('common.view')}</span>
                </button>
                <button>
                  <RiEditLine />
                  <span>{t('common.edit')}</span>
                </button>
                <button>
                  <RiPrinterLine />
                  <span>{t('orders.details.print')}</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="danger">
                  <RiDeleteBinLine />
                  <span>{t('common.delete')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default OrdersTableRow;