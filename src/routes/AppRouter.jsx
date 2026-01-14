// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

// Layouts
import MainLayout from '../layout/MainLayout';
import RestaurantLayout from '../layout/RestaurantLayout';
import AuthLayout from '../layout/AuthLayout';

// Loading Component
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner"></div>
    <p>Chargement...</p>
  </div>
);

// ========================================
// Lazy Loading - Pages Auth
// ========================================
const AdminLoginPage = lazy(() => import('../pages/Auth/Admin/AdminLoginPage'));
const RestaurantLoginPage = lazy(() => import('../pages/Auth/Restaurant/RestaurantLoginPage'));
const RestaurantRegisterPage = lazy(() => import('../pages/Auth/Restaurant/RestaurantRegisterPage'));

// ========================================
// Lazy Loading - Pages Admin Dashboard
// ========================================
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const RestaurantsPage = lazy(() => import('../pages/Restaurants/RestaurantsPage'));
const MenusPage = lazy(() => import('../pages/Menus/MenusPage'));
const OrdersPage = lazy(() => import('../pages/Orders/OrdersPage'));
const UsersPage = lazy(() => import('../pages/Users/UsersPage'));
const CustomersPage = lazy(() => import('../pages/Customers/CustomersPage'));
const PromotionsPage = lazy(() => import('../pages/Promotions/PromotionsPage'));
const NotificationsPage = lazy(() => import('../pages/Notifications/NotificationsPage'));
const MessagesPage = lazy(() => import('../pages/Messages/MessagesPage')); // AJOUTÉ
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const PaymentsPage = lazy(() => import('../pages/Payments/PaymentsPage'));
const SpecialOffersPage = lazy(() => import('../pages/SpecialOffers/SpecialOffersPage'));

// ========================================
// Lazy Loading - Pages Restaurant Dashboard
// ========================================
const RestaurantDashboardPage = lazy(() => import('../pages/Restaurant/Dashboard/RestaurantDashboardPage'));
const RestaurantOrdersPage = lazy(() => import('../pages/Restaurant/Orders/RestaurantOrdersPage'));
const RestaurantMenuPage = lazy(() => import('../pages/Restaurant/Menu/RestaurantMenuPage'));
const RestaurantPromotionsPage = lazy(() => import('../pages/Restaurant/Promotions/RestaurantPromotionsPage'));
const RestaurantSpecialOffersPage = lazy(() => import('../pages/Restaurant/SpecialOffers/RestaurantSpecialOffersPage'));
const RestaurantPaymentsPage = lazy(() => import('../pages/Restaurant/Payments/RestaurantPaymentsPage'));
const RestaurantNotificationsPage = lazy(() => import('../pages/Restaurant/Notifications/RestaurantNotificationsPage'));
const RestaurantMessagesPage = lazy(() => import('../pages/Restaurant/Messages/RestaurantMessagesPage')); // ✅ AJOUTÉ
const RestaurantSettingsPage = lazy(() => import('../pages/Restaurant/Settings/RestaurantSettingsPage'));

// ========================================
// Page 404
// ========================================
const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <a href="/" className="not-found-link">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

// ========================================
// Protected Route Component
// ========================================
const ProtectedRoute = ({ children, allowedTypes }) => {
  const { isAuthenticated, userType } = useAuthStore();
  
  // Pas connecté → auth
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Mauvais type → rediriger vers son dashboard
  if (allowedTypes && !allowedTypes.includes(userType)) {
    if (userType === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    if (userType === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ========================================
// Public Route Component
// ========================================
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userType } = useAuthStore();
  
  // Déjà connecté → rediriger vers dashboard
  if (isAuthenticated) {
    if (userType === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    if (userType === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
  }
  
  return children;
};

// ========================================
// Auth Redirect - Redirige selon userType
// ========================================
const AuthRedirect = () => {
  const { isAuthenticated, userType } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (userType === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (userType === 'restaurant') {
    return <Navigate to="/restaurant/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// ========================================
// Configuration des Routes Admin
// ========================================
const adminRoutesConfig = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'restaurants', element: <RestaurantsPage /> },
  { path: 'menus', element: <MenusPage /> },
  { path: 'orders', element: <OrdersPage /> },
  { path: 'users', element: <UsersPage /> },
  { path: 'customers', element: <CustomersPage /> },
  { path: 'promotions', element: <PromotionsPage /> },
  { path: 'special-offers', element: <SpecialOffersPage /> },
  { path: 'payments', element: <PaymentsPage /> },
  { path: 'messages', element: <MessagesPage /> },           // AJOUTÉ
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'settings', element: <SettingsPage /> }
];

// ========================================
// Configuration des Routes Restaurant
// ========================================
const restaurantRoutesConfig = [
  { path: 'dashboard', element: <RestaurantDashboardPage /> },
  { path: 'orders', element: <RestaurantOrdersPage /> },
  { path: 'menu', element: <RestaurantMenuPage /> },
  { path: 'promotions', element: <RestaurantPromotionsPage /> },
  { path: 'special-offers', element: <RestaurantSpecialOffersPage /> },
  { path: 'payments', element: <RestaurantPaymentsPage /> },
  { path: 'messages', element: <RestaurantMessagesPage /> }, // AJOUTÉ
  { path: 'notifications', element: <RestaurantNotificationsPage /> },
  { path: 'settings', element: <RestaurantSettingsPage /> }
];

// ========================================
// App Router Component
// ========================================
const AppRouter = () => {
  return (
    <Routes>
      
      {/* ========================================
          ROUTE RACINE - Redirection automatique
          ======================================== */}
      <Route path="/" element={<AuthRedirect />} />

      {/* ========================================
          ROUTES AUTH (Publiques)
          ======================================== */}
      <Route element={<AuthLayout />}>
        {/* Login Restaurant - Page principale */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicRoute>
                <RestaurantLoginPage />
              </PublicRoute>
            </Suspense>
          }
        />

        {/* Register Restaurant */}
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicRoute>
                <RestaurantRegisterPage />
              </PublicRoute>
            </Suspense>
          }
        />

        {/* Admin Login - Accès secret via URL */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicRoute>
                <AdminLoginPage />
              </PublicRoute>
            </Suspense>
          }
        />
      </Route>

      {/* ========================================
          ROUTES ADMIN DASHBOARD
          ======================================== */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        {adminRoutesConfig.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<PageLoader />}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* ========================================
          ROUTES RESTAURANT DASHBOARD
          ======================================== */}
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute allowedTypes={['restaurant']}>
            <RestaurantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        {restaurantRoutesConfig.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<PageLoader />}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* ========================================
          ROUTE 404
          ======================================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;