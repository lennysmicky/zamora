// src/pages/Restaurant/Notifications/RestaurantNotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiSettings4Line,
  RiFileList3Line,
  RiRefreshLine,
  RiSave3Line,
  RiLoader4Line,
  RiNotification3Line,
  RiMailLine,
  RiNotification4Line,
  RiShoppingBag3Line,
  RiExchangeLine,
  RiMegaphoneLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiMailSendLine,
  RiSmartphoneLine
} from 'react-icons/ri';
import useNotifications from '../../../hooks/useNotifications';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './RestaurantNotificationsPage.css';

const RestaurantNotificationsPage = () => {
  const { t } = useTranslation();

  const {
    settings,
    logs,
    stats,
    loading,
    saving,
    error,
    success,
    saveSettings,
    updateSetting,
    fetchLogs,
    fetchStats,
    removeLog
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('settings');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  useEffect(() => {
    if (activeTab === 'log') {
      fetchLogs();
      fetchStats();
    }
  }, [activeTab, fetchLogs, fetchStats]);

  const handleSave = async () => {
    await saveSettings(settings);
  };

  const handleRefresh = () => {
    if (activeTab === 'log') {
      fetchLogs();
      fetchStats();
    }
  };

  const handleDeleteLog = (id) => {
    setSelectedLogId(id);
    setShowConfirmDelete(true);
  };

  const confirmDeleteLog = async () => {
    if (!selectedLogId) return;

    const deleted = await removeLog(selectedLogId);

    if (deleted) {
      setShowConfirmDelete(false);
      setSelectedLogId(null);
      fetchStats();
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'new_order':
      case 'commande':
        return <RiShoppingBag3Line />;
      case 'status_change':
      case 'changement_statut':
        return <RiExchangeLine />;
      case 'promotion':
        return <RiMegaphoneLine />;
      default:
        return <RiNotification3Line />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
      case 'envoye':
        return <RiCheckboxCircleLine />;
      case 'pending':
      case 'en_attente':
        return <RiTimeLine />;
      case 'failed':
      case 'echec':
        return <RiCloseCircleLine />;
      default:
        return <RiTimeLine />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <RiMailLine />;
      case 'push':
        return <RiNotification4Line />;
      case 'sms':
        return <RiSmartphoneLine />;
      default:
        return <RiNotification4Line />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const safeStats = {
    total: stats?.total ?? 0,
    sent: stats?.sent ?? 0,
    pending: stats?.pending ?? 0,
    failed: stats?.failed ?? 0
  };

  const safeSettings = {
    notify_owner_new_order: settings?.notify_owner_new_order ?? true,
    notify_client_order_created: settings?.notify_client_order_created ?? true,
    notify_client_status_change: settings?.notify_client_status_change ?? true,
    notify_client_new_promotion: settings?.notify_client_new_promotion ?? false,
    channel_email: settings?.channel_email ?? true,
    channel_push: settings?.channel_push ?? false
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header-row">
        <div className="notifications-tabs">
          <button
            className={`notifications-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <RiSettings4Line />
            <span>{t('notifications.settings')}</span>
          </button>

          <button
            className={`notifications-tab ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            <RiFileList3Line />
            <span>{t('notifications.log')}</span>
          </button>
        </div>

        <div className="notifications-header-actions">
          {activeTab === 'log' && (
            <button
              className="notifications-btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
              title={t('common.refresh')}
            >
              <RiRefreshLine className={loading ? 'spin' : ''} />
            </button>
          )}

          {activeTab === 'settings' && (
            <button
              className="notifications-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <RiLoader4Line className="spin" /> : <RiSave3Line />}
              <span>{saving ? t('notifications.saving') : t('notifications.save')}</span>
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="notifications-toast success">
          <RiCheckboxCircleLine />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="notifications-toast error">
          <RiCloseCircleLine />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'settings' ? (
        <SettingsTab
          settings={safeSettings}
          updateSetting={updateSetting}
          t={t}
        />
      ) : (
        <LogsTab
          logs={logs || []}
          stats={safeStats}
          loading={loading}
          onDelete={handleDeleteLog}
          getEventIcon={getEventIcon}
          getStatusIcon={getStatusIcon}
          getChannelIcon={getChannelIcon}
          formatDate={formatDate}
          t={t}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setSelectedLogId(null);
        }}
        onConfirm={confirmDeleteLog}
        title={t('notifications.deleteTitle')}
        message={t('notifications.deleteConfirm')}
        confirmText={t('notifications.delete')}
        cancelText={t('notifications.cancel')}
        variant="danger"
      />
    </div>
  );
};

const SettingsTab = ({ settings, updateSetting, t }) => {
  return (
    <div className="notifications-settings">
      <div className="notifications-card">
        <div className="notifications-card-header">
          <RiNotification3Line />
          <h3>{t('notifications.events')}</h3>
        </div>

        <div className="notifications-card-body">
          <ToggleItem
            icon={<RiShoppingBag3Line />}
            label={t('notifications.ownerNewOrder')}
            checked={settings.notify_owner_new_order}
            onChange={(value) => updateSetting('notify_owner_new_order', value)}
          />
          <ToggleItem
            icon={<RiMailSendLine />}
            label={t('notifications.clientOrderCreated')}
            checked={settings.notify_client_order_created}
            onChange={(value) => updateSetting('notify_client_order_created', value)}
          />
          <ToggleItem
            icon={<RiExchangeLine />}
            label={t('notifications.clientStatusChange')}
            checked={settings.notify_client_status_change}
            onChange={(value) => updateSetting('notify_client_status_change', value)}
          />
          <ToggleItem
            icon={<RiMegaphoneLine />}
            label={t('notifications.clientNewPromotion')}
            checked={settings.notify_client_new_promotion}
            onChange={(value) => updateSetting('notify_client_new_promotion', value)}
          />
        </div>
      </div>

      <div className="notifications-card">
        <div className="notifications-card-header">
          <RiMailLine />
          <h3>{t('notifications.channels')}</h3>
        </div>

        <div className="notifications-card-body">
          <ToggleItem
            icon={<RiMailLine />}
            label={t('notifications.channelEmail')}
            checked={settings.channel_email}
            onChange={(value) => updateSetting('channel_email', value)}
          />
          <ToggleItem
            icon={<RiNotification4Line />}
            label={t('notifications.channelPush')}
            checked={settings.channel_push}
            onChange={(value) => updateSetting('channel_push', value)}
          />
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ icon, label, checked = false, onChange }) => {
  return (
    <label className="notifications-toggle">
      <div className="notifications-toggle-info">
        <span className="notifications-toggle-icon">{icon}</span>
        <span className="notifications-toggle-text">{label}</span>
      </div>
      <div className="notifications-toggle-switch-wrapper">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="notifications-toggle-switch"></span>
      </div>
    </label>
  );
};

const LogsTab = ({
  logs = [],
  stats = { total: 0, sent: 0, pending: 0, failed: 0 },
  loading = false,
  onDelete,
  getEventIcon,
  getStatusIcon,
  getChannelIcon,
  formatDate,
  t
}) => {
  return (
    <div className="notifications-logs">
      <div className="notifications-stats">
        <div className="notifications-stat-card">
          <div className="notifications-stat-icon total">
            <RiNotification3Line />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.total}</span>
            <span className="notifications-stat-label">Total</span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon success">
            <RiCheckboxCircleLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.sent}</span>
            <span className="notifications-stat-label">{t('notifications.status.sent')}</span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon warning">
            <RiTimeLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.pending}</span>
            <span className="notifications-stat-label">{t('notifications.status.pending')}</span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon error">
            <RiCloseCircleLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.failed}</span>
            <span className="notifications-stat-label">{t('notifications.status.failed')}</span>
          </div>
        </div>
      </div>

      <div className="notifications-card notifications-logs-card">
        <div className="notifications-card-header">
          <RiFileList3Line />
          <h3>{t('notifications.log')}</h3>
        </div>

        <div className="notifications-card-body">
          {loading ? (
            <div className="notifications-loading-inline">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <RiNotification3Line />
              </div>
              <h4>{t('notifications.noLogs')}</h4>
            </div>
          ) : (
            <div className="notifications-log-list">
              {logs.map((log) => {
                const logId = log.id || log._id;
                const eventType = log.event_type || 'default';
                const status = log.status || 'pending';
                const channel = log.channel || 'push';
                const title = log.title || '-';
                const message = log.message || '-';
                const createdAt = log.created_at || log.createdAt;

                return (
                  <div key={logId} className={`notifications-log-item ${status}`}>
                    <div className="notifications-log-icon">
                      {getEventIcon(eventType)}
                    </div>

                    <div className="notifications-log-content">
                      <div className="notifications-log-header">
                        <span className={`notifications-log-type ${eventType}`}>
                          {t(`notifications.eventType.${eventType}`)}
                        </span>
                        <span className="notifications-log-date">
                          {formatDate(createdAt)}
                        </span>
                      </div>

                      <h4 className="notifications-log-title">{title}</h4>
                      <p className="notifications-log-message">{message}</p>

                      <div className="notifications-log-footer">
                        <span className="notifications-log-channel">
                          {getChannelIcon(channel)}
                          <span>{channel}</span>
                        </span>

                        {log.recipient && (
                          <span className="notifications-log-recipient">
                            {log.recipient}
                          </span>
                        )}

                        <span className={`notifications-log-status ${status}`}>
                          {getStatusIcon(status)}
                          <span>{t(`notifications.status.${status}`)}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      className="notifications-log-delete"
                      onClick={() => onDelete(logId)}
                      title={t('notifications.delete')}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantNotificationsPage;