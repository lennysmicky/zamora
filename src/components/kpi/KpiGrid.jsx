import React from "react";
import { useTranslation } from "react-i18next";
import KpiCard from "./KpiCard";
import {
  RiShoppingBag3Line,
  RiMoneyDollarCircleLine,
  RiShoppingCartLine,
  RiGroupLine,
} from "react-icons/ri";
import "./KpiGrid.css";

const KpiGrid = ({ data: kpis, isLoading = false }) => {
  const { t } = useTranslation();

  const safeKpis = {
    totalOrders: kpis?.totalOrders ?? 0,
    growthOrders: kpis?.growthOrders ?? 0,
    totalRevenue: kpis?.totalRevenue ?? 0,
    growthRevenue: kpis?.growthRevenue ?? 0,
    averageOrderValue: kpis?.averageOrderValue ?? 
    kpis?.averageBasket ?? 0,
    growthBasket: kpis?.growthBasket ?? 0,
    totalCustomers: kpis?.totalCustomers ?? 0,
    growthCustomers: kpis?.growthCustomers ?? 0,
  };

  const getChangeType = (value) => {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  };

  const formatChange = (value) => {
    const n = Number(value) || 0;
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    const n = Number(value) || 0;
    return new Intl.NumberFormat("fr-FR").format(n);
  };

  const kpiCards = [
    {
      id: 1,
      title: t("dashboard.kpi.totalOrders"),
      value: formatNumber(safeKpis.totalOrders),
      change: formatChange(safeKpis.growthOrders),
      changeType: getChangeType(safeKpis.growthOrders),
      icon: RiShoppingBag3Line,
      suffix: null,
    },
    {
      id: 2,
      title: t("dashboard.kpi.totalRevenue"),
      value: formatNumber(safeKpis.totalRevenue),
      change: formatChange(safeKpis.growthRevenue),
      changeType: getChangeType(safeKpis.growthRevenue),
      icon: RiMoneyDollarCircleLine,
      suffix: "F CFA",
    },
    {
      id: 3,
      title: t("dashboard.kpi.averageBasket"),
      value: formatNumber(safeKpis.averageOrderValue),
      change: formatChange(safeKpis.growthBasket),
      changeType: getChangeType(safeKpis.growthBasket),
      icon: RiShoppingCartLine,
      suffix: "F CFA",
    },
    {
      id: 4,
      title: t("dashboard.kpi.uniqueCustomers"),
      value: formatNumber(safeKpis.totalCustomers),
      change: formatChange(safeKpis.growthCustomers),
      changeType: getChangeType(safeKpis.growthCustomers),
      icon: RiGroupLine,
      suffix: null,
    },
  ];

  return (
    <div className="kpi-grid">
      {kpiCards.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.title}
          value={isLoading ? "..." : kpi.value}
          change={isLoading ? "..." : kpi.change}
          changeType={kpi.changeType}
          icon={kpi.icon}
          suffix={kpi.suffix}
        />
      ))}
    </div>
  );
};

export default KpiGrid;