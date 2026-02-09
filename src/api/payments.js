// src/api/payments.js
import client from './client';

export const paymentsAPI = {
  // ============ RESTAURANT ============
  // Configuration
  getConfig: (restaurantId) => 
    client.get(`/restaurants/${restaurantId}/payments/config`),
  
  updateConfig: (restaurantId, data) => 
    client.put(`/restaurants/${restaurantId}/payments/config`, data),
  
  testConnection: (restaurantId) => 
    client.post(`/restaurants/${restaurantId}/payments/test-connection`),

  // Transactions
  getTransactions: (restaurantId, params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanParams).toString();
    return client.get(`/restaurants/${restaurantId}/payments/transactions${query ? `?${query}` : ''}`);
  },
  
  getTransaction: (restaurantId, transactionId) => 
    client.get(`/restaurants/${restaurantId}/payments/transactions/${transactionId}`),
  
  markAsPaid: (restaurantId, transactionId) => 
    client.patch(`/restaurants/${restaurantId}/payments/transactions/${transactionId}/mark-paid`),
  
  exportTransactions: (restaurantId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/restaurants/${restaurantId}/payments/export${query ? `?${query}` : ''}`, {
      responseType: 'blob'
    });
  },

  // Stats
  getStats: (restaurantId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/restaurants/${restaurantId}/payments/stats${query ? `?${query}` : ''}`);
  },

  // ============ ADMIN ============
  // Pour la page admin (tous les restaurants)
  admin: {
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return client.get(`/admin/payments/transactions${query ? `?${query}` : ''}`);
    },
    
    getStats: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return client.get(`/admin/payments/stats${query ? `?${query}` : ''}`);
    },
    
    getTransaction: (transactionId) => 
      client.get(`/admin/payments/transactions/${transactionId}`),
    
    exportTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return client.get(`/admin/payments/export${query ? `?${query}` : ''}`, {
        responseType: 'blob'
      });
    }
  }
};

export default paymentsAPI;