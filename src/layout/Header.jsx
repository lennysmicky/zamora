// src/layout/Header.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrdersStore } from "../hooks/useOrdersStore";
import useAuthStore from "../stores/authStore";
import { useDashboardFiltersStore } from "../stores/dashboardFiltersStore";

import {
  RiMenuLine,
  RiArrowDownSLine,
  RiNotification3Line,
  RiChat3Line,
  RiRefreshLine,
  RiDownloadLine,
  RiAddLine,
  RiCloseLine,
  RiCheckboxMultipleLine,
  RiFileExcel2Line,
  RiFilePdf2Line,
} from "react-icons/ri";

import RestaurantSelector from "../filters/RestaurantSelector";
import DateRangeFilter from "../filters/DateRangeFilter";
import "./Header.css";

const pageTitlesConfig = {
  "/dashboard": { titleKey: "header.pages.dashboard.title", subtitleKey: "header.pages.dashboard.subtitle" },
  "/restaurants": { titleKey: "header.pages.restaurants.title", subtitleKey: "header.pages.restaurants.subtitle" },
  "/menus": { titleKey: "header.pages.menus.title", subtitleKey: "header.pages.menus.subtitle" },
  "/orders": { titleKey: "header.pages.orders.title", subtitleKey: "header.pages.orders.subtitle" },
  "/customers": { titleKey: "header.pages.customers.title", subtitleKey: "header.pages.customers.subtitle" },
  "/users": { titleKey: "header.pages.users.title", subtitleKey: "header.pages.users.subtitle" },
  "/promotions": { titleKey: "header.pages.promotions.title", subtitleKey: "header.pages.promotions.subtitle" },
  "/notifications": { titleKey: "header.pages.notifications.title", subtitleKey: "header.pages.notifications.subtitle" },
  "/payments": { titleKey: "header.pages.payments.title", subtitleKey: "header.pages.payments.subtitle" },
  "/settings": { titleKey: "header.pages.settings.title", subtitleKey: "header.pages.settings.subtitle" },
  "/special-offers": { titleKey: "header.pages.specialOffers.title", subtitleKey: "header.pages.specialOffers.subtitle" },
  "/messages": { titleKey: "header.pages.messages.title", subtitleKey: "header.pages.messages.subtitle" },

  "/restaurant/dashboard": { titleKey: "header.pages.dashboard.title", subtitleKey: "header.pages.restaurant.dashboardSubtitle" },
  "/restaurant/orders": { titleKey: "header.pages.orders.title", subtitleKey: "header.pages.restaurant.ordersSubtitle" },
  "/restaurant/menu": { titleKey: "header.pages.menu.title", subtitleKey: "header.pages.restaurant.menuSubtitle" },
  "/restaurant/promotions": { titleKey: "header.pages.promotions.title", subtitleKey: "header.pages.restaurant.promotionsSubtitle" },
  "/restaurant/special-offers": { titleKey: "header.pages.specialOffers.title", subtitleKey: "header.pages.restaurant.specialOffersSubtitle" },
  "/restaurant/payments": { titleKey: "header.pages.payments.title", subtitleKey: "header.pages.restaurant.paymentsSubtitle" },
  "/restaurant/notifications": { titleKey: "header.pages.notifications.title", subtitleKey: "header.pages.restaurant.notificationsSubtitle" },
  "/restaurant/settings": { titleKey: "header.pages.settings.title", subtitleKey: "header.pages.restaurant.settingsSubtitle" },
  "/restaurant/messages": { titleKey: "header.pages.messages.title", subtitleKey: "header.pages.restaurant.messagesSubtitle" },
};

const toISO = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Aligne avec DateRangeFilter ids:
 * today, yesterday, last7days, last30days, thisMonth, lastMonth, thisYear, custom, all
 */
const resolveRange = (range) => {
  const id = range?.id || "last30days";
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const y = new Date(now);
  y.setDate(now.getDate() - 1);

  if (id === "all") return { period: "", from: "", to: "" };

  if (id === "today") return { period: "today", from: "", to: "" };
  if (id === "last7days") return { period: "7days", from: "", to: "" };
  if (id === "last30days") return { period: "30days", from: "", to: "" };

  if (id === "yesterday") return { period: "custom", from: toISO(y), to: toISO(y) };
  if (id === "thisMonth") return { period: "custom", from: toISO(startOfMonth), to: toISO(endOfMonth) };
  if (id === "lastMonth") return { period: "custom", from: toISO(startOfLastMonth), to: toISO(endOfLastMonth) };
  if (id === "thisYear") return { period: "custom", from: toISO(startOfYear), to: toISO(endOfYear) };

  if (id === "custom") return { period: "custom", from: range?.from || "", to: range?.to || "" };

  return { period: "30days", from: "", to: "" };
};

/**
 * Store -> UI DateRangeFilter shape {id,labelKey,from,to}
 * (DateRangeFilter n’utilise que id/labelKey, mais on garde from/to pour "custom" si besoin)
 */
const storeToDateRange = ({ period, from, to }) => {
  if (!period) return { id: "all", labelKey: "filters.all" };
  if (period === "today") return { id: "today", labelKey: "filters.today" };
  if (period === "7days") return { id: "last7days", labelKey: "filters.last7Days" };
  if (period === "30days") return { id: "last30days", labelKey: "filters.last30Days" };

  // custom: on ne peut pas deviner si c'était thisMonth/lastMonth/etc.
  // => on affiche "custom" (cohérent)
  return { id: "custom", labelKey: "filters.custom", from: from || "", to: to || "" };
};

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const userType = useAuthStore((s) => s.userType);
  const isAdmin = userType === "admin";

  const { selectedOrders, handlers, clearSelection } = useOrdersStore();

  // ✅ single source of truth: store dashboard
  const dashboardRestaurant = useDashboardFiltersStore((s) => s.restaurant);
  const dashboardPeriod = useDashboardFiltersStore((s) => s.period);
  const dashboardFrom = useDashboardFiltersStore((s) => s.from);
  const dashboardTo = useDashboardFiltersStore((s) => s.to);

  const setDashboardRestaurant = useDashboardFiltersStore((s) => s.setRestaurant);
  const setDashboardPeriod = useDashboardFiltersStore((s) => s.setPeriod);
  const setDashboardRange = useDashboardFiltersStore((s) => s.setRange);

  // menus
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const pageConfig = pageTitlesConfig[location.pathname] || {
    titleKey: "header.pages.default.title",
    subtitleKey: "header.pages.default.subtitle",
  };

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/restaurant/dashboard";
  const isOrders = location.pathname === "/orders" || location.pathname === "/restaurant/orders";

  // ✅ dérivé du store (pas de state local)
  const selectedDateRange = useMemo(
    () => storeToDateRange({ period: dashboardPeriod, from: dashboardFrom, to: dashboardTo }),
    [dashboardPeriod, dashboardFrom, dashboardTo]
  );

  // navigation
  const handleNotificationsClick = () => navigate(isAdmin ? "/notifications" : "/restaurant/notifications");
  const handleMessagesClick = () => navigate(isAdmin ? "/messages" : "/restaurant/messages");

  // dashboard filters
  const handleRestaurantChange = (restaurant) => {
    setDashboardRestaurant(restaurant);
  };

  const handleDateRangeChange = (range) => {
    const r = resolveRange(range);

    if (!r.period) {
      setDashboardPeriod("");
      setDashboardRange({ from: "", to: "" });
      return;
    }

    if (r.period === "custom") {
      setDashboardPeriod("custom");
      setDashboardRange({ from: r.from, to: r.to });
    } else {
      setDashboardRange({ from: "", to: "" });
      setDashboardPeriod(r.period);
    }
  };

  // orders
  const handleExport = (format) => {
    handlers.onExport?.(format);
    setShowExportMenu(false);
  };

  const handleBulkAction = (action) => {
    handlers.onBulkAction?.(action);
    setShowBulkMenu(false);
  };

  const handleClearSelection = () => {
    clearSelection();
    setShowBulkMenu(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label={t("header.toggleMenu")}
          type="button"
        >
          <RiMenuLine />
        </button>

        <div className="header-title">
          <h1>{t(pageConfig.titleKey)}</h1>
          <p>{t(pageConfig.subtitleKey)}</p>
        </div>
      </div>

      <div className="header-right">
        {/* DASHBOARD FILTERS */}
        {isDashboard && (
          <div className="header-filters">
            {isAdmin && (
              <>
                <RestaurantSelector selectedRestaurant={dashboardRestaurant} onSelectRestaurant={handleRestaurantChange} />
                <div className="header-filter-divider" />
              </>
            )}

            <DateRangeFilter selectedRange={selectedDateRange} onSelectRange={handleDateRangeChange} />
          </div>
        )}

        {/* ORDERS ACTIONS */}
        {isOrders && (
          <div className="header-orders">
            {selectedOrders.length > 0 ? (
              <div className="header-orders-bulk">
                <div className="header-orders-bulk-info">
                  <RiCheckboxMultipleLine />
                  <span>
                    {selectedOrders.length} {t("orders.selected")}
                  </span>
                  <button
                    className="header-orders-bulk-clear"
                    onClick={handleClearSelection}
                    aria-label={t("orders.clearSelection")}
                    type="button"
                  >
                    <RiCloseLine />
                  </button>
                </div>

                <div className="header-orders-dropdown-wrapper">
                  <button
                    className="header-orders-btn header-orders-btn-secondary"
                    onClick={() => setShowBulkMenu((v) => !v)}
                    type="button"
                  >
                    <span>{t("orders.bulkActions")}</span>
                    <RiArrowDownSLine className={showBulkMenu ? "rotate" : ""} />
                  </button>

                  {showBulkMenu && (
                    <div className="header-orders-dropdown">
                      <button type="button" onClick={() => handleBulkAction("mark_delivered")}>
                        {t("orders.bulkMarkDelivered")}
                      </button>
                      <button type="button" onClick={() => handleBulkAction("mark_cancelled")}>
                        {t("orders.bulkMarkCancelled")}
                      </button>
                      <div className="header-orders-dropdown-divider" />
                      <button className="danger" type="button" onClick={() => handleBulkAction("delete")}>
                        {t("orders.bulkDelete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="header-orders-actions">
                <button
                  className="header-orders-btn header-orders-btn-icon"
                  onClick={() => handlers.onRefresh?.()}
                  title={t("common.refresh")}
                  type="button"
                >
                  <RiRefreshLine />
                </button>

                <div className="header-orders-dropdown-wrapper">
                  <button
                    className="header-orders-btn header-orders-btn-secondary"
                    onClick={() => setShowExportMenu((v) => !v)}
                    type="button"
                  >
                    <RiDownloadLine />
                    <span>{t("orders.export")}</span>
                    <RiArrowDownSLine className={showExportMenu ? "rotate" : ""} />
                  </button>

                  {showExportMenu && (
                    <div className="header-orders-dropdown">
                      <button type="button" onClick={() => handleExport("csv")}>
                        <RiFileExcel2Line />
                        <span>{t("orders.exportCSV")}</span>
                      </button>
                      <button type="button" onClick={() => handleExport("pdf")}>
                        <RiFilePdf2Line />
                        <span>{t("orders.exportPDF")}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="header-orders-btn header-orders-btn-primary"
                  onClick={() => handlers.onNewOrder?.()}
                  type="button"
                >
                  <RiAddLine />
                  <span>{t("orders.newOrder")}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS & MESSAGES */}
        <div className="header-actions">
          <button
            className="header-action-btn"
            onClick={handleNotificationsClick}
            aria-label={t("header.notifications")}
            title={t("header.notifications")}
            type="button"
          >
            <RiNotification3Line />
            <span className="header-action-badge" />
          </button>

          <button
            className="header-action-btn"
            onClick={handleMessagesClick}
            aria-label={t("header.messages")}
            title={t("header.messages")}
            type="button"
          >
            <RiChat3Line />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
