import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowRightSLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { buildOrdersQuery } from "../../utils/ordersQuery";
import "./TopSellingItems.css";

const TopSellingItems = ({ data = [], isLoading = false, linkFilters = {} }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userType } = useAuthStore();
  const isRestaurantMode = userType === "restaurant";

  const handleViewAll = () => {
    const path = isRestaurantMode ? "/restaurant/orders" : "/orders";
    navigate(`${path}${buildOrdersQuery(linkFilters)}`);
  };

  const formatCurrency = (value) => {
    const n = Number(value);
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);
  };

  const formatSold = (count) => {
    const n = Number(count);
    const v = Number.isFinite(n) ? n : 0;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(v);
  };

  const topSellingItems = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((x, idx) => {
      const it = x ?? {};
      const sold = it.sold ?? it.qty ?? it.qte ?? it.count ?? it.total ?? it.nb ?? 0;
      const id =
        it.id ??
        it._id ??
        it.mealId ??
        it.productId ??
        `${it.name ?? it.nom ?? "item"}-${it.category ?? it.categorie ?? ""}-${idx}`;

      return {
        id,
        name: it.name ?? it.nom ?? it.title ?? "-",
        price: it.price ?? it.prix ?? it.amount ?? 0,
        category: it.category ?? it.categorie ?? "-",
        sold,
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t("dashboard.topSelling")}</h3>
          <button className="top-selling-link" type="button" onClick={handleViewAll}>
            {t("dashboard.viewAll")} <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="top-selling-item skeleton-item">
              <div className="skeleton-rank"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-meta"></div>
              </div>
              <div className="skeleton-stats"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topSellingItems.length) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t("dashboard.topSelling")}</h3>
          <button className="top-selling-link" type="button" onClick={handleViewAll}>
            {t("dashboard.viewAll")} <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-empty">
          <p>{t("dashboard.noSales")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="top-selling-card">
      <div className="top-selling-header">
        <h3>{t("dashboard.topSelling")}</h3>
        <button className="top-selling-link" type="button" onClick={handleViewAll}>
          {t("dashboard.viewAll")} <RiArrowRightSLine />
        </button>
      </div>

      <div className="top-selling-list">
        {topSellingItems.map((item, index) => (
          <div key={item.id} className="top-selling-item">
            <div className={`top-selling-rank rank-${index + 1}`}>{index + 1}</div>
            <div className="top-selling-info">
              <span className="top-selling-name">{item.name}</span>
              <span className="top-selling-meta">
                {formatCurrency(item.price)} • {item.category}
              </span>
            </div>
            <div className="top-selling-stats">
              <span className="top-selling-sold">{formatSold(item.sold)}</span>
              <span className="top-selling-sold-label">{t("common.sold")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
