// src/hooks/useMessages.js

import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getUnreadCount
} from '../api/messages';
import useAuthStore from '../stores/authStore';

// ============================================
// 🔧 MOCK CONFIG - Mettre à false quand backend prêt
// ============================================
const USE_MOCK = true;

// ============================================
// 🔧 MOCK DATA
// ============================================
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    restaurant_id: 1,
    restaurant_name: 'Pizza Roma',
    restaurant_logo: null,
    subject: 'Question sur les commandes',
    type: 'support',
    status: 'open',
    last_message: 'Merci pour votre réponse !',
    last_message_at: new Date().toISOString(),
    unread_count: 2,
    created_by: 'restaurant',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    restaurant_id: 2,
    restaurant_name: 'Burger King',
    restaurant_logo: null,
    subject: 'Problème de paiement',
    type: 'support',
    status: 'open',
    last_message: 'Nous allons vérifier cela.',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0,
    created_by: 'restaurant',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 3,
    restaurant_id: 3,
    restaurant_name: 'Sushi Master',
    restaurant_logo: null,
    subject: 'Avertissement - Commandes en retard',
    type: 'warning',
    status: 'open',
    last_message: 'Veuillez améliorer vos délais.',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 1,
    created_by: 'admin',
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      conversation_id: 1,
      sender_type: 'restaurant',
      sender_id: 1,
      sender_name: 'Pizza Roma',
      content: 'Bonjour, j\'ai une question concernant les commandes annulées.',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      conversation_id: 1,
      sender_type: 'admin',
      sender_id: 1,
      sender_name: 'Admin',
      content: 'Bonjour ! Bien sûr, je vous écoute. Quel est le problème exactement ?',
      is_read: true,
      created_at: new Date(Date.now() - 82800000).toISOString()
    },
    {
      id: 3,
      conversation_id: 1,
      sender_type: 'restaurant',
      sender_id: 1,
      sender_name: 'Pizza Roma',
      content: 'Les commandes annulées apparaissent encore dans mon tableau de bord.',
      is_read: true,
      created_at: new Date(Date.now() - 79200000).toISOString()
    },
    {
      id: 4,
      conversation_id: 1,
      sender_type: 'admin',
      sender_id: 1,
      sender_name: 'Admin',
      content: 'Je comprends. C\'est normal, elles restent visibles pendant 24h pour le suivi. Après elles sont archivées automatiquement.',
      is_read: true,
      created_at: new Date(Date.now() - 75600000).toISOString()
    },
    {
      id: 5,
      conversation_id: 1,
      sender_type: 'restaurant',
      sender_id: 1,
      sender_name: 'Pizza Roma',
      content: 'Merci pour votre réponse !',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]
};

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Maintenance prévue',
    message: 'Une maintenance est prévue le 15 janvier de 02h à 04h. Le service sera indisponible.',
    type: 'warning',
    target: 'all',
    is_active: true,
    is_read: false,
    expires_at: new Date(Date.now() + 604800000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Nouvelle fonctionnalité disponible',
    message: 'Vous pouvez maintenant exporter vos commandes en PDF ! Découvrez cette nouvelle fonctionnalité dans la page Commandes.',
    type: 'info',
    target: 'all',
    is_active: true,
    is_read: true,
    expires_at: null,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

// ============================================
// HOOK
// ============================================

const useMessages = () => {
  // States
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auth store
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.userType === 'admin';

  // ============================================
  // CONVERSATIONS
  // ============================================

  // Charger les conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        // Simuler délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filtrer pour restaurant
        let data = [...MOCK_CONVERSATIONS];
        if (!isAdmin && user?.restaurantId) {
          data = data.filter(c => c.restaurant_id === user.restaurantId);
        }
        
        setConversations(data);
        return data;
      } else {
        const data = await getConversations();
        setConversations(data);
        return data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des conversations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.restaurantId]);

  // Sélectionner une conversation
  const selectConversation = useCallback(async (conversationId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
        setCurrentConversation(conv);
        setMessages(MOCK_MESSAGES[conversationId] || []);
        return conv;
      } else {
        const conv = await getConversationById(conversationId);
        setCurrentConversation(conv);
        const msgs = await getMessages(conversationId);
        setMessages(msgs);
        await markMessagesAsRead(conversationId);
        return conv;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement de la conversation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle conversation
  const startConversation = useCallback(async (data) => {
    setSending(true);
    setError(null);
    
    try {
      const newConv = {
        id: Date.now(),
        restaurant_id: data.restaurant_id,
        restaurant_name: data.restaurant_name || 'Restaurant',
        subject: data.subject,
        type: data.type || 'support',
        status: 'open',
        last_message: data.message,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        created_by: isAdmin ? 'admin' : 'restaurant',
        created_at: new Date().toISOString()
      };

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setConversations(prev => [newConv, ...prev]);
        setSuccess('Conversation créée avec succès');
        return newConv;
      } else {
        const result = await createConversation(data);
        setConversations(prev => [result, ...prev]);
        setSuccess('Conversation créée avec succès');
        return result;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      setError(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  }, [isAdmin]);

  // Fermer/Archiver une conversation
  const closeConversation = useCallback(async (conversationId) => {
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await updateConversation(conversationId, { status: 'closed' });
      }
      
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, status: 'closed' } : c)
      );
      setSuccess('Conversation fermée');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la fermeture';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Supprimer une conversation
  const removeConversation = useCallback(async (conversationId) => {
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await deleteConversation(conversationId);
      }
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      setSuccess('Conversation supprimée');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      return false;
    }
  }, [currentConversation?.id]);

  // ============================================
  // MESSAGES
  // ============================================

  // Envoyer un message
  const sendNewMessage = useCallback(async (content) => {
    if (!currentConversation) return null;
    
    setSending(true);
    setError(null);
    
    try {
      const newMessage = {
        id: Date.now(),
        conversation_id: currentConversation.id,
        sender_type: isAdmin ? 'admin' : 'restaurant',
        sender_id: user?.id || 1,
        sender_name: isAdmin ? 'Admin' : user?.restaurantName || 'Restaurant',
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessages(prev => [...prev, newMessage]);
        setConversations(prev => 
          prev.map(c => c.id === currentConversation.id 
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
          )
        );
        return newMessage;
      } else {
        const msg = await sendMessage(currentConversation.id, { content });
        setMessages(prev => [...prev, msg]);
        await fetchConversations();
        return msg;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'envoi';
      setError(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  }, [currentConversation, isAdmin, user, fetchConversations]);

  // Supprimer un message
  const removeMessage = useCallback(async (messageId) => {
    if (!currentConversation) return false;
    
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await deleteMessage(currentConversation.id, messageId);
      }
      
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setSuccess('Message supprimé');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      return false;
    }
  }, [currentConversation]);

  // ============================================
  // ANNOUNCEMENTS
  // ============================================

  // Charger les annonces
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnnouncements([...MOCK_ANNOUNCEMENTS]);
        return MOCK_ANNOUNCEMENTS;
      } else {
        const data = await getAnnouncements();
        setAnnouncements(data);
        return data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des annonces';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une annonce (Admin uniquement)
  const createNewAnnouncement = useCallback(async (data) => {
    if (!isAdmin) return null;
    
    setSending(true);
    setError(null);
    
    try {
      const newAnnouncement = {
        id: Date.now(),
        ...data,
        is_active: true,
        is_read: false,
        created_at: new Date().toISOString()
      };

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setSuccess('Annonce créée avec succès');
        return newAnnouncement;
      } else {
        const announcement = await createAnnouncement(data);
        setAnnouncements(prev => [announcement, ...prev]);
        setSuccess('Annonce créée avec succès');
        return announcement;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      setError(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  }, [isAdmin]);

  // Supprimer une annonce
  const removeAnnouncement = useCallback(async (announcementId) => {
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await deleteAnnouncement(announcementId);
      }
      
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      setSuccess('Annonce supprimée');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Marquer annonce comme lue
  const markAnnouncementRead = useCallback(async (announcementId) => {
    try {
      if (!USE_MOCK) {
        await markAnnouncementAsRead(announcementId);
      }
      
      setAnnouncements(prev => 
        prev.map(a => a.id === announcementId ? { ...a, is_read: true } : a)
      );
      return true;
    } catch (err) {
      console.error('Error marking announcement as read:', err);
      return false;
    }
  }, []);

  // ============================================
  // COMPTEURS
  // ============================================

  const calculateUnreadCount = useCallback(() => {
    const convUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
    const annUnread = announcements.filter(a => !a.is_read).length;
    setUnreadCount(convUnread + annUnread);
  }, [conversations, announcements]);

  // ============================================
  // UTILS
  // ============================================

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Charger au montage
  useEffect(() => {
    fetchConversations();
    fetchAnnouncements();
  }, []);

  // Calculer les non lus
  useEffect(() => {
    calculateUnreadCount();
  }, [calculateUnreadCount]);

  // Effacer les messages après 3s
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  return {
    // States
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

    // Conversations
    fetchConversations,
    selectConversation,
    startConversation,
    closeConversation,
    removeConversation,
    clearCurrentConversation,

    // Messages
    sendNewMessage,
    removeMessage,

    // Announcements
    fetchAnnouncements,
    createNewAnnouncement,
    removeAnnouncement,
    markAnnouncementRead,

    // Utils
    clearMessages
  };
};

export default useMessages;