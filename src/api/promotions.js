import client from './client';

export const promotionsAPI = {
  // Récupérer toutes les promotions
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return client.get(`/promotions${queryString ? `?${queryString}` : ''}`);
  },

  // Récupérer une promotion par ID
  getById: (id) => {
    return client.get(`/promotions/${id}`);
  },

  // Récupérer les promotions d'un restaurant
  getByRestaurant: (restaurantId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return client.get(`/restaurants/${restaurantId}/promotions${queryString ? `?${queryString}` : ''}`);
  },

  // Créer une promotion
  create: (data) => {
    return client.post('/promotions', data);
  },

  // Mettre à jour une promotion
  update: (id, data) => {
    return client.put(`/promotions/${id}`, data);
  },

  // Supprimer une promotion
  delete: (id) => {
    return client.delete(`/promotions/${id}`);
  },

  // Activer/Désactiver une promotion
  toggleStatus: (id) => {
    return client.patch(`/promotions/${id}/toggle`);
  },

  // Récupérer les stats des promotions
  getStats: () => {
    return client.get('/promotions/stats');
  }
};

export default promotionsAPI;