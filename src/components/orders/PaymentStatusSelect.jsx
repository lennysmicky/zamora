// src/components/orders/PaymentStatusSelect.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import "./css/OrderStatusSelect.css";

const PaymentStatusSelect = ({ currentStatus = "PENDING", onStatusChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "PENDING", label: t("orders.paymentStatus.pending"), color: "warning" },
    { value: "PAID", label: t("orders.paymentStatus.paid"), color: "success" },
    { value: "FAILED", label: t("orders.paymentStatus.failed"), color: "error" },
  ];

  const currentOption =
    statusOptions.find((opt) => opt.value === currentStatus) || statusOptions[0];

  const handleSelect = async (value) => {
    if (value === currentStatus) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onStatusChange?.(value);
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
        type="button"
      >
        <span>{currentOption?.label}</span>
        <RiArrowDownSLine className={`select-arrow ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="status-select-dropdown">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`status-select-option ${option.value === currentStatus ? "active" : ""}`}
              onClick={() => handleSelect(option.value)}
              type="button"
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

export default PaymentStatusSelect;
