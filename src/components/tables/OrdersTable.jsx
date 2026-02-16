// components/tables/OrdersTable.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxLine,
  RiCheckboxBlankLine
} from 'react-icons/ri';
import OrdersTableRow from '../orders/OrdersTableRow';
import './css/OrdersTable.css';

const OrdersTable = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onViewDetails,
  onUpdateStatus,
  isRestaurantMode = false
}) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const getColumns = () => {
    const baseColumns = [
      { key: 'id', label: t('orders.table.orderId'), sortable: true },
      { key: 'customer', label: t('orders.table.customer'), sortable: true }
    ];

    if (!isRestaurantMode) {
      baseColumns.push({
        key: 'restaurant',
        label: t('orders.table.restaurant'),
        sortable: true
      });
    }

    const commonColumns = [
      { key: 'items_count', label: t('orders.table.items'), sortable: true },
      { key: 'total_amount', label: t('orders.table.amount'), sortable: true },
      { key: 'status', label: t('orders.table.orderStatus'), sortable: true },
      { key: 'payment_status', label: t('orders.table.paymentStatus'), sortable: true },
      { key: 'payment_method', label: t('orders.table.paymentMethod'), sortable: false },
      { key: 'source', label: t('orders.table.source'), sortable: true },
      { key: 'created_at', label: t('orders.table.date'), sortable: true },
      { key: 'actions', label: t('orders.table.actions'), sortable: false }
    ];

    return [...baseColumns, ...commonColumns];
  };

  const columns = getColumns();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortValue = (o, key) => {
    if (!o) return '';

    if (key === 'created_at') return new Date(o.created_at || o.createdAt || 0).getTime();
    if (key === 'total_amount') return Number(o.total_amount ?? o.totalAmount ?? o.total ?? 0);

    if (key === 'customer')
      return String(o.customer?.name || o.customerName || o.customer_name || '').toLowerCase();

    if (key === 'restaurant')
      return String(o.restaurant?.name || o.restaurantName || o.restaurantId || o.raw?.restaurent || '').toLowerCase();

    if (key === 'items_count') {
      const v = o.itemsCount ?? o.items_count;
      if (v != null) return Number(v) || 0;
      if (Array.isArray(o.items)) return o.items.reduce((acc, it) => acc + (Number(it?.quantite) || 0), 0);
      return 0;
    }

    return String(o[key] ?? '').toLowerCase();
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const isSomeSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length;

  return (
    <div className="orders-table-wrapper">
      <table className={`orders-table ${isRestaurantMode ? 'restaurant-mode' : 'admin-mode'}`}>
        <thead>
          <tr>
            <th className="orders-table-checkbox">
              <button className="orders-checkbox-btn" onClick={onSelectAll} type="button">
                {isAllSelected ? (
                  <RiCheckboxLine className="checked" />
                ) : isSomeSelected ? (
                  <RiCheckboxLine className="indeterminate" />
                ) : (
                  <RiCheckboxBlankLine />
                )}
              </button>
            </th>

            {columns.map(column => (
              <th
                key={column.key}
                className={`orders-table-th ${column.sortable ? 'sortable' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="orders-table-th-content">
                  <span>{column.label}</span>
                  {column.sortable && sortConfig.key === column.key && (
                    sortConfig.direction === 'asc'
                      ? <RiArrowUpLine className="sort-icon" />
                      : <RiArrowDownLine className="sort-icon" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedOrders.map(order => (
            <OrdersTableRow
              key={order.id}
              order={order}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={onSelectOrder}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
              isRestaurantMode={isRestaurantMode}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
