SRC
|   App.css
|   App.jsx
|   index.css
|   main.jsx
|
+---assets
|   |   react.svg
|   |
|   \---images
|           logo.png
|           default-avatar.png
|
+---routes
|       AppRouter.jsx
|
+---layout
|       MainLayout.jsx
|       AuthLayout.jsx                    ← NOUVEAU
|       SideBar.jsx
|       Header.jsx
|
+---pages
|   +---Auth                              ← NOUVEAU DOSSIER
|   |   |   AuthChoicePage.jsx
|   |   |   AuthChoicePage.css
|   |   |
|   |   +---Admin
|   |   |       AdminLoginPage.jsx
|   |   |       AdminLoginPage.css
|   |   |
|   |   +---Client
|   |   |       ClientLoginPage.jsx
|   |   |       ClientRegisterPage.jsx
|   |   |       ClientAuth.css
|   |   |
|   |   \---Restaurant
|   |           RestaurantLoginPage.jsx
|   |           RestaurantRegisterPage.jsx
|   |           RestaurantAuth.css
|   |
|   +---Dashboard
|   |       DashboardPage.jsx
|   |       DashboardPage.css
|   |
|   +---Restaurants
|   |       RestaurantsPage.jsx
|   |
|   +---Menus
|   |       MenusPage.jsx
|   |       
|   +---Orders
|   |       OrdersPage.jsx
|   |       OrdersPage.css
|   |
|   +---Users
|   |       UsersPage.jsx
|   |
|   +---Customers
|   |       CustomersPage.jsx
|   |
|   +---Promotions
|   |       PromotionsPage.jsx
|   |
|   +---Notifications
|   |       NotificationsPage.jsx
|   |
|   +---Settings
|   |       SettingsPage.jsx
|   |
|   +---Payments
|   |       PaymentsPage.jsx
|   |
|   \---SpecialOffers
|           SpecialOffersPage.jsx
|
+---components
|   +---auth                              ← NOUVEAU DOSSIER
|   |   |   LoginForm.jsx
|   |   |   RegisterForm.jsx
|   |   |   AuthHeader.jsx
|   |   |   SocialLoginButtons.jsx
|   |   |   PasswordInput.jsx
|   |   |   AuthDivider.jsx
|   |   |
|   |   \---css
|   |           LoginForm.css
|   |           RegisterForm.css
|   |           AuthHeader.css
|   |           SocialLoginButtons.css
|   |           PasswordInput.css
|   |
|   +---charts
|   |       RevenueChart.jsx
|   |       OrdersStatusChart.jsx
|   |       RevenueChart.css
|   |       OrdersStatusChart.css
|   |
|   +---kpi
|   |       KpiCard.jsx
|   |       KpiGrid.jsx
|   |       KpiGrid.css
|   |       KpiCard.css
|   |
|   +---tables
|   |   |   RestaurantsTable.jsx
|   |   |   UsersTable.jsx
|   |   |   CustomersTable.jsx
|   |   |   PromotionsTable.jsx
|   |   |   OrdersTable.jsx
|   |   |
|   |   \---css
|   |           OrdersTable.css
|   |
|   +---menus
|   |       CategoryList.jsx
|   |       CategoryForm.jsx
|   |       MealList.jsx
|   |       MealForm.jsx
|   |
|   +---forms
|   |       RestaurantForm.jsx
|   |       UserForm.jsx
|   |       PromotionForm.jsx
|   |       NotificationSettings.jsx
|   |
|   +---common
|   |       Button.jsx
|   |       Modal.jsx
|   |       LoadingSpinner.jsx
|   |       ConfirmDialog.jsx
|   |
|   +---dashboard
|   |       TopSellingItems.jsx
|   |       TopSellingItems.css
|   |       RecentOrdersTable.jsx
|   |       RecentOrdersTable.css
|   |
|   \---orders
|       |   OrderFilters.jsx
|       |   OrderLoadingSkeleton.jsx
|       |   OrderStatusSelect.jsx
|       |   OrderDetailsHistory.jsx
|       |   OrderDetailsPayment.jsx
|       |   OrderDetailsItems.jsx
|       |   OrderDetailsCustomer.jsx
|       |   OrderDetailsHeader.jsx
|       |   OrderDetailsModal.jsx
|       |   OrdersPagination.jsx
|       |   SourceBadge.jsx
|       |   PaymentMethodBadge.jsx
|       |   PaymentStatusBadge.jsx
|       |   OrderStatusBadge.jsx
|       |   OrdersTableRow.jsx
|       |   OrdersStats.jsx
|       |   OrdersEmptyState.jsx
|       |
|       \---css
|               OrdersLoadingSkeleton.css
|               OrdersStats.css
|               OrdersFilters.css
|               OrdersTableRow.css
|               OrdersPagination.css
|               OrdersBadges.css
|               OrderDetailsModal.css
|               OrderStatusSelect.css
|               OrdersEmptyState.css
|
+---api
|       client.js
|       auth.js                           ← À ENRICHIR
|       restaurants.js
|       menus.js
|       orders.js
|       users.js
|       customers.js
|       promotions.js
|       notifications.js
|       dashboard.js
|
+---context
|       AuthContext.jsx                   ← À ENRICHIR
|       AppContext.jsx
|
+---hooks
|       useAuth.js                        ← À ENRICHIR
|       useDashboardData.js
|       useFetch.js
|       useOrders.js
|       useOrdersStore.js
|
+---utils
|       date.js
|       format.js
|       validators.js                     ← NOUVEAU (validation email, password, etc.)
|
+---styles
|       globals.css
|       layout.css
|       auth.css                          ← NOUVEAU (styles globaux auth)
|
+---filters
|       DateRangeFilter.jsx
|       RestaurantSelector.jsx
|
+---i18n
|   |   index.js
|   |
|   \---locales
|           fr.json                       ← À ENRICHIR (traductions auth)
|           en.json                       ← À ENRICHIR (traductions auth)
|
\---stores
        ordersStore.js
        authStore.js                      ← NOUVEAU (si besoin)



        src/
│
├── main.jsx
├── App.jsx
├── App.css
├── index.css
│
├── assets/
│   ├── react.svg
│   └── images/
│       ├── logo.png
│       └── default-avatar.png
│
├── routes/
│   └── AppRouter.jsx                    ← MODIFIER (ajouter routes auth)
│
├── stores/
│   ├── ordersStore.js                   ← Existant
│   └── authStore.js                     ← NOUVEAU ⭐
│
├── context/
│   ├── AuthContext.jsx                  ← MODIFIER
│   └── AppContext.jsx
│
├── hooks/
│   ├── useAuth.js                       ← MODIFIER
│   ├── useDashboardData.js
│   ├── useFetch.js
│   ├── useOrders.js
│   └── useOrdersStore.js
│
├── api/
│   ├── client.js                        ← MODIFIER (intercepteur auth)
│   ├── auth.js                          ← MODIFIER (endpoints par rôle)
│   ├── restaurants.js
│   ├── menus.js
│   ├── orders.js
│   ├── users.js
│   ├── customers.js
│   ├── promotions.js
│   ├── notifications.js
│   └── dashboard.js
│
├── utils/
│   ├── date.js
│   ├── format.js
│   └── validators.js                    ← NOUVEAU ⭐
│
├── i18n/
│   ├── index.js
│   └── locales/
│       ├── fr.json                      ← MODIFIER (traductions auth)
│       └── en.json                      ← MODIFIER (traductions auth)
│
├── styles/
│   ├── globals.css
│   ├── layout.css
│   └── auth.css                         ← NOUVEAU ⭐
│
├── filters/
│   ├── DateRangeFilter.jsx
│   └── RestaurantSelector.jsx
│
├── layout/
│   ├── MainLayout.jsx                   ← MODIFIER (userType prop)
│   ├── SideBar.jsx                      ← MODIFIER (menu selon rôle)
│   ├── Header.jsx                       ← MODIFIER (afficher user/resto)
│   └── AuthLayout.jsx                   ← NOUVEAU ⭐
│
├── components/
│   │
│   ├── auth/                            ← NOUVEAU DOSSIER ⭐
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── AuthHeader.jsx
│   │   ├── SocialLoginButtons.jsx
│   │   ├── PasswordInput.jsx
│   │   ├── AuthDivider.jsx
│   │   └── css/
│   │       ├── LoginForm.css
│   │       ├── RegisterForm.css
│   │       ├── AuthHeader.css
│   │       ├── SocialLoginButtons.css
│   │       └── PasswordInput.css
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ConfirmDialog.jsx
│   │
│   ├── charts/
│   │   ├── RevenueChart.jsx
│   │   ├── RevenueChart.css
│   │   ├── OrdersStatusChart.jsx
│   │   └── OrdersStatusChart.css
│   │
│   ├── kpi/
│   │   ├── KpiCard.jsx
│   │   ├── KpiCard.css
│   │   ├── KpiGrid.jsx
│   │   └── KpiGrid.css
│   │
│   ├── tables/
│   │   ├── RestaurantsTable.jsx
│   │   ├── UsersTable.jsx
│   │   ├── CustomersTable.jsx
│   │   ├── PromotionsTable.jsx
│   │   ├── OrdersTable.jsx
│   │   └── css/
│   │       └── OrdersTable.css
│   │
│   ├── menus/
│   │   ├── CategoryList.jsx
│   │   ├── CategoryForm.jsx
│   │   ├── MealList.jsx
│   │   └── MealForm.jsx
│   │
│   ├── forms/
│   │   ├── RestaurantForm.jsx
│   │   ├── UserForm.jsx
│   │   ├── PromotionForm.jsx
│   │   └── NotificationSettings.jsx
│   │
│   ├── dashboard/
│   │   ├── TopSellingItems.jsx
│   │   ├── TopSellingItems.css
│   │   ├── RecentOrdersTable.jsx
│   │   └── RecentOrdersTable.css
│   │
│   └── orders/
│       ├── OrderFilters.jsx
│       ├── OrderLoadingSkeleton.jsx
│       ├── OrderStatusSelect.jsx
│       ├── OrderDetailsHistory.jsx
│       ├── OrderDetailsPayment.jsx
│       ├── OrderDetailsItems.jsx
│       ├── OrderDetailsCustomer.jsx
│       ├── OrderDetailsHeader.jsx
│       ├── OrderDetailsModal.jsx
│       ├── OrdersPagination.jsx
│       ├── SourceBadge.jsx
│       ├── PaymentMethodBadge.jsx
│       ├── PaymentStatusBadge.jsx
│       ├── OrderStatusBadge.jsx
│       ├── OrdersTableRow.jsx
│       ├── OrdersStats.jsx
│       ├── OrdersEmptyState.jsx
│       └── css/
│           ├── OrdersLoadingSkeleton.css
│           ├── OrdersStats.css
│           ├── OrdersFilters.css
│           ├── OrdersTableRow.css
│           ├── OrdersPagination.css
│           ├── OrdersBadges.css
│           ├── OrderDetailsModal.css
│           ├── OrderStatusSelect.css
│           └── OrdersEmptyState.css
│
└── pages/
    │
    ├── Auth/                            ← NOUVEAU DOSSIER ⭐
    │   ├── AuthChoicePage.jsx
    │   ├── AuthChoicePage.css
    │   │
    │   ├── Admin/
    │   │   ├── AdminLoginPage.jsx
    │   │   └── AdminLoginPage.css
    │   │
    │   ├── Restaurant/
    │   │   ├── RestaurantLoginPage.jsx
    │   │   ├── RestaurantRegisterPage.jsx
    │   │   └── RestaurantAuth.css
    │   │
    │   └── Client/
    │       ├── ClientLoginPage.jsx
    │       ├── ClientRegisterPage.jsx
    │       └── ClientAuth.css
    │
    ├── Dashboard/                       ← MODIFIER (filtrer par rôle)
    │   ├── DashboardPage.jsx
    │   └── DashboardPage.css
    │
    ├── Restaurants/                     ← ADMIN ONLY
    │   └── RestaurantsPage.jsx
    │
    ├── Menus/                           ← MODIFIER (filtrer par rôle)
    │   └── MenusPage.jsx
    │
    ├── Orders/                          ← MODIFIER (filtrer par rôle)
    │   ├── OrdersPage.jsx
    │   └── OrdersPage.css
    │
    ├── Users/                           ← ADMIN ONLY
    │   └── UsersPage.jsx
    │
    ├── Customers/                       ← ADMIN ONLY
    │   └── CustomersPage.jsx
    │
    ├── Promotions/                      ← MODIFIER (filtrer par rôle)
    │   └── PromotionsPage.jsx
    │
    ├── Notifications/                   ← MODIFIER (filtrer par rôle)
    │   └── NotificationsPage.jsx
    │
    ├── Settings/                        ← MODIFIER (contenu selon rôle)
    │   └── SettingsPage.jsx
    │
    ├── Payments/                        ← MODIFIER (filtrer par rôle)
    │   └── PaymentsPage.jsx
    │
    └── SpecialOffers/
        └── SpecialOffersPage.jsx



        routes/AppRouter.jsx          → Ajouter routes /auth/*
api/client.js                 → Intercepteur token
api/auth.js                   → Endpoints login/register par rôle
context/AuthContext.jsx       → Gestion userType
hooks/useAuth.js              → Fonctions login/logout par rôle
layout/MainLayout.jsx         → Passer userType
layout/SideBar.jsx            → Menu filtré selon rôle
layout/Header.jsx             → Afficher info user/resto
pages/Dashboard/DashboardPage.jsx  → Stats filtrées
pages/Orders/OrdersPage.jsx        → Commandes filtrées
pages/Menus/MenusPage.jsx          → Menu filtré
pages/Payments/PaymentsPage.jsx    → Paiements filtrés
i18n/locales/fr.json               → Traductions auth
i18n/locales/en.json               → Traductions auth

stores/authStore.js
utils/validators.js
styles/auth.css
layout/AuthLayout.jsx

components/auth/LoginForm.jsx
components/auth/RegisterForm.jsx
components/auth/AuthHeader.jsx
components/auth/SocialLoginButtons.jsx
components/auth/PasswordInput.jsx
components/auth/AuthDivider.jsx
components/auth/css/LoginForm.css
components/auth/css/RegisterForm.css
components/auth/css/AuthHeader.css
components/auth/css/SocialLoginButtons.css
components/auth/css/PasswordInput.css

pages/Auth/AuthChoicePage.jsx
pages/Auth/AuthChoicePage.css
pages/Auth/Admin/AdminLoginPage.jsx
pages/Auth/Admin/AdminLoginPage.css
pages/Auth/Restaurant/RestaurantLoginPage.jsx
pages/Auth/Restaurant/RestaurantRegisterPage.jsx
pages/Auth/Restaurant/RestaurantAuth.css
pages/Auth/Client/ClientLoginPage.jsx
pages/Auth/Client/ClientRegisterPage.jsx
pages/Auth/Client/ClientAuth.css