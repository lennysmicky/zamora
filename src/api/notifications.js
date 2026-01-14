// src/api/notifications.js

import client from './client';

// Récupérer les paramètres de notification
export const getNotificationSettings = async (restaurantId = null) => {
  const url = restaurantId 
    ? `/notifications/settings/${restaurantId}` 
    : '/notifications/settings';
  const response = await client.get(url);
  return response.data;
};

// Mettre à jour les paramètres de notification
export const updateNotificationSettings = async (data, restaurantId = null) => {
  const url = restaurantId 
    ? `/notifications/settings/${restaurantId}` 
    : '/notifications/settings';
  const response = await client.put(url, data);
  return response.data;
};

// Récupérer le journal des notifications (optionnel)
export const getNotificationsLog = async (params = {}) => {
  const response = await client.get('/notifications/log', { params });
  return response.data;
};

// Supprimer une entrée du journal
export const deleteNotificationLog = async (id) => {
  const response = await client.delete(`/notifications/log/${id}`);
  return response.data;
};