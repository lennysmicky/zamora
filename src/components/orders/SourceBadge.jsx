import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiSmartphoneLine, RiComputerLine, RiQuestionLine } from 'react-icons/ri';
import './css/OrdersBadges.css';

const normalize = (s) => String(s ?? '').trim().toLowerCase();

const toUISource = (s) => {
  const v = normalize(s);

  // backend: application_mobile | application_web
  if (['mobile', 'application_mobile', 'app_mobile', 'android', 'ios'].includes(v)) return 'MOBILE';
  if (['web', 'application_web', 'app_web', 'browser'].includes(v)) return 'WEB';

  // déjà en format UI ?
  if (['mobile', 'web', 'other'].includes(v)) return v.toUpperCase();

  return 'OTHER';
};

const SourceBadge = ({ source }) => {
  const { t } = useTranslation();
  const key = toUISource(source);

  const sourceConfig = {
    MOBILE: { label: t('orders.source.mobile'), icon: RiSmartphoneLine, className: 'source-mobile' },
    WEB: { label: t('orders.source.web'), icon: RiComputerLine, className: 'source-web' },
    OTHER: { label: t('orders.source.other'), icon: RiQuestionLine, className: 'source-other' }
  };

  const config = sourceConfig[key] || sourceConfig.OTHER;
  const Icon = config.icon;

  return (
    <span className={`source-badge ${config.className}`}>
      <Icon className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default SourceBadge;
