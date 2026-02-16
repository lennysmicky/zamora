import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowRightSLine } from "react-icons/ri";
import "./RecentOrdersTable.css";

const RecentOrdersTable = ({ data, isLoading = false }) => {
  const { t } = useTranslation();

  const getStatusClass = (status) => {
    const statusClasses = {
      delivered: "status-delivered",
      preparing: "status-preparing",
      pending: "status-pending",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "";
  };

  const getStatusLabel = (status) => t(`status.${status}`);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatItems = (count) => {
    const n = Number(count) || 0;
    if (n === 0) return `0 ${t("orders.item")}`;
    if (n === 1) return `1 ${t("orders.item")}`;
    return `${n} ${t("orders.itemPlural")}`;
  };

  // Normalisation: accepte plusieurs formats backend
  const orders = useMemo(() => {
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

    const normalizeStatus = (s) => {
      const v = String(s ?? "").toLowerCase();
      // normaliser quelques variantes fréquentes
      if (["livree", "livré", "delivered"].includes(v)) return "delivered";
      if (["preparation", "preparing"].includes(v)) return "preparing";
      if (["en_attente", "attente", "pending"].includes(v)) return "pending";
      if (["annulee", "annulé", "cancelled", "canceled"].includes(v)) return "cancelled";
      return v || "pending";
;
    };

    const pickCustomer = (o) =>
      o?.customer ??
      o?.client ??
      o?.customerName ??
      o?.clientName ??
      o?.userName ??
      o?.user?.name ??
      o?.utilisateur?.nom ??
      o?.nomClient ??
      "—";

    const pickItemsCount = (o) =>
      o?.itemsCount ??
      o?.items ??
      o?.nbrItems ??
      o?.nbItems ??
      o?.quantite ??
      (Array.isArray(o?.orderItems) ? o.orderItems.length : undefined) ??
      (Array.isArray(o?.items) ? o.items.length : undefined) ??
      0;

    const pickTotal = (o) =>
      o?.total ??
      o?.amount ??
      o?.montant ??
      o?.priceTotal ??
      o?.totalPrice ??
      o?.somme ??
      o?.revenue ??
      0;

    const pickId = (o) =>
      o?.id ??
      o?._id ??
      o?.orderId ??
      o?.commandeId ??
      o?.numero ??
      o?.reference ??
      o?.ref ??
      null;

    return list
      .map((o, idx) => {
        const id = pickId(o) ?? `row-${idx}`;
        const customer = pickCustomer(o);
        const items = pickItemsCount(o);
        const total = pickTotal(o);
        const status = normalizeStatus(o?.status ?? o?.etat ?? o?.state);

        return {
          id,
          customer,
          items: Number(items) || 0,
          total: Number(total) || 0,
          status,
          raw: o,
        };
      })
      .filter((o) => o.id != null);
  }, [data]);

  // ================================
  // ÉTAT 1 : LOADING
  // ================================
  if (isLoading) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t("dashboard.recentOrders")}</h3>
          <button className="recent-orders-link" type="button">
            {t("dashboard.viewAll")}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="recent-orders-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell cell-id"></div>
              <div className="skeleton-cell cell-customer"></div>
              <div className="skeleton-cell cell-items"></div>
              <div className="skeleton-cell cell-total"></div>
              <div className="skeleton-cell cell-status"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 2 : EMPTY
  // ================================
  if (!orders.length) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t("dashboard.recentOrders")}</h3>
          <button className="recent-orders-link" type="button">
            {t("dashboard.viewAll")}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="recent-orders-empty">
          <p>{t("dashboard.noOrders")}</p>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA
  // ================================
  return (
    <div className="recent-orders-card">
      <div className="recent-orders-header">
        <h3>{t("dashboard.recentOrders")}</h3>
        <button className="recent-orders-link" type="button">
          {t("dashboard.viewAll")}
          <RiArrowRightSLine />
        </button>
      </div>

      <div className="recent-orders-table-wrapper">
        <table className="recent-orders-table">
          <thead>
            <tr>
              <th>{t("orders.orderId")}</th>
              <th>{t("orders.customer")}</th>
              <th>{t("orders.items")}</th>
              <th>{t("orders.total")}</th>
              <th>{t("orders.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td className="order-customer">{order.customer}</td>
                <td className="order-items">{formatItems(order.items)}</td>
                <td className="order-total">{formatCurrency(order.total)}</td>
                <td>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
