// src/components/messages/MessageBubble.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiCheckDoubleLine, RiCheckLine, RiDeleteBinLine } from 'react-icons/ri';
import './messages.css';

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  // Formater l'heure
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formater la date complète si pas aujourd'hui
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString);
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `${t('messages.yesterday')} ${formatTime(dateString)}`;
    }
    
    return `${date.toLocaleDateString()} ${formatTime(dateString)}`;
  };

  return (
    <div 
      className={`message-bubble-wrapper ${isOwn ? 'own' : 'other'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <div className="message-bubble-sender">
          {message.sender_name}
        </div>
      )}
      
      <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
        <div className="message-bubble-content">
          {message.content}
        </div>
        
        <div className="message-bubble-meta">
          <span className="message-bubble-time">
            {formatDate(message.created_at)}
          </span>
          {isOwn && (
            <span className="message-bubble-status">
              {message.is_read ? (
                <RiCheckDoubleLine className="read" />
              ) : (
                <RiCheckLine />
              )}
            </span>
          )}
        </div>

        {/* Actions (delete) */}
        {showActions && isOwn && (
          <div className="message-bubble-actions">
            <button
              className="message-bubble-action-btn"
              onClick={onDelete}
              title={t('messages.deleteMessage')}
            >
              <RiDeleteBinLine />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;