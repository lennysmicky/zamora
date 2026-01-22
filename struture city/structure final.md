SRC
│   App.css
│   App.jsx
│   index.css
│   main.jsx
│
├───assets
│   │   react.svg
│   │
│   └───images
│       │   logo.png
│       │   default-avatar.png
│       │   restaurant.png
│       │   client.png
│       │
│       └───food
│               taco.png
│               burger.png
│               pizza.png
│               fries.png
│               frie.png
│               hotdog.png
│               drink.png
│               donut.png
│               icecream.png
│
├───routes
│       AppRouter.jsx
│       app route vrai.js
│       ProtectedRoute.jsx
│
├───layout
│       MainLayout.jsx
│       SideBar.jsx
│       Header.jsx
│       AuthLayout.jsx
│       AuthLayout.css
│       RestaurantLayout.jsx
│       vrai restauran t layout.ts
│       Header.css
│
├───pages
│   ├───Dashboard
│   │       DashboardPage.jsx
│   │       DashboardPage.css
│   │
│   ├───Restaurants
│   │       RestaurantsPage.jsx
│   │
│   ├───Menus
│   │       MenusPage.jsx
│   │       MenusPage.css
│   │
│   ├───Orders
│   │       OrdersPage.jsx
│   │       OrdersPage.css
│   │
│   ├───Users
│   │       UsersPage.jsx
│   │
│   ├───Customers
│   │       CustomersPage.jsx
│   │
│   ├───Promotions
│   │       PromotionsPage.jsx
│   │
│   ├───Notifications
│   │       NotificationsPage.jsx
│   │
│   ├───Settings
│   │       SettingsPage.jsx
│   │
│   ├───Payments
│   │       PaymentsPage.jsx
│   │
│   ├───SpecialOffers
│   │       SpecialOffersPage.jsx
│   │
│   ├───Auth
│   │   ├───Admin
│   │   │       AdminLoginPage.jsx
│   │   │       AdminLoginPage.css
│   │   │
│   │   └───Restaurant
│   │           RestaurantLoginPage.jsx
│   │           RestaurantRegisterPage.jsx
│   │           RestaurantAuth.css
│   │
│   └───Restaurant
│       ├───Orders
│       │       RestaurantOrdersPage.jsx
│       │
│       ├───Payments
│       │       RestaurantPaymentsPage.jsx
│       │
│       ├───Promotions
│       │       RestaurantPromotionsPage.jsx
│       │
│       ├───Settings
│       │       RestaurantSettingsPage.jsx
│       │
│       ├───Menu
│       │       RestaurantMenuPage.jsx
│       │
│       ├───SpecialOffers
│       │       RestaurantSpecialOffersPage.jsx
│       │
│       ├───Notifications
│       │       RestaurantNotificationsPage.jsx
│       │
│       ├───Dashboard
│       │       RestaurantDashboardPage.jsx
│       │       restaurant.css
│       │
│       └───hooks
│               useDashboardData.js
│
├───components
│   ├───charts
│   │       RevenueChart.jsx
│   │       OrdersStatusChart.jsx
│   │       RevenueChart.css
│   │       OrdersStatusChart.css
│   │       
│   ├───kpi
│   │       KpiCard.jsx
│   │       KpiGrid.jsx
│   │       KpiGrid.css
│   │       KpiCard.css
│   │
│   ├───tables
│   │   │   RestaurantsTable.jsx
│   │   │   UsersTable.jsx
│   │   │   CustomersTable.jsx
│   │   │   PromotionsTable.jsx
│   │   │   OrdersTable.jsx
│   │   │
│   │   └───css
│   │           OrdersTable.css
│   │
│   ├───menus
│   │       CategoryList.jsx
│   │       CategoryForm.jsx
│   │       MealList.jsx
│   │       MealForm.jsx
│   │       CategoryList.css
│   │       CategoryForm.css
│   │       MealList.css
│   │       MealForm.css
│   │
│   ├───forms
│   │       RestaurantForm.jsx
│   │       UserForm.jsx
│   │       PromotionForm.jsx
│   │       NotificationSettings.jsx
│   │
│   ├───common
│   │       Button.jsx
│   │       Modal.jsx
│   │       LoadingSpinner.jsx
│   │       ConfirmDialog.jsx
│   │       ConfirmDialog.css
│   │       Modal.css
│   │       LoadingSpinner.css
│   │
│   ├───dashboard
│   │       TopSellingItems.jsx
│   │       TopSellingItems.css
│   │       RecentOrdersTable.jsx
│   │       RecentOrdersTable.css
│   │
│   └───orders
│       │   OrderFilters.jsx
│       │   OrderLoadingSkeleton.jsx
│       │   OrderStatusSelect.jsx
│       │   OrderDetailsHistory.jsx
│       │   OrderDetailsPayment.jsx
│       │   OrderDetailsItems.jsx
│       │   OrderDetailsCustomer.jsx
│       │   OrderDetailsHeader.jsx
│       │   OrderDetailsModal.jsx
│       │   OrdersPagination.jsx
│       │   SourceBadge.jsx
│       │   PaymentMethodBadge.jsx
│       │   PaymentStatusBadge.jsx
│       │   OrderStatusBadge.jsx
│       │   OrdersTableRow.jsx
│       │   OrdersStats.jsx
│       │   OrdersEmptyState.jsx
│       │
│       └───css
│               OrdersLoadingSkeleton.css
│               OrdersStats.css
│               OrdersFilters.css
│               OrdersTableRow.css
│               OrdersPagination.css
│               OrdersBadges.css
│               OrderDetailsModal.css
│               OrderStatusSelect.css
│               OrdersEmptyState.css
│
├───api
│       client.js
│       auth.js
│       restaurants.js
│       menus.js
│       orders.js
│       users.js
│       customers.js
│       promotions.js
│       notifications.js
│       dashboard.js
│
├───hooks
│       useAuth.js
│       useDashboardData.js
│       useFetch.js
│       useOrders.js
│       useOrdersStore.js
│       use data dash vrai.ts
│       UseMenusdata.js
│
├───utils
│       date.js
│       format.js
│       validators.js
│
├───styles
│       globals.css
│       layout.css
│
├───filters
│       DateRangeFilter.jsx
│       RestaurantSelector.jsx
│       filters.css
│
├───i18n
│   │   index.js
│   │
│   └───locales
│           fr.json
│           en.json
│
└───stores
        ordersStore.js
        authStore.js
