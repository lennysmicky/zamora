// src/components/messages/AnnouncementItem.jsx

import { useTranslation } from 'react-i18next';
import { 
  RiCheckLine, 
  RiDeleteBinLine,
  RiMegaphoneLine,
  RiAlertLine,
  RiInformationLine
} from 'react-icons/ri';
import './messages.css';

const AnnouncementItem = ({ 
  announcement, 
  isActive,
  onClick,
  onMarkAsRead, 
  onDelete, 
  isAdmin 
}) => {
  const { t } = useTranslation();

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('messages.time.now');
    if (diffMins < 60) return t('messages.time.minutes', { count: diffMins });
    if (diffHours < 24) return t('messages.time.hours', { count: diffHours });
    if (diffDays < 7) return t('messages.time.days', { count: diffDays });
    return date.toLocaleDateString();
  };

  // Icône selon le type
  const getIcon = () => {
    switch (announcement.type) {
      case 'urgent':
        return <RiAlertLine />;
      case 'warning':
        return <RiAlertLine />;
      case 'info':
        return <RiInformationLine />;
      default:
        return <RiMegaphoneLine />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Marquer comme lu au clic
    if (!announcement.is_read && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  return (
    <div 
      className={`announcement-item ${announcement.type || 'info'} ${!announcement.is_read ? 'unread' : ''} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className="announcement-item-icon">
        {getIcon()}
      </div>

      <div className="announcement-item-content">
        <div className="announcement-item-header">
          <span className="announcement-item-title">
            {announcement.title}
          </span>
          <span className="announcement-item-date">
            {formatDate(announcement.created_at)}
          </span>
        </div>

        <p className="announcement-item-text">
          {announcement.message}
        </p>
      </div>

      <div className="announcement-item-actions">
        {!announcement.is_read && (
          <button 
            className="announcement-item-action-btn mark-read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
            title={t('messages.markAsRead')}
          >
            <RiCheckLine />
          </button>
        )}
        {isAdmin && (
          <button 
            className="announcement-item-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title={t('common.delete')}
          >
            <RiDeleteBinLine />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementItem;