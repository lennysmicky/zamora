// src/components/messages/ConversationList.jsx

import { useTranslation } from 'react-i18next';
import { RiMessage3Line } from 'react-icons/ri';
import ConversationItem from './ConversationItem';
import LoadingSpinner from '../common/LoadingSpinner';
import './messages.css';

const ConversationList = ({
  conversations = [],
  currentConversation,
  onSelectConversation,
  loading
}) => {
  const { t } = useTranslation();

  if (loading && conversations.length === 0) {
    return (
      <div className="conversation-list-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="conversation-list-empty">
        <RiMessage3Line className="conversation-list-empty-icon" />
        <p>{t('messages.noConversations')}</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={currentConversation?.id === conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;