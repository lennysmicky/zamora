// src/api/messages.js

import client from './client';

// ============================================
// CONVERSATIONS
// ============================================

// Récupérer toutes les conversations
export const getConversations = async (params = {}) => {
  const response = await client.get('/conversations', { params });
  return response.data;
};

// Récupérer une conversation par ID
export const getConversationById = async (id) => {
  const response = await client.get(`/conversations/${id}`);
  return response.data;
};

// Créer une nouvelle conversation
export const createConversation = async (data) => {
  const response = await client.post('/conversations', data);
  return response.data;
};

// Mettre à jour une conversation (statut)
export const updateConversation = async (id, data) => {
  const response = await client.put(`/conversations/${id}`, data);
  return response.data;
};

// Supprimer/Archiver une conversation
export const deleteConversation = async (id) => {
  const response = await client.delete(`/conversations/${id}`);
  return response.data;
};

// ============================================
// MESSAGES
// ============================================

// Récupérer les messages d'une conversation
export const getMessages = async (conversationId, params = {}) => {
  const response = await client.get(`/conversations/${conversationId}/messages`, { params });
  return response.data;
};

// Envoyer un message
export const sendMessage = async (conversationId, data) => {
  const response = await client.post(`/conversations/${conversationId}/messages`, data);
  return response.data;
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId) => {
  const response = await client.put(`/conversations/${conversationId}/messages/read`);
  return response.data;
};

// Supprimer un message
export const deleteMessage = async (conversationId, messageId) => {
  const response = await client.delete(`/conversations/${conversationId}/messages/${messageId}`);
  return response.data;
};

// ============================================
// ANNOUNCEMENTS (Admin uniquement)
// ============================================

// Récupérer toutes les annonces
export const getAnnouncements = async (params = {}) => {
  const response = await client.get('/announcements', { params });
  return response.data;
};

// Créer une annonce
export const createAnnouncement = async (data) => {
  const response = await client.post('/announcements', data);
  return response.data;
};

// Mettre à jour une annonce
export const updateAnnouncement = async (id, data) => {
  const response = await client.put(`/announcements/${id}`, data);
  return response.data;
};

// Supprimer une annonce
export const deleteAnnouncement = async (id) => {
  const response = await client.delete(`/announcements/${id}`);
  return response.data;
};

// Marquer une annonce comme lue (Restaurant)
export const markAnnouncementAsRead = async (id) => {
  const response = await client.post(`/announcements/${id}/read`);
  return response.data;
};

// ============================================
// COMPTEURS
// ============================================

// Récupérer le nombre de messages non lus
export const getUnreadCount = async () => {
  const response = await client.get('/messages/unread-count');
  return response.data;
};