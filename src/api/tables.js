// src/api/tables.js
import client from "./client";

const unwrap = (res) => {
  let v = res?.data;
  for (let i = 0; i < 3; i++) {
    if (!v || typeof v !== "object") break;
    v = v.data ?? v.result ?? v.tables ?? v;
  }
  return v;
};

export const tablesApi = {
  // Récupérer toutes les tables d'un restaurant
  getTables: async (restaurantId) => {
    if (!restaurantId) return [];
    const res = await client.get(`/table/${restaurantId}`);
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  // Récupérer une table par ID
  getTable: async (tableId) => {
    const res = await client.get(`/table/single/${tableId}`);
    return unwrap(res);
  },

  // Créer une nouvelle table
  createTable: async (restaurantId, data) => {
    const res = await client.post(`/table/${restaurantId}`, data);
    return unwrap(res);
  },

  // Créer plusieurs tables d'un coup
  createMultipleTables: async (restaurantId, count) => {
    const res = await client.post(`/table/${restaurantId}/bulk`, { count });
    return unwrap(res);
  },

  // Mettre à jour une table
  updateTable: async (tableId, data) => {
    const res = await client.put(`/table/${tableId}`, data);
    return unwrap(res);
  },

  // Supprimer une table
  deleteTable: async (tableId) => {
    const res = await client.delete(`/table/${tableId}`);
    return unwrap(res);
  },

  // Changer le statut d'une table (libre, occupée, réservée)
  updateStatus: async (tableId, status) => {
    const res = await client.patch(`/table/${tableId}/status`, { status });
    return unwrap(res);
  },

  // Régénérer le QR code d'une table
  regenerateQR: async (tableId) => {
    const res = await client.post(`/table/${tableId}/regenerate-qr`);
    return unwrap(res);
  },

  // Récupérer les stats des tables
  getStats: async (restaurantId) => {
    if (!restaurantId) return { total: 0, libre: 0, occupee: 0, reservee: 0 };
    try {
      const res = await client.get(`/table/${restaurantId}/stats`);
      return unwrap(res) || { total: 0, libre: 0, occupee: 0, reservee: 0 };
    } catch {
      return { total: 0, libre: 0, occupee: 0, reservee: 0 };
    }
  },

  // Générer l'URL du menu pour le QR
  getMenuUrl: (restaurantId, tableId, tableNumber) => {
    const baseUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
    return `${baseUrl}/menu/${restaurantId}?table=${tableId}&numero=${tableNumber}`;
  },
};

export default tablesApi;