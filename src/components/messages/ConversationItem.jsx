// src/components/messages/ConversationItem.jsx

import { useTranslation } from 'react-i18next';
import { RiAlertLine, RiInformationLine, RiQuestionLine } from 'react-icons/ri';
import './messages.css';

const ConversationItem = ({ conversation, isActive, onClick }) => {
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
  const getTypeIcon = () => {
    switch (conversation.type) {
      case 'warning':
        return <RiAlertLine className="conversation-type-icon warning" />;
      case 'info':
        return <RiInformationLine className="conversation-type-icon info" />;
      default:
        return <RiQuestionLine className="conversation-type-icon support" />;
    }
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''} ${conversation.unread_count > 0 ? 'unread' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-item-avatar">
        {conversation.restaurant_logo ? (
          <img src={conversation.restaurant_logo} alt={conversation.restaurant_name} />
        ) : (
          <span className="conversation-item-avatar-placeholder">
            {conversation.restaurant_name?.charAt(0) || 'R'}
          </span>
        )}
        {getTypeIcon()}
      </div>

      <div className="conversation-item-content">
        <div className="conversation-item-header">
          <span className="conversation-item-name">
            {conversation.restaurant_name}
          </span>
          <span className="conversation-item-time">
            {formatDate(conversation.last_message_at)}
          </span>
        </div>

        <div className="conversation-item-subject">
          {conversation.subject}
        </div>

        <div className="conversation-item-preview">
          {conversation.last_message}
        </div>
      </div>

      {conversation.unread_count > 0 && (
        <span className="conversation-item-badge">
          {conversation.unread_count}
        </span>
      )}
    </div>
  );
};

export default ConversationItem;