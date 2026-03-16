import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./OrdersStatusChart.css";

const OrdersStatusChart = ({ data: input, isLoading = false }) => {
  const { t } = useTranslation();

  const normalizeStatusKey = (status) => {
    const v = String(status ?? "").trim().toLowerCase();

    if (["delivered", "livres", "livree", "livré", "livrée", "livre"].includes(v)) {
      return "delivered";
    }
    if (["preparing", "in_preparation", "en_preparation", "preparation", "préparation"].includes(v)) {
      return "preparing";
    }
    if (["pending", "en_attente", "attente", "en attente"].includes(v)) {
      return "pending";
    }
    if (["cancelled", "canceled", "annules", "annulé", "annule", "annulée"].includes(v)) {
      return "cancelled";
    }
    if (["out_for_delivery", "en_livraison"].includes(v)) {
      return "out_for_delivery";
    }

    return v || "unknown";
  };

  const statusColors = {
    delivered: "#10b981",
    preparing: "#f59e0b",
    pending: "#64748b",
    cancelled: "#ef4444",
    out_for_delivery: "#3b82f6",
    unknown: "#94a3b8",
  };

  const formatNumber = (value) => new Intl.NumberFormat("fr-FR").format(value);

  const getStatusLabel = (status) => {
    const key = normalizeStatusKey(status);

    const labels = {
      delivered: t("orders.status.delivered"),
      preparing: t("orders.status.inPreparation"),
      pending: t("orders.status.pending"),
      cancelled: t("orders.status.cancelled"),
      out_for_delivery: t("orders.status.outForDelivery"),
      unknown: t("common.unknown", "Inconnu"),
    };

    return labels[key] || key;
  };

  const data = useMemo(() => {
    if (Array.isArray(input)) {
      return input
        .map((x) => {
          const rawName = x?.label ?? x?.name ?? x?.status ?? "unknown";
          const key = normalizeStatusKey(rawName);
          const value = Number(x?.value ?? x?.count ?? x?.total ?? 0) || 0;
          const color = x?.color ?? statusColors[key] ?? statusColors.unknown;

          return {
            name: key,
            rawName,
            value,
            color,
          };
        })
        .filter((x) => x.name);
    }

    const labels = input?.labels;
    const values = input?.data;
    const colors = input?.colors;

    if (Array.isArray(labels) && Array.isArray(values)) {
      return labels
        .map((label, i) => {
          const key = normalizeStatusKey(label);
          const value = Number(values[i] ?? 0) || 0;
          const color =
            (Array.isArray(colors) ? colors[i] : null) ??
            statusColors[key] ??
            statusColors.unknown;

          return {
            name: key,
            rawName: label,
            value,
            color,
          };
        })
        .filter((x) => x.name);
    }

    return [];
  }, [input]);

  const total = useMemo(
    () => data.reduce((acc, item) => acc + (item.value || 0), 0),
    [data]
  );

  const calculatePercentage = (value) =>
    total === 0 ? 0 : Math.round((value / total) * 100);

  if (isLoading) {
    return (
      <div className="chart-card status-chart">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t("dashboard.ordersStatus")}</h3>
            <p>{t("dashboard.statusDistribution")}</p>
          </div>
        </div>
        <div className="status-chart-body">
          <div className="status-chart-donut">
            <div className="status-chart-skeleton-donut"></div>
          </div>
          <div className="status-chart-legend">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="status-legend-item skeleton-legend-item">
                <div className="status-legend-info">
                  <span className="skeleton-dot"></span>
                  <span className="skeleton-name"></span>
                </div>
                <span className="skeleton-value"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <div className="chart-card status-chart">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t("dashboard.ordersStatus")}</h3>
            <p>{t("dashboard.statusDistribution")}</p>
          </div>
        </div>
        <div className="status-chart-body">
          <div className="status-chart-empty">
            <p>{t("dashboard.noOrders")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card status-chart">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <h3>{t("dashboard.ordersStatus")}</h3>
          <p>{t("dashboard.statusDistribution")}</p>
        </div>
      </div>

      <div className="status-chart-body">
        <div className="status-chart-donut">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="status-chart-center">
            <span className="status-chart-total">{formatNumber(total)}</span>
            <span className="status-chart-label">{t("common.total", "Total")}</span>
          </div>
        </div>

        <div className="status-chart-legend">
          {data.map((item, index) => (
            <div key={index} className="status-legend-item">
              <div className="status-legend-info">
                <span
                  className="status-legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="status-legend-name">
                  {getStatusLabel(item.name)}
                </span>
              </div>
              <span className="status-legend-value">
                {calculatePercentage(item.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersStatusChart;