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

export const settingsApi = {
  //  Récupérer les infos du restaurant
  getRestaurantInfo: async (restaurantId) => {
    const res = await client.get(`/restaurent/${restaurantId}`);
    return unwrap(res);
  },

  //  Mettre à jour les infos du restaurant (nom, email, téléphone, adresse)
  updateRestaurantInfo: async (restaurantId, data) => {
    const res = await client.put(`/restaurent/${restaurantId}`, data);
    return unwrap(res);
  },

  //  Mettre à jour le logo
  updateLogo: async (restaurantId, formData) => {
    const res = await client.put(`/restaurent/${restaurantId}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return unwrap(res);
  },

  //  Changer le mot de passe
  changePassword: async (restaurantId, data) => {
    // data = { currentPassword, newPassword, confirmPassword }
    const res = await client.put(`/restaurent/${restaurantId}/password`, data);
    return unwrap(res);
  },

  //  Activer le restaurant
  activateRestaurant: async (restaurantId) => {
    const res = await client.put(`/restaurent/${restaurantId}/activate`);
    return unwrap(res);
  },

  //  Désactiver le restaurant
  deactivateRestaurant: async (restaurantId) => {
    const res = await client.put(`/restaurent/${restaurantId}/deactivate`);
    return unwrap(res);
  },

  //  Supprimer le compte restaurant
  deleteAccount: async (restaurantId, password) => {
    const res = await client.delete(`/restaurent/${restaurantId}`, {
      data: { password }
    });
    return unwrap(res);
  },
};

export default settingsApi;