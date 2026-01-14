import client from './client';
import env from '../config/env';

export const authAPI = {
  // ========================================
  // LOGIN
  // ========================================
  loginRestaurant: (credentials) => 
    client.post('/login', { ...credentials, userType: 'restaurant' }),
  
  loginAdmin: (credentials) => 
    client.post('/login', { ...credentials, userType: 'admin' }),

  // ========================================
  // REGISTER
  // ========================================
  registerRestaurant: (data) => 
    client.post('/auth/register', { ...data, userType: 'restaurant' }),

  // ========================================
  // SESSION
  // ========================================
  logout: () => 
    client.post('/auth/logout'),
  
  refreshToken: () => 
    client.post('/auth/refresh'),
  
  getProfile: () => 
    client.get('/auth/me'),
  
  updateProfile: (data) => 
    client.put('/auth/profile', data),
  
  updateAvatar: (formData) => 
    client.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ========================================
  // PASSWORD
  // ========================================
  forgotPassword: (email, userType) => 
    client.post('/auth/forgot-password', { email, userType }),
  
  resetPassword: (token, password) => 
    client.post('/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword, newPassword) => 
    client.post('/auth/change-password', { currentPassword, newPassword }),

  // ========================================
  // VERIFICATION
  // ========================================
  verifyEmail: (token) => 
    client.post('/auth/verify-email', { token }),
  
  resendVerification: (email) => 
    client.post('/auth/resend-verification', { email }),

  // ========================================
  // VALIDATION
  // ========================================
  checkEmailExists: (email) => 
    client.post('/auth/check-email', { email }),
  
  validateToken: () => 
    client.get('/auth/validate')
};

export default authAPI;