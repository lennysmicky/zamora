// src/routes/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";

// Layouts
import MainLayout from "../layout/MainLayout";
import RestaurantLayout from "../layout/RestaurantLayout";
import AuthLayout from "../layout/AuthLayout";

// Routes guards
import ProtectedRoute, { PublicRoute } from "./ProtectedRoute";

// ============================
// Loader fallback
// ============================
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner"></div>
    <p>Chargement...</p>
  </div>
);

const S = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

// ============================
// Lazy loaded pages
// ============================

// Landing
const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));

// Auth
const AdminLoginPage = lazy(() => import("../pages/Auth/Admin/AdminLoginPage"));
const RestaurantLoginPage = lazy(() =>
  import("../pages/Auth/Restaurant/RestaurantLoginPage")
);
const RestaurantRegisterPage = lazy(() =>
  import("../pages/Auth/Restaurant/RestaurantRegisterPage")
);

// Admin pages
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const RestaurantsPage = lazy(() => import("../pages/Restaurants/RestaurantsPage"));
const MenusPage = lazy(() => import("../pages/Menus/MenusPage"));
const OrdersPage = lazy(() => import("../pages/Orders/OrdersPage"));
const UsersPage = lazy(() => import("../pages/Users/UsersPage"));
const CustomersPage = lazy(() => import("../pages/Customers/CustomersPage"));
const PromotionsPage = lazy(() => import("../pages/Promotions/PromotionsPage"));
const NotificationsPage = lazy(() => import("../pages/Notifications/NotificationsPage"));
const MessagesPage = lazy(() => import("../pages/Messages/MessagesPage"));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage"));
const PaymentsPage = lazy(() => import("../pages/Payments/PaymentsPage"));
const SpecialOffersPage = lazy(() => import("../pages/SpecialOffers/SpecialOffersPage"));
const TablesPage = lazy(() => import("../pages/Tables/TablesPage"));

// Restaurant pages
const RestaurantDashboardPage = lazy(() =>
  import("../pages/Restaurant/Dashboard/RestaurantDashboardPage")
);
const RestaurantOrdersPage = lazy(() =>
  import("../pages/Restaurant/Orders/RestaurantOrdersPage")
);
const RestaurantMenuPage = lazy(() =>
  import("../pages/Restaurant/Menu/RestaurantMenuPage")
);
const RestaurantPromotionsPage = lazy(() =>
  import("../pages/Restaurant/Promotions/RestaurantPromotionsPage")
);
const RestaurantSpecialOffersPage = lazy(() =>
  import("../pages/Restaurant/SpecialOffers/RestaurantSpecialOffersPage")
);
const RestaurantPaymentsPage = lazy(() =>
  import("../pages/Restaurant/Payments/RestaurantPaymentsPage")
);
const RestaurantNotificationsPage = lazy(() =>
  import("../pages/Restaurant/Notifications/RestaurantNotificationsPage")
);
const RestaurantMessagesPage = lazy(() =>
  import("../pages/Restaurant/Messages/RestaurantMessagesPage")
);
const RestaurantSettingsPage = lazy(() =>
  import("../pages/Restaurant/Settings/RestaurantSettingsPage")
);
const RestaurantTablesPage = lazy(() =>
  import("../pages/Restaurant/Tables/RestaurantTablesPage")
);

// ============================
// 404 Page
// ============================
const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="not-found-link">
        Retour à l'accueil
      </Link>
    </div>
  </div>
);

// ============================
// Routes Configuration
// ============================
const adminRoutes = [
  { path: "dashboard", element: <DashboardPage /> },
  { path: "restaurants", element: <RestaurantsPage /> },
  { path: "menus", element: <MenusPage /> },
  { path: "orders", element: <OrdersPage /> },
  { path: "users", element: <UsersPage /> },
  { path: "customers", element: <CustomersPage /> },
  { path: "promotions", element: <PromotionsPage /> },
  { path: "special-offers", element: <SpecialOffersPage /> },
  { path: "payments", element: <PaymentsPage /> },
  { path: "messages", element: <MessagesPage /> },
  { path: "notifications", element: <NotificationsPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "tables", element: <TablesPage /> },
];

const restaurantRoutes = [
  { path: "dashboard", element: <RestaurantDashboardPage /> },
  { path: "orders", element: <RestaurantOrdersPage /> },
  { path: "menu", element: <RestaurantMenuPage /> },
  { path: "promotions", element: <RestaurantPromotionsPage /> },
  { path: "special-offers", element: <RestaurantSpecialOffersPage /> },
  { path: "payments", element: <RestaurantPaymentsPage /> },
  { path: "messages", element: <RestaurantMessagesPage /> },
  { path: "notifications", element: <RestaurantNotificationsPage /> },
  { path: "settings", element: <RestaurantSettingsPage /> },
  { path: "tables", element: <RestaurantTablesPage /> },
];

// ============================
// App Router
// ============================
const AppRouter = () => {
  return (
    <Routes>
      {/* ============ LANDING ============ */}
      <Route
        path="/"
        element={
          <S>
            <LandingPage />
          </S>
        }
      />

      {/* ============ AUTH ROUTES ============ */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <S>
              <PublicRoute>
                <RestaurantLoginPage />
              </PublicRoute>
            </S>
          }
        />

        <Route
          path="/register"
          element={
            <S>
              <PublicRoute>
                <RestaurantRegisterPage />
              </PublicRoute>
            </S>
          }
        />

        <Route
          path="/admin/login"
          element={
            <S>
              <PublicRoute>
                <AdminLoginPage />
              </PublicRoute>
            </S>
          }
        />
      </Route>

      {/* ✅ /admin -> /dashboard (sans impacter /) */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* ============ ADMIN ROUTES ============ */}
      <Route
        element={
          <ProtectedRoute allowedTypes={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* IMPORTANT: pas de <Route index .../> ici */}
        {adminRoutes.map((r) => (
          <Route
            key={r.path}
            path={r.path} // => /dashboard, /restaurants, ...
            element={<S>{r.element}</S>}
          />
        ))}
      </Route>

      {/* ============ RESTAURANT ROUTES ============ */}
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute allowedTypes={["restaurant"]}>
            <RestaurantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        {restaurantRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<S>{r.element}</S>} />
        ))}
      </Route>

      {/* ============ 404 ============ */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;