// src/components/messages/AnnouncementDetail.jsx

import { useTranslation } from 'react-i18next';
import { 
  RiArrowLeftLine,
  RiMegaphoneLine,
  RiAlertLine,
  RiInformationLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiTimeLine
} from 'react-icons/ri';
import './messages.css';

const AnnouncementDetail = ({ 
  announcement, 
  onBack,
  onMarkAsRead,
  onDelete,
  isAdmin 
}) => {
  const { t } = useTranslation();

  if (!announcement) {
    return (
      <div className="announcement-detail-empty">
        <RiMegaphoneLine className="announcement-detail-empty-icon" />
        <h3>{t('messages.selectAnnouncement')}</h3>
        <p>{t('messages.selectAnnouncementDesc')}</p>
      </div>
    );
  }

  // Icône selon le type
  const getIcon = () => {
    switch (announcement.type) {
      case 'urgent':
      case 'warning':
        return <RiAlertLine />;
      case 'info':
        return <RiInformationLine />;
      default:
        return <RiMegaphoneLine />;
    }
  };

  // Formater la date complète
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="announcement-detail">
      {/* Header */}
      <div className="announcement-detail-header">
        <button className="announcement-detail-back" onClick={onBack}>
          <RiArrowLeftLine />
        </button>
        
        <div className="announcement-detail-header-info">
          <div className={`announcement-detail-icon ${announcement.type || 'info'}`}>
            {getIcon()}
          </div>
          <div className="announcement-detail-header-text">
            <h3>{announcement.title}</h3>
            <div className="announcement-detail-meta">
              <RiTimeLine />
              <span>{formatFullDate(announcement.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="announcement-detail-header-actions">
          {!announcement.is_read && (
            <button 
              className="announcement-detail-action-btn"
              onClick={onMarkAsRead}
              title={t('messages.markAsRead')}
            >
              <RiCheckLine />
            </button>
          )}
          {isAdmin && (
            <button 
              className="announcement-detail-action-btn delete"
              onClick={onDelete}
              title={t('common.delete')}
            >
              <RiDeleteBinLine />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="announcement-detail-body">
        <div className={`announcement-detail-type-badge ${announcement.type || 'info'}`}>
          {t(`messages.announcementTypes.${announcement.type || 'info'}`)}
        </div>
        
        <div className="announcement-detail-content">
          {announcement.message}
        </div>

        {announcement.expires_at && (
          <div className="announcement-detail-expires">
            {t('messages.expiresAt')}: {formatFullDate(announcement.expires_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetail;