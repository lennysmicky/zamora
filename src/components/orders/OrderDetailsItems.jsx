// src/components/orders/OrderDetailsItems.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiRestaurantLine } from 'react-icons/ri';
import './css/OrderDetailsModal.css';

const toNumber = (value) => {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const OrderDetailsItems = ({ items, order }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(toNumber(amount));
  };

  const safeItems = Array.isArray(items) ? items : [];

  const normalizedItems = safeItems.map((item, index) => {
    const quantity = toNumber(
      item?.quantity ??
      item?.quantite ??
      item?.qty ??
      item?.qte ??
      item?.count
    );

    const unitPrice = toNumber(
      item?.unit_price ??
      item?.unitPrice ??
      item?.prix_unitaire ??
      item?.prix ??
      item?.price ??
      item?.meal?.price ??
      item?.meal?.prix ??
      item?.repas?.price ??
      item?.repas?.prix
    );

    const totalPrice = toNumber(
      item?.total_price ??
      item?.totalPrice ??
      item?.prix_total ??
      item?.montant ??
      (quantity * unitPrice)
    );

    const itemName =
      item?.meal_name_snapshot ||
      item?.meal?.name ||
      item?.meal?.nom ||
      item?.repas?.name ||
      item?.repas?.nom ||
      item?.name ||
      item?.nom ||
      item?.title ||
      item?.libelle ||
      '-';

    return {
      id: item?.id || item?._id || index,
      name: itemName,
      quantity,
      unitPrice,
      totalPrice
    };
  });

  const subtotal =
    normalizedItems.reduce((acc, item) => acc + toNumber(item.totalPrice), 0) || 0;

  const deliveryFee = toNumber(
    order?.delivery_fee ??
    order?.deliveryFee ??
    order?.frais_livraison ??
    0
  );

  const total = toNumber(
    order?.total_amount ??
    order?.totalAmount ??
    order?.total ??
    order?.montant_total ??
    subtotal + deliveryFee
  );

  return (
    <div className="order-details-section">
      <h3>
        <RiRestaurantLine />
        {t('orders.details.items')}
      </h3>

      {!normalizedItems || normalizedItems.length === 0 ? (
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
              {normalizedItems.map((item) => (
                <tr key={item.id}>
                  <td className="item-name">{item.name}</td>
                  <td className="item-qty">{item.quantity}</td>
                  <td className="item-price">{formatCurrency(item.unitPrice)}</td>
                  <td className="item-total">{formatCurrency(item.totalPrice)}</td>
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