import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiSmartphoneLine,
  RiComputerLine,
  RiQuestionLine
} from 'react-icons/ri';
import './css/OrdersBadges.css';

const SourceBadge = ({ source }) => {
  const { t } = useTranslation();

  const sourceConfig = {
    MOBILE: {
      label: t('orders.source.mobile'),
      icon: RiSmartphoneLine,
      className: 'source-mobile'
    },
    WEB: {
      label: t('orders.source.web'),
      icon: RiComputerLine,
      className: 'source-web'
    },
    OTHER: {
      label: t('orders.source.other'),
      icon: RiQuestionLine,
      className: 'source-other'
    }
  };

  const config = sourceConfig[source] || sourceConfig.OTHER;
  const Icon = config.icon;

  return (
    <span className={`source-badge ${config.className}`}>
      <Icon className="badge-icon" />
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default SourceBadge;