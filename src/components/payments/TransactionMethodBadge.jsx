// src/components/payments/TransactionMethodBadge.jsx
import React from 'react';
import { RiWallet3Line, RiSmartphoneLine } from 'react-icons/ri';
import './css/PaymentBadges.css';

const TransactionMethodBadge = ({ method, label }) => {
  return (
    <span className={`method-badge ${method}`}>
      {method === 'cash' ? <RiWallet3Line /> : <RiSmartphoneLine />}
      {label}
    </span>
  );
};

export default TransactionMethodBadge;