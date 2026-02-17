import React, { useMemo } from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import './KpiCard.css';

const KpiCard = ({ title, value, change, changeType, icon: Icon, suffix }) => {
  const { isPositive, isNegative, shouldShowChange } = useMemo(() => {
    const pos = changeType === 'positive';
    const neg = changeType === 'negative';
    const show =
      change != null &&
      String(change).trim() !== '' &&
      String(change).trim() !== '...';
    return { isPositive: pos, isNegative: neg, shouldShowChange: show };
  }, [change, changeType]);

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon ? (
          <div className="kpi-card-icon">
            <Icon />
          </div>
        ) : null}
      </div>

      <div className="kpi-card-body">
        <div className="kpi-card-value-row">
          <span className="kpi-card-value">{value}</span>
          {suffix ? <span className="kpi-card-suffix">{suffix}</span> : null}
          {/* si tu veux afficher même suffix="" => remplace par: suffix != null */}
        </div>

        {shouldShowChange ? (
          <div
            className={[
              'kpi-card-change',
              isPositive ? 'positive' : '',
              isNegative ? 'negative' : '',
            ].join(' ')}
          >
            {isPositive ? <RiArrowUpLine /> : null}
            {isNegative ? <RiArrowDownLine /> : null}
            <span>{change}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default KpiCard;
