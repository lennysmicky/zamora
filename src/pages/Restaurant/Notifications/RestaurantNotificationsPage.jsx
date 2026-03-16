import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  RiSmartphoneLine,
} from "react-icons/ri";
import useNotifications from "../../../hooks/useNotifications";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RestaurantNotificationsPage.css";

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
    removeLog,
    clearMessages,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("settings");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  const loadLogsAndStats = useCallback(async () => {
    await Promise.all([fetchLogs(), fetchStats()]);
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    if (activeTab === "log") {
      loadLogsAndStats();
    }
  }, [activeTab, loadLogsAndStats]);

  const handleSave = async () => {
    await saveSettings(settings);
  };

  const handleRefresh = async () => {
    if (activeTab === "log") {
      await loadLogsAndStats();
    }
  };

  const handleDeleteLog = (id) => {
    if (!id) return;
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
      case "new_order":
      case "commande":
      case "newOrder":
        return <RiShoppingBag3Line />;
      case "status_change":
      case "changement_statut":
      case "statusOrderChanged":
        return <RiExchangeLine />;
      case "promotion":
        return <RiMegaphoneLine />;
      default:
        return <RiNotification3Line />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
      case "envoye":
        return <RiCheckboxCircleLine />;
      case "pending":
      case "en_attente":
        return <RiTimeLine />;
      case "failed":
      case "echec":
        return <RiCloseCircleLine />;
      default:
        return <RiTimeLine />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <RiMailLine />;
      case "push":
        return <RiNotification4Line />;
      case "sms":
        return <RiSmartphoneLine />;
      default:
        return <RiNotification4Line />;
    }
  };

  const getEventLabel = (eventType) => {
    switch (eventType) {
      case "new_order":
      case "newOrder":
      case "commande":
        return t("notifications.eventType.new_order", "Nouvelle commande");

      case "status_change":
      case "statusOrderChanged":
      case "changement_statut":
        return t("notifications.eventType.status_change", "Changement de statut");

      case "promotion":
        return t("notifications.eventType.promotion", "Promotion");

      default:
        return t("notifications.eventType.default", "Notification");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sent":
      case "envoye":
        return t("notifications.status.sent", "Envoyée");
      case "pending":
      case "en_attente":
        return t("notifications.status.pending", "En attente");
      case "failed":
      case "echec":
        return t("notifications.status.failed", "Échouée");
      default:
        return t("notifications.status.pending", "En attente");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const safeStats = {
    total: stats?.total ?? 0,
    sent: stats?.sent ?? 0,
    pending: stats?.pending ?? 0,
    failed: stats?.failed ?? 0,
  };

  const safeSettings = {
    events: {
      newOrder: settings?.events?.newOrder ?? true,
      orderClient: settings?.events?.orderClient ?? true,
      statusOrderChanged: settings?.events?.statusOrderChanged ?? true,
      promotion: settings?.events?.promotion ?? false,
    },
    channels: {
      email: settings?.channels?.email ?? true,
      push: settings?.channels?.push ?? false,
    },
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header-row">
        <div className="notifications-tabs">
          <button
            className={`notifications-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              clearMessages?.();
              setActiveTab("settings");
            }}
            type="button"
          >
            <RiSettings4Line />
            <span>{t("notifications.settings", "Paramètres")}</span>
          </button>

          <button
            className={`notifications-tab ${activeTab === "log" ? "active" : ""}`}
            onClick={() => {
              clearMessages?.();
              setActiveTab("log");
            }}
            type="button"
          >
            <RiFileList3Line />
            <span>{t("notifications.log", "Journal")}</span>
          </button>
        </div>

        <div className="notifications-header-actions">
          {activeTab === "log" && (
            <button
              className="notifications-btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
              title={t("common.refresh", "Rafraîchir")}
              type="button"
            >
              <RiRefreshLine className={loading ? "spin" : ""} />
            </button>
          )}

          {activeTab === "settings" && (
            <button
              className="notifications-btn-primary"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? <RiLoader4Line className="spin" /> : <RiSave3Line />}
              <span>
                {saving
                  ? t("notifications.saving", "Enregistrement...")
                  : t("notifications.save", "Enregistrer")}
              </span>
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

      {activeTab === "settings" ? (
        <SettingsTab settings={safeSettings} updateSetting={updateSetting} t={t} />
      ) : (
        <LogsTab
          logs={logs || []}
          stats={safeStats}
          loading={loading}
          onDelete={handleDeleteLog}
          getEventIcon={getEventIcon}
          getStatusIcon={getStatusIcon}
          getChannelIcon={getChannelIcon}
          getEventLabel={getEventLabel}
          getStatusLabel={getStatusLabel}
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
        title={t("notifications.deleteTitle", "Supprimer la notification")}
        message={t(
          "notifications.deleteConfirm",
          "Voulez-vous vraiment supprimer cette notification ?"
        )}
        confirmText={t("notifications.delete", "Supprimer")}
        cancelText={t("notifications.cancel", "Annuler")}
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
          <h3>{t("notifications.events", "Événements")}</h3>
        </div>

        <div className="notifications-card-body">
          <ToggleItem
            icon={<RiShoppingBag3Line />}
            label={t("notifications.ownerNewOrder", "Nouvelle commande restaurant")}
            checked={settings.events.newOrder}
            onChange={(value) => updateSetting("events.newOrder", value)}
          />

          <ToggleItem
            icon={<RiMailSendLine />}
            label={t("notifications.clientOrderCreated", "Commande créée côté client")}
            checked={settings.events.orderClient}
            onChange={(value) => updateSetting("events.orderClient", value)}
          />

          <ToggleItem
            icon={<RiExchangeLine />}
            label={t("notifications.clientStatusChange", "Changement de statut de commande")}
            checked={settings.events.statusOrderChanged}
            onChange={(value) => updateSetting("events.statusOrderChanged", value)}
          />

          <ToggleItem
            icon={<RiMegaphoneLine />}
            label={t("notifications.clientNewPromotion", "Promotion")}
            checked={settings.events.promotion}
            onChange={(value) => updateSetting("events.promotion", value)}
          />
        </div>
      </div>

      <div className="notifications-card">
        <div className="notifications-card-header">
          <RiMailLine />
          <h3>{t("notifications.channels", "Canaux")}</h3>
        </div>

        <div className="notifications-card-body">
          <ToggleItem
            icon={<RiMailLine />}
            label={t("notifications.channelEmail", "Email")}
            checked={settings.channels.email}
            onChange={(value) => updateSetting("channels.email", value)}
          />

          <ToggleItem
            icon={<RiNotification4Line />}
            label={t("notifications.channelPush", "Push")}
            checked={settings.channels.push}
            onChange={(value) => updateSetting("channels.push", value)}
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
  getEventLabel,
  getStatusLabel,
  formatDate,
  t,
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
            <span className="notifications-stat-label">
              {t("notifications.total", "Total")}
            </span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon success">
            <RiCheckboxCircleLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.sent}</span>
            <span className="notifications-stat-label">
              {t("notifications.status.sent", "Envoyées")}
            </span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon warning">
            <RiTimeLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.pending}</span>
            <span className="notifications-stat-label">
              {t("notifications.status.pending", "En attente")}
            </span>
          </div>
        </div>

        <div className="notifications-stat-card">
          <div className="notifications-stat-icon error">
            <RiCloseCircleLine />
          </div>
          <div className="notifications-stat-content">
            <span className="notifications-stat-value">{stats.failed}</span>
            <span className="notifications-stat-label">
              {t("notifications.status.failed", "Échouées")}
            </span>
          </div>
        </div>
      </div>

      <div className="notifications-card notifications-logs-card">
        <div className="notifications-card-header">
          <RiFileList3Line />
          <h3>{t("notifications.log", "Journal")}</h3>
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
              <h4>{t("notifications.noLogs", "Aucune notification disponible")}</h4>
            </div>
          ) : (
            <div className="notifications-log-list">
              {logs.map((log) => {
                const logId = log.id || log._id;
                const eventType = log.event_type || "default";
                const status = log.status || "pending";
                const channel = log.channel || "push";
                const title = log.title || "-";
                const message = log.message || "-";
                const createdAt = log.created_at || log.createdAt;

                return (
                  <div key={logId} className={`notifications-log-item ${status}`}>
                    <div className="notifications-log-icon">
                      {getEventIcon(eventType)}
                    </div>

                    <div className="notifications-log-content">
                      <div className="notifications-log-header">
                        <span className={`notifications-log-type ${eventType}`}>
                          {getEventLabel(eventType)}
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
                          <span>{getStatusLabel(status)}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      className="notifications-log-delete"
                      onClick={() => onDelete(logId)}
                      title={t("notifications.delete", "Supprimer")}
                      type="button"
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