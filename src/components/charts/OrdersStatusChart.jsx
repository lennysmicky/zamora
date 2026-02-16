import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./OrdersStatusChart.css";

const OrdersStatusChart = ({ data: input, isLoading = false }) => {
  const { t } = useTranslation();

  // Couleurs par statut (clé canonique en minuscule)
  const statusColors = {
    delivered: "#10b981",
    preparing: "#f59e0b",
    pending: "#64748b",
    cancelled: "#ef4444",
  };

  const formatNumber = (value) => new Intl.NumberFormat("fr-FR").format(value);

  const getStatusLabel = (status) => {
    const key = String(status ?? "");
    const tr = t(`status.${key}`);
    return tr && tr !== `status.${key}` ? tr : key;
  };

  // Adapter input -> format Recharts: [{ name, value, color }]
  const data = useMemo(() => {
    // Format normalisé attendu (hook/backend): [{ label, value }]
    if (Array.isArray(input)) {
      return input
        .map((x) => {
          const name = x?.label ?? x?.name ?? x?.status ?? "unknown";
          const value = Number(x?.value ?? x?.count ?? x?.total ?? 0) || 0;

          const key = String(name).toLowerCase();
          const color = x?.color ?? statusColors[key] ?? "#64748b";

          return { name, value, color };
        })
        .filter((x) => x.name);
    }

    // Ancien format: { labels:[], data:[], colors:[] }
    const labels = input?.labels;
    const values = input?.data;
    const colors = input?.colors;

    if (Array.isArray(labels) && Array.isArray(values)) {
      return labels
        .map((label, i) => {
          const name = label ?? "unknown";
          const value = Number(values[i] ?? 0) || 0;

          const key = String(name).toLowerCase();
          const color =
            (Array.isArray(colors) ? colors[i] : null) ??
            statusColors[key] ??
            "#64748b";

          return { name, value, color };
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

  // ================================
  // LOADING
  // ================================
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

  // ================================
  // EMPTY
  // ================================
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

  // ================================
  // DATA
  // ================================
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
            <span className="status-chart-label">{t("status.total")}</span>
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
