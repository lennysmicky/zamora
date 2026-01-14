// src/components/messages/MessageInput.jsx

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RiSendPlaneFill, RiEmotionLine, RiAttachmentLine } from 'react-icons/ri';
import './messages.css';

const MessageInput = ({ onSend, sending, disabled, placeholder }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Gérer l'envoi
  const handleSend = () => {
    if (message.trim() && !sending && !disabled) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Gérer Enter pour envoyer
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={`message-input ${disabled ? 'disabled' : ''}`}>
      <button 
        className="message-input-action"
        title={t('messages.attachFile')}
        disabled={disabled}
      >
        <RiAttachmentLine />
      </button>

      <div className="message-input-field">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('messages.typeMessage')}
          disabled={disabled}
          rows={1}
        />
      </div>

      <button 
        className="message-input-action"
        title={t('messages.emoji')}
        disabled={disabled}
      >
        <RiEmotionLine />
      </button>

      <button
        className={`message-input-send ${message.trim() ? 'active' : ''}`}
        onClick={handleSend}
        disabled={!message.trim() || sending || disabled}
        title={t('messages.send')}
      >
        {sending ? (
          <span className="message-input-sending"></span>
        ) : (
          <RiSendPlaneFill />
        )}
      </button>
    </div>
  );
};

export default MessageInput;