// src/components/messages/MessageThread.jsx

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RiCloseLine, RiMoreLine, RiCheckDoubleLine } from 'react-icons/ri';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../common/LoadingSpinner';
import './messages.css';

const MessageThread = ({
  conversation,
  messages,
  loading,
  sending,
  onSendMessage,
  onClose,
  onDeleteMessage,
  isAdmin
}) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);

  // Scroll to bottom quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="message-thread-empty">
        <RiCheckDoubleLine className="message-thread-empty-icon" />
        <h3>{t('messages.selectConversation')}</h3>
        <p>{t('messages.selectConversationDesc')}</p>
      </div>
    );
  }

  return (
    <div className="message-thread">
      {/* Header */}
      <div className="message-thread-header">
        <div className="message-thread-header-info">
          <div className="message-thread-avatar">
            {conversation.restaurant_logo ? (
              <img src={conversation.restaurant_logo} alt={conversation.restaurant_name} />
            ) : (
              <span>{conversation.restaurant_name?.charAt(0) || 'R'}</span>
            )}
          </div>
          <div className="message-thread-header-text">
            <h3>{conversation.restaurant_name}</h3>
            <p>{conversation.subject}</p>
          </div>
        </div>

        <div className="message-thread-header-actions">
          <button className="message-thread-action-btn" title={t('messages.moreOptions')}>
            <RiMoreLine />
          </button>
          <button 
            className="message-thread-action-btn"
            onClick={onClose}
            title={t('messages.close')}
          >
            <RiCloseLine />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="message-thread-body">
        {loading ? (
          <div className="message-thread-loading">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="message-thread-no-messages">
            <p>{t('messages.noMessages')}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={
                  (isAdmin && message.sender_type === 'admin') ||
                  (!isAdmin && message.sender_type === 'restaurant')
                }
                onDelete={() => onDeleteMessage(message.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="message-thread-footer">
        <MessageInput
          onSend={onSendMessage}
          sending={sending}
          disabled={conversation.status === 'closed'}
          placeholder={
            conversation.status === 'closed'
              ? t('messages.conversationClosed')
              : t('messages.typeMessage')
          }
        />
      </div>
    </div>
  );
};

export default MessageThread;