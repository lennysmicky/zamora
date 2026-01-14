import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiRestaurantLine } from 'react-icons/ri';
import './css/OrderDetailsModal.css';

const OrderDetailsItems = ({ items, order }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculer le sous-total
  const subtotal = items?.reduce((acc, item) => acc + item.total_price, 0) || 0;
  const deliveryFee = order.delivery_fee || 0;
  const total = order.total_amount || subtotal + deliveryFee;

  return (
    <div className="order-details-section">
      <h3>
        <RiRestaurantLine />
        {t('orders.details.items')}
      </h3>

      {!items || items.length === 0 ? (
        <p className="no-data">{t('common.noData')}</p>
      ) : (
        <>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>{t('orders.details.item')}</th>
                <th>{t('orders.details.qty')}</th>
                <th>{t('orders.details.unitPrice')}</th>
                <th>{t('orders.details.itemTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="item-name">
                    {item.meal_name_snapshot || item.meal?.name || '-'}
                  </td>
                  <td className="item-qty">{item.quantity}</td>
                  <td className="item-price">{formatCurrency(item.unit_price)}</td>
                  <td className="item-total">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="order-totals">
            <div className="order-total-row">
              <span>{t('orders.details.subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="order-total-row">
                <span>{t('orders.details.delivery')}</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="order-total-row total">
              <span>{t('orders.details.total')}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsItems;