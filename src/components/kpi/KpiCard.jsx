import React from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import './KpiCard.css';

const KpiCard = ({ title, value, change, changeType, icon: Icon, suffix }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon && (
          <div className="kpi-card-icon">
            <Icon />
          </div>
        )}
      </div>

      <div className="kpi-card-body">
        <div className="kpi-card-value-row">
          <span className="kpi-card-value">{value}</span>
          {suffix && <span className="kpi-card-suffix">{suffix}</span>}
        </div>

        {change && (
          <div className={`kpi-card-change ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}>
            {isPositive && <RiArrowUpLine />}
            {isNegative && <RiArrowDownLine />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;