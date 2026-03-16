import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RiMoreLine } from "react-icons/ri";
import "./RevenueChart.css";

const RevenueChart = ({ data: input, isLoading = false }) => {
  const { t } = useTranslation();

  const toNumber = (value) => {
    if (value == null || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const n = Number(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const formatCurrency = (value) => {
    const n = toNumber(value);
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(n);
  };

  const formatYAxis = (value) => {
    const n = toNumber(value);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return `${n}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const chartData = useMemo(() => {
    if (Array.isArray(input)) {
      return input
        .map((x) => ({
          name:
            x?.date ??
            x?.label ??
            x?.day ??
            x?.jour ??
            x?.x ??
            "",
          revenue: toNumber(
            x?.value ??
            x?.total ??
            x?.amount ??
            x?.revenue ??
            x?.totalRevenue ??
            x?.revenu ??
            x?.revenuTotal ??
            x?.montant_total ??
            x?.chiffreAffaire ??
            x?.y
          ),
        }))
        .filter((x) => x.name);
    }

    const labels = input?.labels;
    const datasets = input?.datasets;
    const serie = Array.isArray(datasets) ? datasets[0] : null;
    const values = serie?.data;

    if (Array.isArray(labels) && Array.isArray(values)) {
      return labels
        .map((label, i) => ({
          name: label ?? "",
          revenue: toNumber(values[i] ?? 0),
        }))
        .filter((x) => x.name);
    }

    return [];
  }, [input]);

  if (isLoading) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t("dashboard.revenueOverview")}</h3>
            <p>{t("dashboard.revenueDescription")}</p>
          </div>
          <button className="chart-card-action" type="button">
            <RiMoreLine />
          </button>
        </div>
        <div className="chart-card-body">
          <div className="chart-skeleton">
            <div className="chart-skeleton-bars">
              {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                <div
                  key={i}
                  className="chart-skeleton-bar"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t("dashboard.revenueOverview")}</h3>
            <p>{t("dashboard.revenueDescription")}</p>
          </div>
          <button className="chart-card-action" type="button">
            <RiMoreLine />
          </button>
        </div>
        <div className="chart-card-body">
          <div className="chart-empty">
            <p>{t("dashboard.noData")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <h3>{t("dashboard.revenueOverview")}</h3>
          <p>{t("dashboard.revenueDescription")}</p>
        </div>
        <button className="chart-card-action" type="button">
          <RiMoreLine />
        </button>
      </div>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={formatYAxis}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;