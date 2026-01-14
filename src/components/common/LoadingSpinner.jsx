// src/components/common/LoadingSpinner.jsx
import { useTranslation } from 'react-i18next';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', // 'small' | 'medium' | 'large'
  text = null,
  fullScreen = false 
}) => {
  const { t } = useTranslation();

  const displayText = text || t('common.loading');

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
        {displayText && <p className="spinner-text">{displayText}</p>}
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
      {displayText && <p className="spinner-text">{displayText}</p>}
    </div>
  );
};

export default LoadingSpinner;