// src/components/payments/PaymentConfig.jsx
import React from 'react';
import {
  RiWallet3Line,
  RiSmartphoneLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiTestTubeLine,
  RiLoader4Line
} from 'react-icons/ri';
import './css/PaymentConfig.css';

const PaymentConfig = ({
  config,
  onChange,
  onTestConnection,
  loading,
  showSecretKey,
  setShowSecretKey,
  t
}) => {
  return (
    <div className="payments-config">
      {/* Methods */}
      <div className="config-section">
        <h3 className="config-section-title">
          <RiWallet3Line />
          {t('payments.config.methods', 'Méthodes de paiement')}
        </h3>
        <div className="config-methods">
          <label className="config-toggle">
            <input
              type="checkbox"
              checked={config.cashEnabled}
              onChange={(e) => onChange('cashEnabled', e.target.checked)}
            />
            <span className="toggle-switch"></span>
            <span className="toggle-label">
              <RiWallet3Line />
              {t('payments.config.cash', 'Espèces à la livraison')}
            </span>
          </label>
          <label className="config-toggle">
            <input
              type="checkbox"
              checked={config.mobileMoneyEnabled}
              onChange={(e) => onChange('mobileMoneyEnabled', e.target.checked)}
            />
            <span className="toggle-switch"></span>
            <span className="toggle-label">
              <RiSmartphoneLine />
              {t('payments.config.mobileMoney', 'Mobile Money')}
            </span>
          </label>
        </div>
        <div className="config-field">
          <label>{t('payments.config.currency', 'Devise')}</label>
          <select
            value={config.currency}
            onChange={(e) => onChange('currency', e.target.value)}
          >
            <option value="XOF">XOF (Franc CFA)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="USD">USD (Dollar)</option>
          </select>
        </div>
      </div>

      {/* API Config */}
      {config.mobileMoneyEnabled && (
        <div className="config-section">
          <h3 className="config-section-title">
            <RiLockLine />
            {t('payments.config.apiSettings', 'Paramètres API')}
          </h3>
          <div className="config-field">
            <label>{t('payments.config.mode', 'Mode')}</label>
            <select
              value={config.mode}
              onChange={(e) => onChange('mode', e.target.value)}
            >
              <option value="test">{t('payments.config.testMode', 'Test')}</option>
              <option value="production">{t('payments.config.prodMode', 'Production')}</option>
            </select>
          </div>
          <div className="config-field">
            <label>{t('payments.config.publicKey', 'Clé publique')}</label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => onChange('publicKey', e.target.value)}
              placeholder="pk_test_..."
            />
          </div>
          <div className="config-field">
            <label>{t('payments.config.secretKey', 'Clé secrète')}</label>
            <div className="password-input-wrapper">
              <input
                type={showSecretKey ? 'text' : 'password'}
                value={config.secretKey}
                onChange={(e) => onChange('secretKey', e.target.value)}
                placeholder="sk_test_..."
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>
          <div className="config-connection">
            <button
              className="payments-btn-secondary"
              onClick={onTestConnection}
              disabled={loading.testing}
            >
              {loading.testing ? <RiLoader4Line className="spin" /> : <RiTestTubeLine />}
              <span>{t('payments.config.testConnection', 'Tester la connexion')}</span>
            </button>
            {config.connectionStatus && (
              <span className={`connection-status ${config.connectionStatus}`}>
                {config.connectionStatus === 'ok' 
                  ? t('payments.config.connectionOk', 'Connexion OK')
                  : t('payments.config.connectionError', 'Erreur de connexion')
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentConfig;