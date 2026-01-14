import React from 'react';
import './css/OrdersLoadingSkeleton.css';

const OrdersLoadingSkeleton = () => {
  return (
    <div className="orders-skeleton">
      {/* En-tête tableau */}
      <div className="orders-skeleton-header">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="skeleton-th"></div>
        ))}
      </div>

      {/* Lignes */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="orders-skeleton-row">
          <div className="skeleton-checkbox"></div>
          <div className="skeleton-cell skeleton-id"></div>
          <div className="skeleton-cell skeleton-customer"></div>
          <div className="skeleton-cell skeleton-restaurant"></div>
          <div className="skeleton-cell skeleton-amount"></div>
          <div className="skeleton-cell skeleton-badge"></div>
          <div className="skeleton-cell skeleton-badge"></div>
          <div className="skeleton-cell skeleton-method"></div>
          <div className="skeleton-cell skeleton-date"></div>
          <div className="skeleton-cell skeleton-actions"></div>
        </div>
      ))}
    </div>
  );
};

export default OrdersLoadingSkeleton;