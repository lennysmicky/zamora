import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';
import './css/OrderStatusSelect.css';

const OrderStatusSelect = ({ currentStatus, onStatusChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'PENDING', label: t('orders.status.pending'), color: 'warning' },
    { value: 'IN_PREPARATION', label: t('orders.status.inPreparation'), color: 'info' },
    { value: 'OUT_FOR_DELIVERY', label: t('orders.status.outForDelivery'), color: 'purple' },
    { value: 'DELIVERED', label: t('orders.status.delivered'), color: 'success' },
    { value: 'CANCELLED', label: t('orders.status.cancelled'), color: 'error' }
  ];

  const currentOption = statusOptions.find(opt => opt.value === currentStatus);

  const handleSelect = async (value) => {
    if (value === currentStatus) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(value);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="status-select-wrapper">
      <button 
        className={`status-select-trigger status-${currentOption?.color}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <span>{currentOption?.label}</span>
        <RiArrowDownSLine className={`select-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="status-select-dropdown">
          {statusOptions.map(option => (
            <button
              key={option.value}
              className={`status-select-option ${option.value === currentStatus ? 'active' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className={`status-dot status-${option.color}`}></span>
              <span>{option.label}</span>
              {option.value === currentStatus && <RiCheckLine className="check-icon" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusSelect;