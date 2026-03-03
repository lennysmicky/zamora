// OrdersTableRow.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiEyeLine,
  RiMoreLine,
  RiEditLine,
  RiPrinterLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import SourceBadge from "./SourceBadge";
import "./css/OrdersTableRow.css";

const getOrderId = (o) => String(o?.id ?? o?._id ?? "");

const OrdersTableRow = ({
  order,
  isSelected,
  onSelect,        //  callback sans param
  onViewDetails,
  onUpdateStatus,
  onDelete,        //  AJOUT
  onPrint,         //  AJOUT
  isRestaurantMode = false,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowActions(false);
    };
    if (showActions) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showActions]);

  const orderId = getOrderId(order);
  const createdAt = order?.createdAt || order?.created_at || order?.raw?.createdAt;

  const orderNumber = order?.orderNumber || order?.order_number || (orderId ? `ORD-${orderId}` : "-");

  const customerName = order?.customer?.name || order?.customerName || order?.customer_name || "-";
  const customerPhone = order?.customer?.phone || order?.customerPhone || order?.customer_phone || "";

  const restaurantName =
    order?.restaurant?.name || order?.restaurantName || order?.restaurantId || order?.raw?.restaurent || "-";

  const itemsCount =
    order?.itemsCount ??
    order?.items_count ??
    (Array.isArray(order?.items)
      ? order.items.reduce((acc, it) => acc + (Number(it?.quantite) || 0), 0)
      : 0);

  const amount = order?.totalAmount ?? order?.total_amount ?? order?.total ?? 0;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  const handlePrint = () => {
    setShowActions(false);
    if (typeof onPrint === "function") onPrint(order);
    else window.print();
  };

  const handleDelete = () => {
    setShowActions(false);
    if (!onDelete) return;
    if (!orderId) return;

    const ok = window.confirm(t("orders.deleteConfirm", "Supprimer cette commande ?"));
    if (!ok) return;

    onDelete(order);
  };

  return (
    <tr className={`orders-table-row ${isSelected ? "selected" : ""}`}>
      <td className="orders-table-checkbox">
        <button className="orders-checkbox-btn" onClick={onSelect} type="button">
          {isSelected ? <RiCheckboxLine className="checked" /> : <RiCheckboxBlankLine />}
        </button>
      </td>

      <td className="orders-table-id">
        <span className="order-id">{orderNumber}</span>
      </td>

      <td className="orders-table-customer">
        <div className="customer-info">
          <span className="customer-name">{customerName}</span>
          <span className="customer-phone">{customerPhone}</span>
        </div>
      </td>

      {!isRestaurantMode && (
        <td className="orders-table-restaurant">
          <span>{restaurantName}</span>
        </td>
      )}

      <td className="orders-table-items">
        <span>{itemsCount}</span>
      </td>

      <td className="orders-table-amount">
        <span className="amount">{formatCurrency(amount)}</span>
      </td>

      <td className="orders-table-status">
        <OrderStatusBadge status={order.status} />
      </td>

      <td className="orders-table-payment-status">
        <PaymentStatusBadge status={order.payment_status} />
      </td>

      <td className="orders-table-payment-method">
        <PaymentMethodBadge method={order.payment_method} />
      </td>

      <td className="orders-table-source">
        <SourceBadge source={order.source} />
      </td>

      <td className="orders-table-date">
        <span>{formatDate(createdAt)}</span>
      </td>

      <td className="orders-table-actions">
        <div className="actions-wrapper" ref={dropdownRef}>
          <button
            className="action-btn action-btn-view"
            onClick={() => onViewDetails?.(order)}
            title={t("common.view")}
            type="button"
          >
            <RiEyeLine />
          </button>

          <div className="actions-dropdown-wrapper">
            <button className="action-btn action-btn-more" onClick={() => setShowActions((v) => !v)} type="button">
              <RiMoreLine />
            </button>

            {showActions && (
              <div className="actions-dropdown">
                <button onClick={() => (setShowActions(false), onViewDetails?.(order))} type="button">
                  <RiEyeLine />
                  <span>{t("common.view")}</span>
                </button>

                <button onClick={() => (setShowActions(false), onViewDetails?.(order))} type="button">
                  <RiEditLine />
                  <span>{t("common.edit")}</span>
                </button>

                <button onClick={handlePrint} type="button">
                  <RiPrinterLine />
                  <span>{t("orders.details.print")}</span>
                </button>

                <div className="dropdown-divider"></div>

                <button className="danger" type="button" onClick={handleDelete} disabled={!onDelete}>
                  <RiDeleteBinLine />
                  <span>{t("common.delete")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default OrdersTableRow;