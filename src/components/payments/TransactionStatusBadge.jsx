// src/components/payments/TransactionStatusBadge.jsx
import React from 'react';
import './css/PaymentBadges.css';

const TransactionStatusBadge = ({ status, label }) => {
  return (
    <span className={`status-badge ${status}`}>
      {label}
    </span>
  );
};

export default TransactionStatusBadge;