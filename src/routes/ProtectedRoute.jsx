import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

/**
 * ProtectedRoute
 * Protège les routes selon l'authentification et le type d'utilisateur
 * @param {ReactNode} children - Composant à afficher si autorisé
 * @param {Array} allowedTypes - Types d'utilisateurs autorisés ['admin', 'restaurant']
 */
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);
  const location = useLocation();

  // Pas connecté → redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Connecté mais pas le bon type → redirection vers son dashboard
  if (allowedTypes.length > 0 && !allowedTypes.includes(userType)) {
    const redirectPath = getRedirectPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Autorisé → afficher le contenu
  return children;
};

/**
 * PublicRoute
 * Accessible uniquement si NON connecté. Sinon redirige vers le dashboard.
 */
export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);

  if (isAuthenticated) {
    const redirectPath = getRedirectPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * AuthRedirect
 * Redirige automatiquement vers le bon dashboard selon le userType
 */
export const AuthRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath = getRedirectPath(userType);
  return <Navigate to={redirectPath} replace />;
};

/**
 * Retourne le chemin de redirection selon le type utilisateur
 */
const getRedirectPath = (userType) => {
  switch (userType) {
    case 'admin':
      return '/dashboard';
    case 'restaurant':
      return '/restaurant/dashboard';
    default:
      return '/login';
  }
};

export default ProtectedRoute;
