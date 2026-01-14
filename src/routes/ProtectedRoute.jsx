// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

/**
 * ProtectedRoute - Protège les routes selon l'authentification et le type d'utilisateur
 * 
 * @param {ReactNode} children - Composant à afficher si autorisé
 * @param {Array} allowedTypes - Types d'utilisateurs autorisés ['admin', 'restaurant', 'client']
 */
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { isAuthenticated, userType } = useAuthStore();
  const location = useLocation();

  // Pas connecté → rediriger vers auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Connecté mais pas le bon type → rediriger vers son dashboard
  if (allowedTypes.length > 0 && !allowedTypes.includes(userType)) {
    const redirectPath = getRedirectPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Autorisé → afficher le contenu
  return children;
};

/**
 * PublicRoute - Accessible seulement si NON connecté
 * Redirige vers le dashboard si déjà connecté
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, userType } = useAuthStore();

  if (isAuthenticated) {
    const redirectPath = getRedirectPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * AuthRedirect - Redirige vers le bon dashboard selon le type
 */
export const AuthRedirect = () => {
  const { isAuthenticated, userType } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const redirectPath = getRedirectPath(userType);
  return <Navigate to={redirectPath} replace />;
};

/**
 * Fonction helper pour obtenir le chemin de redirection selon le userType
 */
const getRedirectPath = (userType) => {
  switch (userType) {
    case 'admin':
      return '/dashboard';
    case 'restaurant':
      return '/restaurant/dashboard';
    default:
      return '/auth';
  }
};

export default ProtectedRoute;