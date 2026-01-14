// src/layout/Header.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../hooks/useOrdersStore';
import useAuthStore from '../stores/authStore';
import { 
  RiMenuLine,
  RiArrowDownSLine,
  RiNotification3Line,
  RiChat3Line,
  RiRefreshLine, 
  RiDownloadLine, 
  RiAddLine,
  RiCloseLine,
  RiCheckboxMultipleLine,
  RiFileExcel2Line,
  RiFilePdf2Line
} from 'react-icons/ri';

// Filters
import RestaurantSelector from '../filters/RestaurantSelector';
import DateRangeFilter from '../filters/DateRangeFilter';

import './Header.css';

// ========================================
// PAGE TITLES CONFIG - Admin & Restaurant
// ========================================
const pageTitlesConfig = {
  // ============ ADMIN ============
  '/dashboard': { 
    titleKey: 'header.pages.dashboard.title', 
    subtitleKey: 'header.pages.dashboard.subtitle' 
  },
  '/restaurants': { 
    titleKey: 'header.pages.restaurants.title', 
    subtitleKey: 'header.pages.restaurants.subtitle' 
  },
  '/menus': { 
    titleKey: 'header.pages.menus.title', 
    subtitleKey: 'header.pages.menus.subtitle' 
  },
  '/orders': { 
    titleKey: 'header.pages.orders.title', 
    subtitleKey: 'header.pages.orders.subtitle' 
  },
  '/customers': { 
    titleKey: 'header.pages.customers.title', 
    subtitleKey: 'header.pages.customers.subtitle' 
  },
  '/users': { 
    titleKey: 'header.pages.users.title', 
    subtitleKey: 'header.pages.users.subtitle' 
  },
  '/promotions': { 
    titleKey: 'header.pages.promotions.title', 
    subtitleKey: 'header.pages.promotions.subtitle' 
  },
  '/notifications': { 
    titleKey: 'header.pages.notifications.title', 
    subtitleKey: 'header.pages.notifications.subtitle' 
  },
  '/payments': { 
    titleKey: 'header.pages.payments.title', 
    subtitleKey: 'header.pages.payments.subtitle' 
  },
  '/settings': { 
    titleKey: 'header.pages.settings.title', 
    subtitleKey: 'header.pages.settings.subtitle' 
  },
  '/special-offers': { 
    titleKey: 'header.pages.specialOffers.title', 
    subtitleKey: 'header.pages.specialOffers.subtitle' 
  },
  '/messages': { 
    titleKey: 'header.pages.messages.title', 
    subtitleKey: 'header.pages.messages.subtitle' 
  },

  // ============ RESTAURANT ============
  '/restaurant/dashboard': { 
    titleKey: 'header.pages.dashboard.title', 
    subtitleKey: 'header.pages.restaurant.dashboardSubtitle' 
  },
  '/restaurant/orders': { 
    titleKey: 'header.pages.orders.title', 
    subtitleKey: 'header.pages.restaurant.ordersSubtitle' 
  },
  '/restaurant/menu': { 
    titleKey: 'header.pages.menu.title', 
    subtitleKey: 'header.pages.restaurant.menuSubtitle' 
  },
  '/restaurant/promotions': { 
    titleKey: 'header.pages.promotions.title', 
    subtitleKey: 'header.pages.restaurant.promotionsSubtitle' 
  },
  '/restaurant/special-offers': { 
    titleKey: 'header.pages.specialOffers.title', 
    subtitleKey: 'header.pages.restaurant.specialOffersSubtitle' 
  },
  '/restaurant/payments': { 
    titleKey: 'header.pages.payments.title', 
    subtitleKey: 'header.pages.restaurant.paymentsSubtitle' 
  },
  '/restaurant/notifications': { 
    titleKey: 'header.pages.notifications.title', 
    subtitleKey: 'header.pages.restaurant.notificationsSubtitle' 
  },
  '/restaurant/settings': { 
    titleKey: 'header.pages.settings.title', 
    subtitleKey: 'header.pages.restaurant.settingsSubtitle' 
  },
  '/restaurant/messages': { 
    titleKey: 'header.pages.messages.title', 
    subtitleKey: 'header.pages.restaurant.messagesSubtitle' 
  }
};

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth Store
  const { userType } = useAuthStore();
  
  // Store Orders
  const { selectedOrders, handlers, clearSelection } = useOrdersStore();
  
  // États locaux
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  
  // États filtres Dashboard
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState({ id: 'thisMonth', labelKey: 'filters.thisMonth' });
  
  // Get page config
  const pageConfig = pageTitlesConfig[location.pathname] || { 
    titleKey: 'header.pages.default.title', 
    subtitleKey: 'header.pages.default.subtitle' 
  };

  // Conditions d'affichage
  const isDashboard = location.pathname === '/dashboard' || 
                      location.pathname === '/restaurant/dashboard';
  
  const isOrders = location.pathname === '/orders' || 
                   location.pathname === '/restaurant/orders';

  const isAdmin = userType === 'admin';

  // ========================================
  // Navigation Handlers
  // ========================================
  const handleNotificationsClick = () => {
    if (isAdmin) {
      navigate('/notifications');
    } else {
      navigate('/restaurant/notifications');
    }
  };

  const handleMessagesClick = () => {
    if (isAdmin) {
      navigate('/messages');
    } else {
      navigate('/restaurant/messages');
    }
  };

  // ========================================
  // Handlers Filtres
  // ========================================
  const handleRestaurantChange = (restaurant) => {
    setSelectedRestaurant(restaurant);
    console.log('Restaurant sélectionné:', restaurant);
  };

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    console.log('Période sélectionnée:', range);
  };

  // ========================================
  // Handlers Orders
  // ========================================
  const handleExport = (format) => {
    handlers.onExport?.(format);
    setShowExportMenu(false);
  };

  const handleBulkAction = (action) => {
    handlers.onBulkAction?.(action);
    setShowBulkMenu(false);
  };

  const handleClearSelection = () => {
    clearSelection();
    setShowBulkMenu(false);
  };

  return (
    <header className="header">
      {/* Left Section */}
      <div className="header-left">
        <button 
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label={t('header.toggleMenu')}
        >
          <RiMenuLine />
        </button>

        <div className="header-title">
          <h1>{t(pageConfig.titleKey)}</h1>
          <p>{t(pageConfig.subtitleKey)}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        
        {/* ============ DASHBOARD FILTERS ============ */}
        {isDashboard && (
          <div className="header-filters">
            {/* Filtre restaurants - Admin seulement */}
            {isAdmin && (
              <>
                <RestaurantSelector
                  selectedRestaurant={selectedRestaurant}
                  onSelectRestaurant={handleRestaurantChange}
                />
                <div className="header-filter-divider" />
              </>
            )}

            {/* Filtre date - Pour tous */}
            <DateRangeFilter
              selectedRange={selectedDateRange}
              onSelectRange={handleDateRangeChange}
            />
          </div>
        )}

        {/* ============ ORDERS ACTIONS ============ */}
        {isOrders && (
          <div className="header-orders">
            {selectedOrders.length > 0 ? (
              // Mode sélection
              <div className="header-orders-bulk">
                <div className="header-orders-bulk-info">
                  <RiCheckboxMultipleLine />
                  <span>{selectedOrders.length} {t('orders.selected')}</span>
                  <button 
                    className="header-orders-bulk-clear"
                    onClick={handleClearSelection}
                    aria-label={t('orders.clearSelection')}
                  >
                    <RiCloseLine />
                  </button>
                </div>

                <div className="header-orders-dropdown-wrapper">
                  <button 
                    className="header-orders-btn header-orders-btn-secondary"
                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                  >
                    <span>{t('orders.bulkActions')}</span>
                    <RiArrowDownSLine className={showBulkMenu ? 'rotate' : ''} />
                  </button>

                  {showBulkMenu && (
                    <div className="header-orders-dropdown">
                      <button onClick={() => handleBulkAction('mark_delivered')}>
                        {t('orders.bulkMarkDelivered')}
                      </button>
                      <button onClick={() => handleBulkAction('mark_cancelled')}>
                        {t('orders.bulkMarkCancelled')}
                      </button>
                      <div className="header-orders-dropdown-divider"></div>
                      <button 
                        className="danger"
                        onClick={() => handleBulkAction('delete')}
                      >
                        {t('orders.bulkDelete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Mode normal
              <div className="header-orders-actions">
                <button 
                  className="header-orders-btn header-orders-btn-icon"
                  onClick={() => handlers.onRefresh?.()}
                  title={t('common.refresh')}
                >
                  <RiRefreshLine />
                </button>

                <div className="header-orders-dropdown-wrapper">
                  <button 
                    className="header-orders-btn header-orders-btn-secondary"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                  >
                    <RiDownloadLine />
                    <span>{t('orders.export')}</span>
                    <RiArrowDownSLine className={showExportMenu ? 'rotate' : ''} />
                  </button>

                  {showExportMenu && (
                    <div className="header-orders-dropdown">
                      <button onClick={() => handleExport('csv')}>
                        <RiFileExcel2Line />
                        <span>{t('orders.exportCSV')}</span>
                      </button>
                      <button onClick={() => handleExport('pdf')}>
                        <RiFilePdf2Line />
                        <span>{t('orders.exportPDF')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  className="header-orders-btn header-orders-btn-primary"
                  onClick={() => handlers.onNewOrder?.()}
                >
                  <RiAddLine />
                  <span>{t('orders.newOrder')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============ NOTIFICATIONS & MESSAGES ============ */}
        <div className="header-actions">
          <button 
            className="header-action-btn"
            onClick={handleNotificationsClick}
            aria-label={t('header.notifications')}
            title={t('header.notifications')}
          >
            <RiNotification3Line />
            {/* Badge - TODO: Ajouter compteur dynamique */}
            <span className="header-action-badge"></span>
          </button>

          <button 
            className="header-action-btn"
            onClick={handleMessagesClick}
            aria-label={t('header.messages')}
            title={t('header.messages')}
          >
            <RiChat3Line />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;