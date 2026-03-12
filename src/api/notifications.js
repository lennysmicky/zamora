// src/api/notifications.js
import client from './client';

// =========================
// PARAMÈTRES DE NOTIFICATION
// =========================
// À conserver seulement si ces routes existent dans ton backend

export const getNotificationSettings = async (restaurantId = null) => {
  const url = restaurantId
    ? `/notifications/settings/${restaurantId}`
    : '/notifications/settings';

  const response = await client.get(url);
  return response.data;
};

export const updateNotificationSettings = async (data, restaurantId = null) => {
  const url = restaurantId
    ? `/notifications/settings/${restaurantId}`
    : '/notifications/settings';

  const response = await client.put(url, data);
  return response.data;
};

// =========================
// NOTIFICATIONS
// =========================

// Statistiques des notifications
export const getNotificationStats = async (params = {}) => {
  const response = await client.get('/notification/stats', { params });
  return response.data;
};

// Liste des notifications
export const getNotificationsLog = async (params = {}) => {
  const response = await client.get('/notification', { params });
  return response.data;
};

// Détail d'une notification
export const getNotificationById = async (id) => {
  const response = await client.get(`/notification/${id}`);
  return response.data;
};

// Créer une notification
export const createNotification = async (data) => {
  const response = await client.post('/notification', data);
  return response.data;
};

// Modifier une notification
export const updateNotification = async (id, data) => {
  const response = await client.put(`/notification/${id}`, data);
  return response.data;
};

// Supprimer une notification
export const deleteNotificationLog = async (id) => {
  const response = await client.delete(`/notification/${id}`);
  return response.data;
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId) => {
  const response = await client.put(`/notification/read/${notificationId}`);
  return response.data;
};

// Nombre de notifications non lues
export const getUnreadNotificationCount = async (userId) => {
  const response = await client.get(`/notification/count/${userId}`);
  return response.data;
};