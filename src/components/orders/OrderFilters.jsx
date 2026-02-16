import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiCalendarLine,
  RiStoreLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import "./css/OrdersFilters.css";

/**
 * Props:
 * - filters
 * - onFiltersChange
 * - isRestaurantMode (true => restaurant connecté => pas de select restaurant)
 * - restaurants? (optionnel) [{ _id, name }] pour admin
 */
const OrdersFilters = ({
  filters,
  onFiltersChange,
  isRestaurantMode,
  restaurants = [],
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ Backend supporte uniquement: en_attente | livres | annules
  // => UI: PENDING | DELIVERED | CANCELLED
  const statusOptions = useMemo(
    () => [
      { value: "", label: t("orders.filters.allStatus") },
      { value: "PENDING", label: t("orders.status.pending") },
      { value: "DELIVERED", label: t("orders.status.delivered") },
      { value: "CANCELLED", label: t("orders.status.cancelled") },
    ],
    [t]
  );

  // ✅ Backend: en_attente | en_traitement | paye | non_paye
  // => UI (dans ton badge): PENDING | PAID | FAILED
  // (REFUNDED supprimé car non géré backend)
  const paymentStatusOptions = useMemo(
    () => [
      { value: "", label: t("orders.filters.allPaymentStatus") },
      { value: "PENDING", label: t("orders.paymentStatus.pending") },
      { value: "PAID", label: t("orders.paymentStatus.paid") },
      { value: "FAILED", label: t("orders.paymentStatus.failed") },
    ],
    [t]
  );

  // ✅ Backend: espece | tmoney | virement
  // => UI: CASH_ON_DELIVERY | MOBILE_MONEY | OTHER
  // (CARD supprimé)
  const paymentMethodOptions = useMemo(
    () => [
      { value: "", label: t("orders.filters.allMethods") },
      { value: "CASH_ON_DELIVERY", label: t("orders.paymentMethod.cashOnDelivery") }, // espece
      { value: "MOBILE_MONEY", label: t("orders.paymentMethod.mobileMoney") }, // tmoney
      { value: "OTHER", label: t("orders.paymentMethod.other") }, // virement
    ],
    [t]
  );

  // ✅ Backend: application_mobile | application_web
  // => UI: MOBILE | WEB | OTHER
  const sourceOptions = useMemo(
    () => [
      { value: "", label: t("orders.filters.allSources") },
      { value: "MOBILE", label: t("orders.source.mobile") },
      { value: "WEB", label: t("orders.source.web") },
      { value: "OTHER", label: t("orders.source.other") },
    ],
    [t]
  );

  const periodOptions = useMemo(
    () => [
      { value: "today", label: t("orders.filters.today") },
      { value: "7days", label: t("orders.filters.last7Days") },
      { value: "30days", label: t("orders.filters.last30Days") },
      { value: "custom", label: t("orders.filters.custom") },
    ],
    [t]
  );

  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    onFiltersChange({
      search: "",
      status: "",
      paymentStatus: "",
      paymentMethod: "",
      source: "",
      period: "30days",
      restaurant: "",
      from: "",
      to: "",
    });
  };

  const hasActiveFilters = Object.entries(filters || {}).some(([k, v]) => {
    if (k === "period") return v && v !== "30days";
    return v !== "" && v != null;
  });

  return (
    <div className="orders-filters">
      <div className="orders-filters-main">
        {/* Recherche */}
        <div className="orders-search">
          <RiSearchLine className="orders-search-icon" />
          <input
            type="text"
            placeholder={t("orders.searchPlaceholder")}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="orders-search-input"
          />
          {filters.search && (
            <button
              className="orders-search-clear"
              onClick={() => handleFilterChange("search", "")}
              type="button"
            >
              <RiCloseLine />
            </button>
          )}
        </div>

        {/* Filtres rapides */}
        <div className="orders-filters-quick">
          {/* Statut commande */}
          <div className="orders-filter-select">
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>

          {/* Statut paiement */}
          <div className="orders-filter-select">
            <select
              value={filters.paymentStatus || ""}
              onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
            >
              {paymentStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>

          {/* Période */}
          <div className="orders-filter-select">
            <RiCalendarLine className="select-icon" />
            <select
              value={filters.period || "30days"}
              onChange={(e) => handleFilterChange("period", e.target.value)}
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <RiArrowDownSLine className="select-arrow" />
          </div>
        </div>

        {/* Actions */}
        <div className="orders-filters-actions">
          <button
            className={`orders-filter-toggle ${showAdvanced ? "active" : ""}`}
            onClick={() => setShowAdvanced((v) => !v)}
            type="button"
          >
            <RiFilterLine />
            <span>{t("orders.filters.advanced")}</span>
          </button>

          {hasActiveFilters && (
            <button className="orders-filter-reset" onClick={handleReset} type="button">
              <RiCloseLine />
              <span>{t("orders.filters.reset")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Avancés */}
      {showAdvanced && (
        <div className="orders-filters-advanced">
          {/* Méthode paiement */}
          <div className="orders-filter-group">
            <label>{t("orders.table.paymentMethod")}</label>
            <div className="orders-filter-select">
              <select
                value={filters.paymentMethod || ""}
                onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              >
                {paymentMethodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <RiArrowDownSLine className="select-arrow" />
            </div>
          </div>

          {/* Source */}
          <div className="orders-filter-group">
            <label>{t("orders.table.source")}</label>
            <div className="orders-filter-select">
              <select
                value={filters.source || ""}
                onChange={(e) => handleFilterChange("source", e.target.value)}
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <RiArrowDownSLine className="select-arrow" />
            </div>
          </div>

          {/* Restaurant (admin) */}
          {!isRestaurantMode && (
            <div className="orders-filter-group">
              <label>{t("orders.table.restaurant")}</label>
              <div className="orders-filter-select">
                <RiStoreLine className="select-icon" />
                <select
                  value={filters.restaurant || ""}
                  onChange={(e) => handleFilterChange("restaurant", e.target.value)}
                >
                  <option value="">{t("orders.filters.allRestaurants")}</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine className="select-arrow" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;
