// src/components/messages/AnnouncementList.jsx

import { useTranslation } from 'react-i18next';
import { RiMegaphoneLine } from 'react-icons/ri';
import AnnouncementItem from './AnnouncementItem';
import LoadingSpinner from '../common/LoadingSpinner';
import './messages.css';

const AnnouncementList = ({
  announcements,
  loading,
  selectedAnnouncementId,
  onSelectAnnouncement,
  onMarkAsRead,
  onDelete,
  isAdmin
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="announcement-list-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="announcement-list-empty">
        <RiMegaphoneLine className="announcement-list-empty-icon" />
        <p>{t('messages.noAnnouncements')}</p>
      </div>
    );
  }

  return (
    <div className="announcement-list">
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          isActive={selectedAnnouncementId === announcement.id}
          onClick={() => onSelectAnnouncement(announcement)}
          onMarkAsRead={() => onMarkAsRead(announcement.id)}
          onDelete={() => onDelete(announcement.id)}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;