// src/pages/Messages/MessagesPage.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiAddLine, 
  RiMegaphoneLine,
  RiMessage3Line,
  RiRefreshLine,
  RiLoader4Line,
  RiMailLine
} from 'react-icons/ri';
import useMessages from '../../hooks/useMessages';
import ConversationList from '../../components/messages/ConversationList';
import MessageThread from '../../components/messages/MessageThread';
import AnnouncementList from '../../components/messages/AnnouncementList';
import AnnouncementDetail from '../../components/messages/AnnouncementDetail';
import AnnouncementForm from '../../components/messages/AnnouncementForm';
import NewConversationModal from '../../components/messages/NewConversationModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './MessagesPage.css';

// ============================================
// 🔧 MOCK RESTAURANTS - À SUPPRIMER QUAND BACKEND PRÊT
// ============================================
const MOCK_RESTAURANTS = [
  { id: 1, name: 'Pizza Roma' },
  { id: 2, name: 'Burger King' },
  { id: 3, name: 'Sushi Master' },
  { id: 4, name: 'Taco Bell' },
  { id: 5, name: 'KFC' }
];
// ============================================

const MessagesPage = () => {
  const { t } = useTranslation();

  // Hook messages
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
    closeConversation,
    removeConversation,
    clearCurrentConversation,
    sendNewMessage,
    removeMessage,
    fetchAnnouncements,
    createNewAnnouncement,
    removeAnnouncement,
    markAnnouncementRead,
    clearMessages
  } = useMessages();

  // États locaux
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null });
  const [refreshing, setRefreshing] = useState(false);

  // Gérer la création de conversation
  const handleNewConversation = async (data) => {
    const result = await startConversation(data);
    if (result) {
      setShowNewConversation(false);
      selectConversation(result.id);
    }
  };

  // Gérer la création d'annonce
  const handleNewAnnouncement = async (data) => {
    const result = await createNewAnnouncement(data);
    if (result) {
      setShowNewAnnouncement(false);
    }
  };

  // Gérer la suppression
  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget.type === 'conversation') {
      await removeConversation(deleteTarget.id);
    } else if (deleteTarget.type === 'announcement') {
      await removeAnnouncement(deleteTarget.id);
      if (selectedAnnouncement?.id === deleteTarget.id) {
        setSelectedAnnouncement(null);
      }
    } else if (deleteTarget.type === 'message') {
      await removeMessage(deleteTarget.id);
    }
    setShowConfirmDelete(false);
    setDeleteTarget({ type: null, id: null });
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    if (refreshing || loading) return;
    
    setRefreshing(true);
    
    try {
      if (activeTab === 'conversations') {
        await fetchConversations();
      } else {
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Sélectionner une annonce
  const handleSelectAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    if (!announcement.is_read) {
      markAnnouncementRead(announcement.id);
    }
  };

  // Retour (fermer annonce ou conversation)
  const handleBack = () => {
    if (activeTab === 'conversations') {
      clearCurrentConversation();
    } else {
      setSelectedAnnouncement(null);
    }
  };

  // Changer d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearCurrentConversation();
    setSelectedAnnouncement(null);
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
                onClick={() => handleTabChange('conversations')}
              >
                <RiMessage3Line />
                <span>{t('messages.conversations')}</span>
                {unreadCount > 0 && (
                  <span className="messages-sidebar-tab-badge">{unreadCount}</span>
                )}
              </button>
              <button
                className={`messages-sidebar-tab ${activeTab === 'announcements' ? 'active' : ''}`}
                onClick={() => handleTabChange('announcements')}
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
                className={`messages-sidebar-action-btn ${refreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={refreshing || loading}
                title={t('messages.refresh')}
              >
                {refreshing ? (
                  <RiLoader4Line className="spin" />
                ) : (
                  <RiRefreshLine />
                )}
              </button>
              <button
                className="messages-sidebar-action-btn primary"
                onClick={() => activeTab === 'conversations' 
                  ? setShowNewConversation(true) 
                  : setShowNewAnnouncement(true)
                }
                title={activeTab === 'conversations' 
                  ? t('messages.newConversation') 
                  : t('messages.newAnnouncement')
                }
              >
                <RiAddLine />
              </button>
            </div>
          </div>

          {/* Contenu sidebar */}
          <div className="messages-sidebar-content">
            {activeTab === 'conversations' ? (
              <ConversationList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={selectConversation}
                loading={loading && !refreshing}
              />
            ) : (
              <AnnouncementList
                announcements={announcements}
                loading={loading && !refreshing}
                selectedAnnouncementId={selectedAnnouncement?.id}
                onSelectAnnouncement={handleSelectAnnouncement}
                onMarkAsRead={markAnnouncementRead}
                onDelete={(id) => handleDelete('announcement', id)}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>

        {/* Zone principale */}
        <div className="messages-main">
          {activeTab === 'conversations' ? (
            currentConversation ? (
              <MessageThread
                conversation={currentConversation}
                messages={messages}
                loading={loading}
                sending={sending}
                onSendMessage={sendNewMessage}
                onBack={handleBack}
                onDeleteMessage={(id) => handleDelete('message', id)}
                isAdmin={isAdmin}
              />
            ) : (
              <div className="messages-main-empty">
                <RiMailLine className="messages-main-empty-icon" />
                <h3>{t('messages.selectConversation')}</h3>
                <p>{t('messages.selectConversationDesc')}</p>
                {/* <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewConversation(true)}
                >
                  <RiAddLine />
                  {t('messages.newConversation')}
                </button> */}
              </div>
            )
          ) : (
            selectedAnnouncement ? (
              <AnnouncementDetail
                announcement={selectedAnnouncement}
                onBack={handleBack}
                onMarkAsRead={() => markAnnouncementRead(selectedAnnouncement?.id)}
                onDelete={() => handleDelete('announcement', selectedAnnouncement?.id)}
                isAdmin={isAdmin}
              />
            ) : (
              <div className="messages-main-empty">
                <RiMegaphoneLine className="messages-main-empty-icon" />
                <h3>{t('messages.selectAnnouncement')}</h3>
                <p>{t('messages.selectAnnouncementDesc')}</p>
                {/* {isAdmin && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowNewAnnouncement(true)}
                  >
                    <RiAddLine />
                    {t('messages.newAnnouncement')}
                  </button>
                )} */}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal nouvelle conversation */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSubmit={handleNewConversation}
        sending={sending}
        restaurants={MOCK_RESTAURANTS}
        isAdmin={isAdmin}
      />

      {/* Modal nouvelle annonce */}
      <AnnouncementForm
        isOpen={showNewAnnouncement}
        onClose={() => setShowNewAnnouncement(false)}
        onSubmit={handleNewAnnouncement}
        sending={sending}
      />

      {/* Dialog de confirmation suppression */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title={t('messages.deleteTitle')}
        message={
          deleteTarget.type === 'conversation'
            ? t('messages.deleteConversationConfirm')
            : deleteTarget.type === 'announcement'
            ? t('messages.deleteAnnouncementConfirm')
            : t('messages.deleteMessageConfirm')
        }
        confirmText={t('messages.delete')}
        cancelText={t('messages.cancel')}
      />
    </div>
  );
};

export default MessagesPage;