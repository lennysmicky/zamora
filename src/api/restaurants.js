import client from './client';

export const restaurantsAPI = {
  // Récupérer tous les restaurants
  getAll: (params = {}) => 
    client.get('/restaurants', { params }),

  // Récupérer un restaurant par ID
  getById: (id) => 
    client.get(`/restaurants/${id}`),

  // Créer un restaurant
  create: (data) => 
    client.post('/restaurants', data),

  // Mettre à jour un restaurant
  update: (id, data) => 
    client.put(`/restaurants/${id}`, data),

  // Supprimer un restaurant
  delete: (id) => 
    client.delete(`/restaurants/${id}`),

  // Changer le statut (actif/inactif)
  toggleStatus: (id, status) => 
    client.patch(`/restaurants/${id}/status`, { status }),

  // Upload logo
  uploadLogo: (id, formData) => 
    client.post(`/restaurants/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default restaurantsAPI;