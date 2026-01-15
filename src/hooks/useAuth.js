// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../stores/authStore';
import authAPI from '../api/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  // Modal / Confirm Dialog
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });

  const showModal = useCallback((type, titleKey, messageKey, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title: t(titleKey),
      message: t(messageKey),
      onConfirm
    });
  }, [t]);

  const closeModal = useCallback(() => setModal(prev => ({ ...prev, isOpen: false })), []);
  const showSuccess = useCallback((msg) => showModal('success', 'common.success', msg), [showModal]);
  const showError = useCallback((msg) => showModal('error', 'common.error', msg), [showModal]);

  const showConfirmDialog = useCallback((titleKey, messageKey) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: t(titleKey),
        message: t(messageKey),
        onConfirm: () => { setConfirmDialog(prev => ({ ...prev, isOpen: false })); resolve(true); },
        onCancel: () => { setConfirmDialog(prev => ({ ...prev, isOpen: false })); resolve(false); }
      });
    });
  }, [t]);

  const closeConfirmDialog = useCallback(() => setConfirmDialog(prev => ({ ...prev, isOpen: false })), []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userRole = localStorage.getItem('user_role');

        if (!token || !userRole) {
          setIsLoading(false);
          return;
        }

        const response = await authAPI.getProfile();
        if (response.data?.user) {
          const loggedUser = response.data.user;
          setUser(loggedUser);
          useAuthStore.getState().setUser(loggedUser);

          if (['/', '/login', '/admin/login'].includes(window.location.pathname)) {
            if (userRole === 'admin') navigate('/dashboard', { replace: true });
            else if (userRole === 'restaurant') navigate('/restaurant/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error('Init auth error:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        useAuthStore.getState().clear();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [navigate]);

  // Login
  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data?.user) {
        const { user: loggedUser, token, refreshToken } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', loggedUser.role);
        if (rememberMe && refreshToken) localStorage.setItem('refresh_token', refreshToken);

        setUser(loggedUser);
        useAuthStore.getState().setUser(loggedUser);
        showSuccess('auth.messages.loginSuccess');

        setTimeout(() => {
          if (loggedUser.role === 'admin') navigate('/dashboard', { replace: true });
          else if (loggedUser.role === 'restaurant') navigate('/restaurant/dashboard', { replace: true });
        }, 200);

        return { success: true, user: loggedUser };
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

  // Logout
  const logout = useCallback(async (showConfirm = true) => {
    const currentRole = user?.role || localStorage.getItem('user_role');

    if (showConfirm) {
      const confirmed = await showConfirmDialog('auth.logout.title', 'auth.logout.confirmMessage');
      if (!confirmed) return;
    }

    try {
      await authAPI.logout();
      showSuccess('auth.messages.logoutSuccess');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('zamora-auth');
      useAuthStore.getState().clear();
      setUser(null);

      if (currentRole === 'admin') navigate('/admin/login', { replace: true });
      else navigate('/login', { replace: true });
    }
  }, [user, navigate, showConfirmDialog, showSuccess]);

  // Register Restaurant
  const registerRestaurant = useCallback(async (data) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await authAPI.registerRestaurant(data);
      if (response.data?.user && response.data?.token) {
        const { user: newUser, token } = response.data;

        // Met à jour Zustand et localStorage directement
        useAuthStore.getState().loginRestaurant({ user: newUser, token });
        setUser(newUser);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', 'restaurant');

        // Redirection
        navigate('/restaurant/dashboard', { replace: true });
        return { success: true, user: newUser };
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

  const isAdmin = user?.role === 'admin';
  const isRestaurant = user?.role === 'restaurant';
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticating,
    error,
    isAuthenticated,
    isAdmin,
    isRestaurant,
    login,
    logout,
    registerRestaurant,
    modal,
    closeModal,
    showModal,
    showSuccess,
    showError,
    confirmDialog,
    closeConfirmDialog,
    showConfirmDialog
  };
};

export default useAuth;
