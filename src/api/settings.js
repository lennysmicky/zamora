// src/api/settings.js
import client from "./client";

const unwrap = (res) => {
  let v = res?.data;
  for (let i = 0; i < 3; i++) {
    if (!v || typeof v !== "object") break;
    v = v.data ?? v.result ?? v.restaurant ?? v;
  }
  return v;
};

// Route correcte pour le changement de mot de passe
const CHANGE_PASSWORD_ROUTE = "/user/change_password";

export const settingsApi = {
  // Récupérer les infos du restaurant
  getRestaurantInfo: async (restaurantId) => {
    const res = await client.get(`/restaurent/${restaurantId}`);
    return unwrap(res);
  },

  // Modifier les infos du restaurant
  updateRestaurantInfo: async (restaurantId, data) => {
    const res = await client.put(`/restaurent/${restaurantId}`, data);
    return unwrap(res);
  },

  // Modifier le logo
  updateLogo: async (restaurantId, formData) => {
    const res = await client.put(`/restaurent/${restaurantId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },

  // Changer le mot de passe
  changePassword: async (data) => {
    const res = await client.put(CHANGE_PASSWORD_ROUTE, data);
    return unwrap(res);
  },

  // Changer le statut : ouvert / ferme
  changeRestaurantStatus: async (restaurantId, status) => {
    const res = await client.put(`/restaurent/status/${restaurantId}`, {
      status,
    });
    return unwrap(res);
  },

  // Supprimer le compte
  deleteAccount: async (restaurantId, password) => {
    const res = await client.delete(`/user/${restaurantId}`, {
      data: { password },
    });
    return unwrap(res);
  },
};

export default settingsApi;