// src/pages/Restaurant/Settings/RestaurantSettingsPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiStore2Line, 
  RiLockLine, 
  RiUserLine,
  RiLoader4Line 
} from 'react-icons/ri';
import { useRestaurantSettings } from '../../../hooks/useRestaurantSettings';
import ProfileSection from '../../../components/settings/ProfileSection';
import SecuritySection from '../../../components/settings/SecuritySection';
import AccountSection from '../../../components/settings/AccountSection';
import './RestaurantSettingsPage.css';

const TABS = [
  { id: 'profile', icon: RiStore2Line, labelKey: 'settings.tabs.profile' },
  { id: 'security', icon: RiLockLine, labelKey: 'settings.tabs.security' },
  { id: 'account', icon: RiUserLine, labelKey: 'settings.tabs.account' },
];

const RestaurantSettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  
  const {
    restaurant,
    loading,
    error,
    saving,
    updateInfo,
    updateLogo,
    changePassword,
    toggleActive,
    deleteAccount,
    fetchRestaurant
  } = useRestaurantSettings();

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="rs-loading">
          <RiLoader4Line className="rs-spinner" />
          <span>{t('common.loading', 'Chargement...')}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rs-error">
          <p>{error}</p>
          <button className="rs-btn rs-btn-primary" onClick={fetchRestaurant}>
            {t('common.retry', 'Réessayer')}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSection 
            restaurant={restaurant}
            saving={saving}
            onUpdateInfo={updateInfo}
            onUpdateLogo={updateLogo}
          />
        );
      case 'security':
        return (
          <SecuritySection 
            saving={saving}
            onChangePassword={changePassword}
          />
        );
      case 'account':
        return (
          <AccountSection 
            restaurant={restaurant}
            saving={saving}
            onToggleActive={toggleActive}
            onDeleteAccount={deleteAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rs-page">
      {/* Tabs */}
      <div className="rs-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rs-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            <span>{t(tab.labelKey, tab.id)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rs-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;