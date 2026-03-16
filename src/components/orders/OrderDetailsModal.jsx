// src/components/orders/OrderDetailsModal.jsx
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine, RiPrinterLine, RiDeleteBinLine } from "react-icons/ri";
import OrderDetailsHeader from "./OrderDetailsHeader";
import OrderDetailsCustomer from "./OrderDetailsCustomer";
import OrderDetailsItems from "./OrderDetailsItems";
import OrderDetailsPayment from "./OrderDetailsPayment";
import OrderDetailsHistory from "./OrderDetailsHistory";
import OrderStatusSelect from "./OrderStatusSelect";
import PaymentStatusSelect from "./PaymentStatusSelect";
import "./css/OrderDetailsModal.css";

const OrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDelete,
  onPrint,
  busy = false,
  errorMessage = "",
}) => {
  const { t } = useTranslation();

  const orderId = useMemo(() => order?.id ?? order?._id ?? null, [order]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () =>
    typeof onPrint === "function" ? onPrint(order) : window.print();

  const handleDelete = () => {
    if (!onDelete || !orderId) return;
    if (!window.confirm(t("orders.deleteConfirm", "Supprimer cette commande ?"))) return;
    onDelete(order);
  };

  const customer =
    order.customer ?? {
      name: order.customer_name ?? order.customerName ?? "",
      phone: order.customer_phone ?? order.customerPhone ?? "",
    };

  const items = Array.isArray(order.items) ? order.items : [];
  const history = Array.isArray(order.history) ? order.history : [];

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h2>{t("orders.details.title", "Détails commande")}</h2>
          <button className="order-modal-close" onClick={onClose} type="button">
            <RiCloseLine />
          </button>
        </div>

        <div className="order-modal-content">
          {!!errorMessage && (
            <div className="order-details-error">{errorMessage}</div>
          )}

          <OrderDetailsHeader order={order} />
          <OrderDetailsCustomer customer={customer} />
          <OrderDetailsItems items={items} order={order} />

          {typeof onUpdateStatus === "function" && orderId && (
            <div className="order-details-section">
              <h3>{t("orders.details.statusUpdate", "Statut")}</h3>
              <OrderStatusSelect
                currentStatus={order.status}
                onStatusChange={(newStatus) => onUpdateStatus(orderId, newStatus)}
                disabled={busy}
              />
            </div>
          )}

          {typeof onUpdatePaymentStatus === "function" && orderId && (
            <div className="order-details-section">
              <h3>{t("orders.details.payment", "Paiement")}</h3>
              <PaymentStatusSelect
                currentStatus={order.payment_status}
                onStatusChange={(newStatus) =>
                  onUpdatePaymentStatus(orderId, newStatus)
                }
                disabled={busy}
              />
            </div>
          )}

          <OrderDetailsPayment order={order} />
          <OrderDetailsHistory history={history} />
        </div>

        <div className="order-modal-footer">
          <button
            className="order-modal-btn secondary"
            onClick={handlePrint}
            type="button"
            disabled={busy}
          >
            <RiPrinterLine />
            <span>{t("orders.details.print", "Imprimer")}</span>
          </button>

          {onDelete && (
            <button
              className="order-modal-btn danger"
              onClick={handleDelete}
              type="button"
              disabled={busy}
            >
              <RiDeleteBinLine />
              <span>{t("common.delete", "Supprimer")}</span>
            </button>
          )}

          <button className="order-modal-btn primary" onClick={onClose} type="button">
            {t("common.close", "Fermer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;