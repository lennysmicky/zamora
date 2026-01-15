import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

// Layouts
import MainLayout from '../layout/MainLayout';
import RestaurantLayout from '../layout/RestaurantLayout';
import AuthLayout from '../layout/AuthLayout';

// ProtectedRoute
import ProtectedRoute from './ProtectedRoute';

// Loader fallback
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner"></div>
    <p>Chargement...</p>
  </div>
);

// ============================
// Lazy loaded pages
// ============================
// Auth
const AdminLoginPage = lazy(() => import('../pages/Auth/Admin/AdminLoginPage'));
const RestaurantLoginPage = lazy(() => import('../pages/Auth/Restaurant/RestaurantLoginPage'));
const RestaurantRegisterPage = lazy(() => import('../pages/Auth/Restaurant/RestaurantRegisterPage'));

// Admin dashboard
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const RestaurantsPage = lazy(() => import('../pages/Restaurants/RestaurantsPage'));
const MenusPage = lazy(() => import('../pages/Menus/MenusPage'));
const OrdersPage = lazy(() => import('../pages/Orders/OrdersPage'));
const UsersPage = lazy(() => import('../pages/Users/UsersPage'));
const CustomersPage = lazy(() => import('../pages/Customers/CustomersPage'));
const PromotionsPage = lazy(() => import('../pages/Promotions/PromotionsPage'));
const NotificationsPage = lazy(() => import('../pages/Notifications/NotificationsPage'));
const MessagesPage = lazy(() => import('../pages/Messages/MessagesPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const PaymentsPage = lazy(() => import('../pages/Payments/PaymentsPage'));
const SpecialOffersPage = lazy(() => import('../pages/SpecialOffers/SpecialOffersPage'));

// Restaurant dashboard
const RestaurantDashboardPage = lazy(() => import('../pages/Restaurant/Dashboard/RestaurantDashboardPage'));
const RestaurantOrdersPage = lazy(() => import('../pages/Restaurant/Orders/RestaurantOrdersPage'));
const RestaurantMenuPage = lazy(() => import('../pages/Restaurant/Menu/RestaurantMenuPage'));
const RestaurantPromotionsPage = lazy(() => import('../pages/Restaurant/Promotions/RestaurantPromotionsPage'));
const RestaurantSpecialOffersPage = lazy(() => import('../pages/Restaurant/SpecialOffers/RestaurantSpecialOffersPage'));
const RestaurantPaymentsPage = lazy(() => import('../pages/Restaurant/Payments/RestaurantPaymentsPage'));
const RestaurantNotificationsPage = lazy(() => import('../pages/Restaurant/Notifications/RestaurantNotificationsPage'));
const RestaurantMessagesPage = lazy(() => import('../pages/Restaurant/Messages/RestaurantMessagesPage'));
const RestaurantSettingsPage = lazy(() => import('../pages/Restaurant/Settings/RestaurantSettingsPage'));

// 404
const NotFoundPage = () => (
  <div className="not-found-page">
    <h1>404</h1>
    <p>Page non trouvée</p>
    <a href="/login">Retour à l'accueil</a>
  </div>
);

// ============================
// Config des routes
// ============================
const adminRoutes = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'restaurants', element: <RestaurantsPage /> },
  { path: 'menus', element: <MenusPage /> },
  { path: 'orders', element: <OrdersPage /> },
  { path: 'users', element: <UsersPage /> },
  { path: 'customers', element: <CustomersPage /> },
  { path: 'promotions', element: <PromotionsPage /> },
  { path: 'special-offers', element: <SpecialOffersPage /> },
  { path: 'payments', element: <PaymentsPage /> },
  { path: 'messages', element: <MessagesPage /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'settings', element: <SettingsPage /> },
];

const restaurantRoutes = [
  { path: 'dashboard', element: <RestaurantDashboardPage /> },
  { path: 'orders', element: <RestaurantOrdersPage /> },
  { path: 'menu', element: <RestaurantMenuPage /> },
  { path: 'promotions', element: <RestaurantPromotionsPage /> },
  { path: 'special-offers', element: <RestaurantSpecialOffersPage /> },
  { path: 'payments', element: <RestaurantPaymentsPage /> },
  { path: 'messages', element: <RestaurantMessagesPage /> },
  { path: 'notifications', element: <RestaurantNotificationsPage /> },
  { path: 'settings', element: <RestaurantSettingsPage /> },
];

// ============================
// App Router
// ============================
const AppRouter = () => {
  const { isAuthenticated, userType } = useAuthStore();

  // redirection si déjà connecté
  const redirectIfLoggedIn = (children) => {
    if (isAuthenticated) {
      if (userType === 'admin') return <Navigate to="/dashboard" replace />;
      if (userType === 'restaurant') return <Navigate to="/restaurant/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<Suspense fallback={<PageLoader />}>{redirectIfLoggedIn(<RestaurantLoginPage />)}</Suspense>}
        />
        <Route
          path="/register"
          element={<Suspense fallback={<PageLoader />}>{redirectIfLoggedIn(<RestaurantRegisterPage />)}</Suspense>}
        />
        <Route
          path="/admin/login"
          element={<Suspense fallback={<PageLoader />}>{redirectIfLoggedIn(<AdminLoginPage />)}</Suspense>}
        />
      </Route>

      {/* ADMIN DASHBOARD */}
      <Route element={
        <ProtectedRoute allowedTypes={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        {adminRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<Suspense fallback={<PageLoader />}>{r.element}</Suspense>} />
        ))}
      </Route>

      {/* RESTAURANT DASHBOARD */}
      <Route path="/restaurant" element={
        <ProtectedRoute allowedTypes={['restaurant']}>
          <RestaurantLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        {restaurantRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<Suspense fallback={<PageLoader />}>{r.element}</Suspense>} />
        ))}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
