// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStore } from '../stores/authStore';
import * as authAPI from '../api/auth';

// ⚡ SWITCH ICI - mettre false pour utiliser le vrai backend
const USE_MOCK = true;

// ============================================
// 🎭 MOCK DATA
// ============================================
const MOCK_USERS = {
  admin: {
    id: 1,
    email: 'admin@foodie.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Principal',
    avatar: null,
    permissions: ['all']
  },
  restaurant: {
    id: 2,
    email: 'resto@foodie.com',
    password: 'resto123',
    role: 'restaurant',
    name: 'Restaurant Le Gourmet',
    restaurantId: 101,
    avatar: null,
    permissions: ['menu', 'orders', 'promotions', 'settings']
  }
};

const MOCK_TOKENS = {
  admin: 'mock-admin-token-xyz123',
  restaurant: 'mock-restaurant-token-abc456'
};

// Simuler un délai réseau
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// 🎭 MOCK API FUNCTIONS
// ============================================
const mockAuthAPI = {
  login: async (email, password) => {
    await mockDelay();
    
    if (email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password) {
      const { password: _, ...user } = MOCK_USERS.admin;
      return {
        success: true,
        data: {
          user,
          token: MOCK_TOKENS.admin,
          refreshToken: 'mock-refresh-admin'
        }
      };
    }
    
    if (email === MOCK_USERS.restaurant.email && password === MOCK_USERS.restaurant.password) {
      const { password: _, ...user } = MOCK_USERS.restaurant;
      return {
        success: true,
        data: {
          user,
          token: MOCK_TOKENS.restaurant,
          refreshToken: 'mock-refresh-resto'
        }
      };
    }
    
    // Retourne une clé i18n pour l'erreur
    throw new Error('auth.errors.invalidCredentials');
  },

  registerRestaurant: async (data) => {
    await mockDelay(1000);
    
    if (!data.email || !data.password || !data.restaurantName) {
      throw new Error('auth.errors.requiredFields');
    }
    
    if (data.email === MOCK_USERS.restaurant.email) {
      throw new Error('auth.errors.emailExists');
    }
    
    return {
      success: true,
      data: {
        user: {
          id: Date.now(),
          email: data.email,
          role: 'restaurant',
          name: data.restaurantName,
          restaurantId: Date.now() + 1,
          status: 'pending_approval'
        },
        messageKey: 'auth.messages.registrationSuccess'
      }
    };
  },

  logout: async () => {
    await mockDelay(300);
    return { success: true };
  },

  getCurrentUser: async (token) => {
    await mockDelay(500);
    
    if (token === MOCK_TOKENS.admin) {
      const { password: _, ...user } = MOCK_USERS.admin;
      return { success: true, data: { user } };
    }
    
    if (token === MOCK_TOKENS.restaurant) {
      const { password: _, ...user } = MOCK_USERS.restaurant;
      return { success: true, data: { user } };
    }
    
    throw new Error('auth.errors.invalidToken');
  },

  refreshToken: async (refreshToken) => {
    await mockDelay(300);
    
    if (refreshToken.includes('admin')) {
      return { success: true, data: { token: MOCK_TOKENS.admin } };
    }
    if (refreshToken.includes('resto')) {
      return { success: true, data: { token: MOCK_TOKENS.restaurant } };
    }
    
    throw new Error('auth.errors.invalidRefreshToken');
  },

  forgotPassword: async (email) => {
    await mockDelay(1000);
    return {
      success: true,
      messageKey: 'auth.messages.resetEmailSent'
    };
  },

  resetPassword: async (token, newPassword) => {
    await mockDelay(800);
    return {
      success: true,
      messageKey: 'auth.messages.passwordResetSuccess'
    };
  }
};

// ============================================
// 🔀 API SELECTOR
// ============================================
const api = USE_MOCK ? mockAuthAPI : authAPI;

// ============================================
// 🪝 HOOK PRINCIPAL
// ============================================
export const useAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // States
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal/Dialog states
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
    title: '',
    message: '',
    onConfirm: null
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  // ============================================
  // 🔔 MODAL HELPERS
  // ============================================
  const showModal = useCallback((type, titleKey, messageKey, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title: t(titleKey),
      message: t(messageKey),
      onConfirm
    });
  }, [t]);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((messageKey) => {
    showModal('success', 'common.success', messageKey);
  }, [showModal]);

  const showError = useCallback((messageKey) => {
    showModal('error', 'common.error', messageKey);
  }, [showModal]);

  // ============================================
  // 🔔 CONFIRM DIALOG HELPERS
  // ============================================
  const showConfirmDialog = useCallback((titleKey, messageKey) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: t(titleKey),
        message: t(messageKey),
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, [t]);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // ============================================
  // 🔄 INITIALISATION
  // ============================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.getCurrentUser(token);
        
        if (response.success) {
          setUser(response.data.user);
          authStore.setUser(response.data.user);
        }
      } catch (err) {
        console.error('Init auth error:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================
  // 🔐 LOGIN
  // ============================================
  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await api.login(email, password);

      if (response.success) {
        const { user, token, refreshToken } = response.data;

        localStorage.setItem('auth_token', token);
        if (rememberMe && refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        setUser(user);
        authStore.setUser(user);
        authStore.setToken(token);

        // Message de bienvenue
        showSuccess('auth.messages.loginSuccess');

        // Redirection selon rôle
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/dashboard');
          } else if (user.role === 'restaurant') {
            navigate('/restaurant/dashboard');
          }
        }, 1000);

        return { success: true, user };
      }
    } catch (err) {
      const errorKey = err.message || 'auth.errors.loginFailed';
      setError(t(errorKey));
      showError(errorKey);
      return { success: false, error: t(errorKey) };
    } finally {
      setIsAuthenticating(false);
    }
  }, [navigate, t, showSuccess, showError]);

  // ============================================
  // 📝 REGISTER RESTAURANT
  // ============================================
  const registerRestaurant = useCallback(async (data) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await api.registerRestaurant(data);

      if (response.success) {
        showSuccess(response.data.messageKey);
        
        setTimeout(() => {
          navigate('/restaurant/login', { 
            state: { message: t(response.data.messageKey) } 
          });
        }, 1500);
        
        return { success: true };
      }
    } catch (err) {
      const errorKey = err.message || 'auth.errors.registrationFailed';
      setError(t(errorKey));
      showError(errorKey);
      return { success: false, error: t(errorKey) };
    } finally {
      setIsAuthenticating(false);
    }
  }, [navigate, t, showSuccess, showError]);

  // ============================================
  // 🚪 LOGOUT
  // ============================================
  const logout = useCallback(async (showConfirm = true) => {
    // Demander confirmation si nécessaire
    if (showConfirm) {
      const confirmed = await showConfirmDialog(
        'auth.logout.title',
        'auth.logout.confirmMessage'
      );
      
      if (!confirmed) return;
    }

    try {
      await api.logout();
      showSuccess('auth.messages.logoutSuccess');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      authStore.clear();
      
      setTimeout(() => {
        navigate('/admin/login');
      }, 500);
    }
  }, [navigate, showConfirmDialog, showSuccess]);

  // ============================================
  // 🔄 REFRESH TOKEN
  // ============================================
  const refreshAuthToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.refreshToken(refreshToken);

      if (response.success) {
        localStorage.setItem('auth_token', response.data.token);
        authStore.setToken(response.data.token);
        return true;
      }
    } catch (err) {
      console.error('Refresh token error:', err);
      showError('auth.errors.sessionExpired');
      await logout(false);
      return false;
    }
  }, [logout, showError]);

  // ============================================
  // 📧 FORGOT PASSWORD
  // ============================================
  const forgotPassword = useCallback(async (email) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await api.forgotPassword(email);
      showSuccess(response.messageKey);
      return { success: true, message: t(response.messageKey) };
    } catch (err) {
      const errorKey = err.message || 'auth.errors.forgotPasswordFailed';
      setError(t(errorKey));
      showError(errorKey);
      return { success: false, error: t(errorKey) };
    } finally {
      setIsAuthenticating(false);
    }
  }, [t, showSuccess, showError]);

  // ============================================
  // 🔑 RESET PASSWORD
  // ============================================
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await api.resetPassword(token, newPassword);
      showSuccess(response.messageKey);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
      return { success: true, message: t(response.messageKey) };
    } catch (err) {
      const errorKey = err.message || 'auth.errors.resetPasswordFailed';
      setError(t(errorKey));
      showError(errorKey);
      return { success: false, error: t(errorKey) };
    } finally {
      setIsAuthenticating(false);
    }
  }, [navigate, t, showSuccess, showError]);

  // ============================================
  // 🛡️ HELPERS
  // ============================================
  const isAdmin = user?.role === 'admin';
  const isRestaurant = user?.role === 'restaurant';
  const isAuthenticated = !!user;

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // 📤 RETURN
  // ============================================
  return {
    // State
    user,
    isLoading,
    isAuthenticating,
    error,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isRestaurant,
    
    // Actions
    login,
    logout,
    registerRestaurant,
    refreshAuthToken,
    forgotPassword,
    resetPassword,
    
    // Helpers
    hasPermission,
    clearError,
    
    // Modal & Dialog
    modal,
    closeModal,
    showModal,
    showSuccess,
    showError,
    confirmDialog,
    closeConfirmDialog,
    showConfirmDialog,
    
    // Debug
    _isMockMode: USE_MOCK
  };
};

export default useAuth;