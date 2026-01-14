import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { RiMoreLine } from 'react-icons/ri';
import './RevenueChart.css';

const RevenueChart = () => {
  const { t } = useTranslation();

  // État initialisé à tableau vide (prêt pour le backend)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données depuis le backend
  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/dashboard/revenue');
      // const data = await response.json();
      // setData(data);

      // Pour l'instant, on garde le tableau vide
      setData([]);
    } catch (error) {
      console.error('Erreur lors du chargement des revenus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  // Fonction pour formater la monnaie dans le tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Fonction pour formater l'axe Y
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  // Tooltip personnalisé
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

  // ================================
  // ÉTAT 1 : LOADING (Skeleton)
  // ================================
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t('dashboard.revenueOverview')}</h3>
            <p>{t('dashboard.revenueDescription')}</p>
          </div>
          <button className="chart-card-action">
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

  // ================================
  // ÉTAT 2 : EMPTY (Aucune donnée)
  // ================================
  if (data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <h3>{t('dashboard.revenueOverview')}</h3>
            <p>{t('dashboard.revenueDescription')}</p>
          </div>
          <button className="chart-card-action">
            <RiMoreLine />
          </button>
        </div>
        <div className="chart-card-body">
          <div className="chart-empty">
            <p>{t('dashboard.noData')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA (Affichage normal)
  // ================================
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <h3>{t('dashboard.revenueOverview')}</h3>
          <p>{t('dashboard.revenueDescription')}</p>
        </div>
        <button className="chart-card-action">
          <RiMoreLine />
        </button>
      </div>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }}
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