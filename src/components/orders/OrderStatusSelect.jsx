// src/components/orders/OrderStatusSelect.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import "./css/OrderStatusSelect.css";

const OrderStatusSelect = ({
  currentStatus = "PENDING",
  onStatusChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "PENDING", label: t("orders.status.pending"), color: "warning" },
    { value: "IN_PREPARATION", label: t("orders.status.inPreparation"), color: "info" },
    { value: "OUT_FOR_DELIVERY", label: t("orders.status.outForDelivery"), color: "purple" },
    { value: "DELIVERED", label: t("orders.status.delivered"), color: "success" },
    { value: "CANCELLED", label: t("orders.status.cancelled"), color: "error" },
  ];

  const currentOption =
    statusOptions.find((opt) => opt.value === currentStatus) || statusOptions[0];

  const handleSelect = async (value) => {
    if (disabled || loading) return;

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
        onClick={() => !disabled && !loading && setIsOpen((prev) => !prev)}
        disabled={disabled || loading}
        type="button"
      >
        <span>{currentOption?.label}</span>
        <RiArrowDownSLine className={`select-arrow ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="status-select-dropdown">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`status-select-option ${
                option.value === currentStatus ? "active" : ""
              }`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              <span className={`status-dot status-${option.color}`}></span>
              <span>{option.label}</span>
              {option.value === currentStatus && (
                <RiCheckLine className="check-icon" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusSelect;