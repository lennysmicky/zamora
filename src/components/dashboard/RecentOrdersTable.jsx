import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowRightSLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { buildOrdersQuery } from "../../utils/ordersQuery";
import "./RecentOrdersTable.css";

const RecentOrdersTable = ({ data = [], isLoading = false, linkFilters = {} }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { userType } = useAuthStore();
  const isRestaurantMode = userType === "restaurant";

  const handleViewAll = () => {
    const path = isRestaurantMode ? "/restaurant/orders" : "/orders";
    navigate(`${path}${buildOrdersQuery(linkFilters)}`);
  };

  const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();

    if (["livres", "livree", "livré", "livrée", "delivered"].includes(v)) {
      return "delivered";
    }
    if (["in_preparation", "en_preparation", "preparing", "préparation", "preparation"].includes(v)) {
      return "preparing";
    }
    if (["out_for_delivery", "en_livraison", "delivery"].includes(v)) {
      return "out_for_delivery";
    }
    if (["en_attente", "attente", "pending"].includes(v)) {
      return "pending";
    }
    if (["annules", "annulee", "annulé", "annulée", "cancelled", "canceled"].includes(v)) {
      return "cancelled";
    }

    return v || "pending";
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      delivered: "status-delivered",
      preparing: "status-preparing",
      pending: "status-pending",
      cancelled: "status-cancelled",
      out_for_delivery: "status-preparing",
    };
    return statusClasses[status] || "status-pending";
  };

  const getStatusLabel = (status) => {
    const map = {
      delivered: t("orders.status.delivered"),
      preparing: t("orders.status.inPreparation"),
      out_for_delivery: t("orders.status.outForDelivery"),
      pending: t("orders.status.pending"),
      cancelled: t("orders.status.cancelled"),
    };
    return map[status] || String(status ?? "");
  };

  const formatCurrency = (value) => {
    const n = Number(value);
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);
  };

  const formatItems = (count) => {
    const n = Number(count) || 0;
    if (n <= 1) return `${n} ${t("orders.item")}`;
    return `${n} ${t("orders.itemPlural")}`;
  };

  const orders = useMemo(() => {
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

    const pickCustomer = (o) => {
      const direct =
        o?.customer_name ??
        o?.customerName ??
        o?.client_name ??
        o?.clientName ??
        o?.nomClient ??
        o?.nom_client ??
        o?.userName ??
        o?.username;

      if (direct) return String(direct);

      const c = o?.customer ?? o?.client ?? o?.user ?? o?.utilisateur;

      if (typeof c === "string") return c;
      if (c && typeof c === "object") {
        return c.name ?? c.nom ?? c.fullName ?? c.username ?? "—";
      }

      return "—";
    };

    const pickItemsCount = (o) => {
      const direct =
        o?.itemsCount ??
        o?.items_count ??
        o?.nbrItems ??
        o?.nbItems ??
        o?.nombreItems ??
        o?.quantite ??
        o?.quantity;

      if (direct != null && direct !== "") {
        return Number(direct) || 0;
      }

      // Cas backend actuel: items est directement un nombre
      if (typeof o?.items === "number" || typeof o?.items === "string") {
        return Number(o.items) || 0;
      }

      // Cas classique: items est un tableau
      if (Array.isArray(o?.items)) {
        const sumQty = o.items.reduce(
          (acc, it) =>
            acc +
            (Number(
              it?.quantite ?? it?.quantity ?? it?.qty ?? it?.qte ?? it?.count ?? 0
            ) || 0),
          0
        );
        return sumQty || o.items.length;
      }

      if (Array.isArray(o?.orderItems)) {
        const sumQty = o.orderItems.reduce(
          (acc, it) =>
            acc +
            (Number(
              it?.quantite ?? it?.quantity ?? it?.qty ?? it?.qte ?? it?.count ?? 0
            ) || 0),
          0
        );
        return sumQty || o.orderItems.length;
      }

      return 0;
    };

    const pickTotal = (o) => {
      const v =
        o?.total ??
        o?.total_amount ??
        o?.amount ??
        o?.montant ??
        o?.priceTotal ??
        o?.totalPrice ??
        o?.somme ??
        o?.revenue;

      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const pickId = (o) =>
      o?.order_number ??
      o?.orderNumber ??
      o?.id ??
      o?._id ??
      o?.orderId ??
      o?.commandeId ??
      o?.numero ??
      o?.reference ??
      o?.ref ??
      null;

    return list.map((o, idx) => {
      const id = pickId(o) ?? `row-${idx}`;
      return {
        id,
        customer: pickCustomer(o),
        items: pickItemsCount(o),
        total: pickTotal(o),
        status: normalizeStatus(o?.status ?? o?.etat ?? o?.state),
        raw: o,
      };
    });
  }, [data, t]);

  if (isLoading) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t("dashboard.recentOrders")}</h3>
          <button className="recent-orders-link" type="button" onClick={handleViewAll}>
            {t("dashboard.viewAll")} <RiArrowRightSLine />
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

  if (!orders.length) {
    return (
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <h3>{t("dashboard.recentOrders")}</h3>
          <button className="recent-orders-link" type="button" onClick={handleViewAll}>
            {t("dashboard.viewAll")} <RiArrowRightSLine />
          </button>
        </div>
        <div className="recent-orders-empty">
          <p>{t("dashboard.noOrders")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-orders-card">
      <div className="recent-orders-header">
        <h3>{t("dashboard.recentOrders")}</h3>
        <button className="recent-orders-link" type="button" onClick={handleViewAll}>
          {t("dashboard.viewAll")} <RiArrowRightSLine />
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
              <th>{t("common.status", "Statut")}</th>
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