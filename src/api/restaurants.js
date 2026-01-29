import client from './client';

/**
 * API pour gérer les restaurants
 * Endpoint backend : /restaurent
 */
export const restaurantsAPI = {
  // Récupérer tous les restaurants avec params optionnels
  getAll: (params = {}) => client.get('/restaurent', { params }),

  // Récupérer un restaurant par ID
  getById: (id) => client.get(`/restaurent/${id}`),

  // Créer un nouveau restaurant
  create: (data) => client.post('/restaurent', data),

  // Mettre à jour un restaurant existant
  update: (id, data) => client.put(`/restaurent/${id}`, data),

  // Supprimer un restaurant
  delete: (id) => client.delete(`/restaurent/${id}`),

  // Changer le statut (actif/inactif) - si le backend le supporte
  toggleStatus: (id, status) => client.patch(`/restaurent/${id}/status`, { status }),

  // Upload du logo
  uploadLogo: (id, formData) =>
    client.post(`/restaurent/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default restaurantsAPI;
