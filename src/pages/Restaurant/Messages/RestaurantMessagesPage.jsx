// src/pages/Restaurant/Messages/RestaurantMessagesPage.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiAddLine, 
  RiMegaphoneLine,
  RiMessage3Line,
  RiRefreshLine
} from 'react-icons/ri';
import useMessages from '../../../hooks/useMessages';
import ConversationList from '../../../components/messages/ConversationList';
import MessageThread from '../../../components/messages/MessageThread';
import AnnouncementList from '../../../components/messages/AnnouncementList';
import NewConversationModal from '../../../components/messages/NewConversationModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import '../../Messages/MessagesPage.css';

const RestaurantMessagesPage = () => {
  const { t } = useTranslation();

  // Hook messages (auto-détecte restaurantId via authStore)
  const {
    conversations,
    currentConversation,
    messages,
    announcements,
    unreadCount,
    loading,
    sending,
    error,
    success,
    isAdmin,
    fetchConversations,
    selectConversation,
    startConversation,
    clearCurrentConversation,
    sendNewMessage,
    removeMessage,
    fetchAnnouncements,
    markAnnouncementRead,
    clearMessages
  } = useMessages();

  // États locaux
  const [activeTab, setActiveTab] = useState('conversations');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);

  // Gérer la création de conversation (vers Admin uniquement)
  const handleNewConversation = async (data) => {
    const result = await startConversation({
      ...data,
      restaurant_id: null, // Restaurant envoie toujours à Admin
      type: 'support'
    });
    if (result) {
      setShowNewConversation(false);
      selectConversation(result.id);
    }
  };

  // Gérer la suppression de message
  const handleDeleteMessage = (messageId) => {
    setDeleteMessageId(messageId);
    setShowConfirmDelete(true);
  };

  const confirmDeleteMessage = async () => {
    if (deleteMessageId) {
      await removeMessage(deleteMessageId);
      setShowConfirmDelete(false);
      setDeleteMessageId(null);
    }
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    fetchConversations();
    fetchAnnouncements();
  };

  // Compter les annonces non lues
  const unreadAnnouncements = announcements.filter(a => !a.is_read).length;

  return (
    <div className="messages-page">
      
      {/* Messages d'erreur/succès */}
      {error && (
        <div className="messages-alert error">
          {error}
        </div>
      )}
      {success && (
        <div className="messages-alert success">
          {success}
        </div>
      )}

      {/* Container principal */}
      <div className="messages-container">
        
        {/* Sidebar gauche */}
        <div className="messages-sidebar">
          
          {/* Header sidebar */}
          <div className="messages-sidebar-header">
            <div className="messages-sidebar-tabs">
              <button
                className={`messages-sidebar-tab ${activeTab === 'conversations' ? 'active' : ''}`}
                onClick={() => setActiveTab('conversations')}
              >
                <RiMessage3Line />
                <span>{t('messages.conversations')}</span>
                {unreadCount > 0 && (
                  <span className="messages-sidebar-tab-badge">{unreadCount}</span>
                )}
              </button>
              <button
                className={`messages-sidebar-tab ${activeTab === 'announcements' ? 'active' : ''}`}
                onClick={() => setActiveTab('announcements')}
              >
                <RiMegaphoneLine />
                <span>{t('messages.announcements')}</span>
                {unreadAnnouncements > 0 && (
                  <span className="messages-sidebar-tab-badge">{unreadAnnouncements}</span>
                )}
              </button>
            </div>

            <div className="messages-sidebar-actions">
              <button
                className="messages-sidebar-action-btn"
                onClick={handleRefresh}
                title={t('messages.refresh')}
              >
                <RiRefreshLine />
              </button>
              {activeTab === 'conversations' && (
                <button
                  className="messages-sidebar-action-btn primary"
                  onClick={() => setShowNewConversation(true)}
                  title={t('messages.contactSupport')}
                >
                  <RiAddLine />
                </button>
              )}
            </div>
          </div>

          {/* Contenu sidebar */}
          <div className="messages-sidebar-content">
            {activeTab === 'conversations' ? (
              <ConversationList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={selectConversation}
                loading={loading}
              />
            ) : (
              <AnnouncementList
                announcements={announcements}
                loading={loading}
                onMarkAsRead={markAnnouncementRead}
                onDelete={() => {}} // Restaurant ne peut pas supprimer
                isAdmin={false}
              />
            )}
          </div>
        </div>

        {/* Zone principale (Thread) */}
        <div className="messages-main">
          {activeTab === 'conversations' ? (
            <MessageThread
              conversation={currentConversation}
              messages={messages}
              loading={loading}
              sending={sending}
              onSendMessage={sendNewMessage}
              onClose={clearCurrentConversation}
              onDeleteMessage={handleDeleteMessage}
              isAdmin={false}
            />
          ) : (
            <div className="messages-main-empty">
              <RiMessage3Line className="conversation-list-empty-icon" />
              <h3>{t('messages.announcementsTitle')}</h3>
              <p>{t('messages.announcementsRestaurantDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle conversation (vers Support) */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSubmit={handleNewConversation}
        sending={sending}
        restaurants={[]}
        isAdmin={false}
      />

      {/* Dialog de confirmation suppression message */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDeleteMessage}
        title={t('messages.deleteTitle')}
        message={t('messages.deleteMessageConfirm')}
        confirmText={t('messages.delete')}
        cancelText={t('messages.cancel')}
      />
    </div>
  );
};

export default RestaurantMessagesPage;