// src/pages/Notifications/NotificationsPage.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import{ RiNotification3Line } from 'react-icons/ri';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { t } = useTranslation();
  
  const {
    settings,
    logs,
    loading,
    saving,
    error,
    success,
    saveSettings,
    updateSetting,
    fetchLogs,
    removeLog,
    clearMessages
  } = useNotifications();

  // États locaux
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');

  // Charger les logs quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'log') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  // Effacer les messages après 3 secondes
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  // Handlers
  const handleSave = async () => {
    await saveSettings(settings);
  };

  const handleDeleteLog = (id) => {
    setSelectedLogId(id);
    setShowConfirmDelete(true);
  };

  const confirmDeleteLog = async () => {
    if (selectedLogId) {
      await removeLog(selectedLogId);
      setShowConfirmDelete(false);
      setSelectedLogId(null);
    }
  };

  if (loading && !settings) {
    return (
      <div className="notifications-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      
      {/* Messages */}
      {error && <div className="notifications-message error">{error}</div>}
      {success && <div className="notifications-message success">{success}</div>}

      {/* Tabs */}
      <div className="notifications-tabs">
        <button
          className={`notifications-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          {t('notifications.settings')}
        </button>
        <button
          className={`notifications-tab ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          {t('notifications.log')}
        </button>
      </div>

      {/* Contenu */}
      {activeTab === 'settings' ? (
        <div className="notifications-grid">
          
          {/* Card Événements */}
          <div className="card notifications-card">
            <div className="notifications-card-header">
              <h2>{t('notifications.events')}</h2>
            </div>
            <div className="notifications-card-body">
              
              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.notify_owner_new_order}
                  onChange={(e) => updateSetting('notify_owner_new_order', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  {t('notifications.ownerNewOrder')}
                </span>
              </label>

              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.notify_client_order_created}
                  onChange={(e) => updateSetting('notify_client_order_created', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  {t('notifications.clientOrderCreated')}
                </span>
              </label>

              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.notify_client_status_change}
                  onChange={(e) => updateSetting('notify_client_status_change', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  {t('notifications.clientStatusChange')}
                </span>
              </label>

              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.notify_client_new_promotion}
                  onChange={(e) => updateSetting('notify_client_new_promotion', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  {t('notifications.clientNewPromotion')}
                </span>
              </label>

            </div>
          </div>

          {/* Card Canaux */}
          <div className="card notifications-card">
            <div className="notifications-card-header">
              <h2>{t('notifications.channels')}</h2>
            </div>
            <div className="notifications-card-body">
              
              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.channel_email}
                  onChange={(e) => updateSetting('channel_email', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  📧 {t('notifications.channelEmail')}
                </span>
              </label>

              <label className="notifications-toggle">
                <input
                  type="checkbox"
                  checked={settings.channel_push}
                  onChange={(e) => updateSetting('channel_push', e.target.checked)}
                />
                <span className="notifications-toggle-slider"></span>
                <span className="notifications-toggle-text">
                  🔔 {t('notifications.channelPush')}
                </span>
              </label>

            </div>
          </div>

        </div>
      ) : (
        /* Journal */
        <div className="card notifications-card notifications-log-card">
          <div className="notifications-card-header">
            <h2>{t('notifications.log')}</h2>
          </div>
          <div className="notifications-card-body">
            {loading ? (
              <LoadingSpinner />
            ) : logs.length === 0 ? (
              <div className="notifications-empty">
                <span className="notifications-empty-icon">📭</span>
                <p>{t('notifications.noLogs')}</p>
              </div>
            ) : (
              <div className="notifications-log-list">
                {logs.map((log) => (
                  <div key={log.id} className={`notifications-log-item ${log.status}`}>
                    <div className="notifications-log-item-header">
                      <span className={`notifications-log-type ${log.event_type}`}>
                        {t(`notifications.eventType.${log.event_type}`)}
                      </span>
                      <span className="notifications-log-date">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="notifications-log-item-body">
                      <h4>{log.title}</h4>
                      <p>{log.message}</p>
                    </div>
                    <div className="notifications-log-item-footer">
                      <span className="notifications-log-channel">
                        {log.channel === 'email' ? '📧' : '🔔'} {log.channel}
                      </span>
                      <span className={`notifications-log-status ${log.status}`}>
                        {t(`notifications.status.${log.status}`)}
                      </span>
                      <button
                        className="notifications-log-delete"
                        onClick={() => handleDeleteLog(log.id)}
                        title={t('notifications.delete')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bouton Sauvegarder (visible uniquement sur settings) */}
      {activeTab === 'settings' && (
        <div className="notifications-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('notifications.saving') : t('notifications.save')}
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDeleteLog}
        title={t('notifications.deleteTitle')}
        message={t('notifications.deleteConfirm')}
        confirmText={t('notifications.delete')}
        cancelText={t('notifications.cancel')}
      />
    </div>
  );
};

export default NotificationsPage;