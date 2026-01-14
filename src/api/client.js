import axios from 'axios';
import env from '../config/env';
import useAuthStore from '../stores/authStore';

const client = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (env.DEBUG) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    if (env.DEBUG) {
      console.log(`[${response.status}] ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    if (env.DEBUG) {
      console.error(`[${status}] ${originalRequest?.url}`, error.message);
    }
    
    // 401 + pas encore retry = tenter refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(
          `${env.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token } = response.data;
        
        useAuthStore.getState().setToken(token);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
        
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper pour les URLs d'images
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${env.UPLOAD_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default client;