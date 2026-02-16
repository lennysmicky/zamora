// src/api/specialOffers.js
import client from './client';

const specialOffersApi = {
  // Récupérer toutes les offres
  getAll: (params = {}) => {
    return client.get('/special-offers', { params });
  },

  // Récupérer une offre par ID
  getById: (id) => {
    return client.get(`/special-offers/${id}`);
  },

  // Créer une offre
  create: (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return client.post('/special-offers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Mettre à jour une offre
  update: (id, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return client.put(`/special-offers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Supprimer une offre
  delete: (id) => {
    return client.delete(`/special-offers/${id}`);
  },

  // Activer/Désactiver une offre
  toggleStatus: (id, isActive) => {
    return client.patch(`/special-offers/${id}/status`, { isActive });
  },

  // Dupliquer une offre
  duplicate: (id) => {
    return client.post(`/special-offers/${id}/duplicate`);
  },

  // Récupérer les stats d'une offre
  getStats: (id) => {
    return client.get(`/special-offers/${id}/stats`);
  },

  // Récupérer les stats globales
  getGlobalStats: (params = {}) => {
    return client.get('/special-offers/stats', { params });
  },

  // Récupérer l'historique d'une offre
  getHistory: (id) => {
    return client.get(`/special-offers/${id}/history`);
  },

  // Générer un code promo
  generatePromoCode: () => {
    return client.get('/special-offers/generate-code');
  },

  // Valider un code promo (vérifier s'il existe déjà)
  validatePromoCode: (code) => {
    return client.get(`/special-offers/validate-code/${code}`);
  }
};

export default specialOffersApi;