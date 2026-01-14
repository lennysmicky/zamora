// src/layout/SideBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiDashboardFill,
  RiShoppingBag3Line,
  RiShoppingBag3Fill,
  RiRestaurantLine,
  RiRestaurantFill,
  RiCoupon3Line,
  RiCoupon3Fill,
  RiGroupLine,
  RiGroupFill,
  RiSettings4Line,
  RiSettings4Fill,
  RiLogoutBoxRLine,
  RiStore2Line,
  RiStore2Fill,
  RiNotification3Line,
  RiNotification3Fill,
  RiSecurePaymentLine,
  RiSecurePaymentFill,
  RiUserLine,
  RiUserFill,
  RiSunLine,
  RiMoonLine,
  RiComputerLine,
  RiArrowDownSLine,
  RiGiftLine,
  RiGiftFill,
  RiMessage3Line,        
  RiMessage3Fill         
} from 'react-icons/ri';

// Logo
import Logo from '../assets/images/logo.png';
import DefaultAvatar from '../assets/images/default-avatar.png';

// Auth Store
import useAuthStore from '../stores/authStore';

// ========================================
// NAVIGATION CONFIG
// ========================================

// Navigation ADMIN
const adminNavItems = [
  {
    path: '/dashboard',
    labelKey: 'sidebar.dashboard',
    icon: RiDashboardLine,
    iconActive: RiDashboardFill
  },
  {
    path: '/orders',
    labelKey: 'sidebar.orders',
    icon: RiShoppingBag3Line,
    iconActive: RiShoppingBag3Fill
  },
  {
    path: '/menus',
    labelKey: 'sidebar.menus',
    icon: RiRestaurantLine,
    iconActive: RiRestaurantFill
  },
  {
    path: '/restaurants',
    labelKey: 'sidebar.restaurants',
    icon: RiStore2Line,
    iconActive: RiStore2Fill
  },
  {
    path: '/customers',
    labelKey: 'sidebar.customers',
    icon: RiGroupLine,
    iconActive: RiGroupFill
  },
  {
    path: '/users',
    labelKey: 'sidebar.users',
    icon: RiUserLine,
    iconActive: RiUserFill
  },
  {
    path: '/promotions',
    labelKey: 'sidebar.promotions',
    icon: RiCoupon3Line,
    iconActive: RiCoupon3Fill
  },
  {
    path: '/special-offers',
    labelKey: 'sidebar.specialOffers',
    icon: RiGiftLine,
    iconActive: RiGiftFill
  },
  {
    path: '/payments',
    labelKey: 'sidebar.payments',
    icon: RiSecurePaymentLine,
    iconActive: RiSecurePaymentFill
  },
  {
    path: '/messages',              
    labelKey: 'sidebar.messages',
    icon: RiMessage3Line,
    iconActive: RiMessage3Fill
  },
  {
    path: '/notifications',
    labelKey: 'sidebar.notifications',
    icon: RiNotification3Line,
    iconActive: RiNotification3Fill
  },
  {
    path: '/settings',
    labelKey: 'sidebar.settings',
    icon: RiSettings4Line,
    iconActive: RiSettings4Fill
  }
];

// Navigation RESTAURANT
const restaurantNavItems = [
  {
    path: '/restaurant/dashboard',
    labelKey: 'sidebar.dashboard',
    icon: RiDashboardLine,
    iconActive: RiDashboardFill
  },
  {
    path: '/restaurant/orders',
    labelKey: 'sidebar.orders',
    icon: RiShoppingBag3Line,
    iconActive: RiShoppingBag3Fill
  },
  {
    path: '/restaurant/menu',
    labelKey: 'sidebar.menus',
    icon: RiRestaurantLine,
    iconActive: RiRestaurantFill
  },
  {
    path: '/restaurant/promotions',
    labelKey: 'sidebar.promotions',
    icon: RiCoupon3Line,
    iconActive: RiCoupon3Fill
  },
  {
    path: '/restaurant/special-offers',
    labelKey: 'sidebar.specialOffers',
    icon: RiGiftLine,
    iconActive: RiGiftFill
  },
  {
    path: '/restaurant/payments',
    labelKey: 'sidebar.payments',
    icon: RiSecurePaymentLine,
    iconActive: RiSecurePaymentFill
  },
  {
    path: '/restaurant/messages',    
    labelKey: 'sidebar.messages',
    icon: RiMessage3Line,
    iconActive: RiMessage3Fill
  },
  {
    path: '/restaurant/notifications',
    labelKey: 'sidebar.notifications',
    icon: RiNotification3Line,
    iconActive: RiNotification3Fill
  },
  {
    path: '/restaurant/settings',
    labelKey: 'sidebar.settings',
    icon: RiSettings4Line,
    iconActive: RiSettings4Fill
  }
];

// Language options
const languageOptions = [
  { id: 'fr', labelKey: 'language.fr', flag: '🇫🇷' },
  { id: 'en', labelKey: 'language.en', flag: '🇬🇧' }
];

// Theme options
const themeOptionsConfig = [
  { id: 'light', labelKey: 'theme.light', icon: RiSunLine },
  { id: 'dark', labelKey: 'theme.dark', icon: RiMoonLine },
  { id: 'system', labelKey: 'theme.system', icon: RiComputerLine }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ========================================
  // AUTH STORE
  // ========================================
  const { 
    user: authUser, 
    userType,
    restaurantName,
    logout: authLogout,
    isAuthenticated 
  } = useAuthStore();

  console.log('🔍 Sidebar Debug:', {
    userType,
    isAuthenticated,
    restaurantName,
    authUser
  });

  // Choisir le menu selon userType
  const navItems = userType === 'restaurant' ? restaurantNavItems : adminNavItems;

  //  Subtitle selon userType
  const getBrandSubtitle = () => {
    if (userType === 'restaurant') {
      return restaurantName || t('sidebar.restaurantDashboard', 'Espace Restaurant');
    }
    return t('sidebar.brandSubtitle', 'Administration');
  };

  const [theme, setTheme] = useState('system');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  // État utilisateur simplifié
  const [userLoading, setUserLoading] = useState(true);

  // Fonction pour générer les initiales
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  //  Données utilisateur calculées directement depuis authStore
  const user = {
    name: authUser?.name || restaurantName || '',
    email: authUser?.email || '',
    initials: getInitials(authUser?.name || restaurantName),
    avatar: authUser?.avatar || null
  };

  // Charger l'état loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialiser le thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Initialiser la langue depuis localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  // Fermer dropdown theme si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer dropdown langue si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Appliquer le thème
  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;

    if (selectedTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Changer le thème
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeDropdownOpen(false);
  };

  // Get current language
  const getCurrentLanguageLabel = () => {
    const current = languageOptions.find(opt => opt.id === language);
    return current ? t(current.labelKey) : t('language.fr');
  };

  const getCurrentLanguageFlag = () => {
    const current = languageOptions.find(opt => opt.id === language);
    return current ? current.flag : '🇫🇷';
  };

  // Changer la langue
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    i18n.changeLanguage(newLanguage);
    setLanguageDropdownOpen(false);
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = () => {
    authLogout();
    navigate('/auth');
  };

  // Écouter les changements du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Get current theme icon
  const getCurrentThemeIcon = () => {
    const current = themeOptionsConfig.find(opt => opt.id === theme);
    return current ? current.icon : RiSunLine;
  };

  const getCurrentThemeLabel = () => {
    const current = themeOptionsConfig.find(opt => opt.id === theme);
    return current ? t(current.labelKey) : t('theme.light');
  };

  const CurrentIcon = getCurrentThemeIcon();

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = isActive ? item.iconActive : item.icon;

    return (
      <li key={item.path} className="sidebar-nav-item">
        <NavLink
          to={item.path}
          className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon />
          <span>{t(item.labelKey)}</span>
          {item.badge && (
            <span className="sidebar-badge">{item.badge}</span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${!isOpen ? 'sidebar-hidden' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img
              src={Logo}
              alt="Zamora Logo"
              className="sidebar-logo-img"
            />
          </div>
          <div className="sidebar-brand-text">
            <h1>Zamora</h1>
            <p>{getBrandSubtitle()}</p>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map(renderNavItem)}
          </ul>
        </nav>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">
          {/* Theme & Language Row */}
          <div className="sidebar-dropdowns-row">
            {/* Theme Dropdown */}
            <div className="sidebar-theme-dropdown" ref={dropdownRef}>
              <button
                className="sidebar-theme-trigger"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              >
                <CurrentIcon />
                <span>{getCurrentThemeLabel()}</span>
                <RiArrowDownSLine className={`sidebar-theme-arrow ${themeDropdownOpen ? 'open' : ''}`} />
              </button>

              {themeDropdownOpen && (
                <div className="sidebar-theme-menu">
                  {themeOptionsConfig.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        className={`sidebar-theme-option ${theme === option.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(option.id)}
                      >
                        <Icon />
                        <span>{t(option.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="sidebar-theme-dropdown" ref={languageDropdownRef}>
              <button
                className="sidebar-theme-trigger"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                <span className="sidebar-lang-flag">{getCurrentLanguageFlag()}</span>
                <span>{getCurrentLanguageLabel()}</span>
                <RiArrowDownSLine className={`sidebar-theme-arrow ${languageDropdownOpen ? 'open' : ''}`} />
              </button>

              {languageDropdownOpen && (
                <div className="sidebar-theme-menu">
                  {languageOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`sidebar-theme-option ${language === option.id ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(option.id)}
                    >
                      <span className="sidebar-lang-flag">{option.flag}</span>
                      <span>{t(option.labelKey)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="sidebar-user">
            {userLoading ? (
              <>
                <div className="sidebar-user-avatar skeleton-avatar"></div>
                <div className="sidebar-user-info">
                  <div className="skeleton-user-name"></div>
                  <div className="skeleton-user-email"></div>
                </div>
              </>
            ) : isAuthenticated && user.name ? (
              <>
                <div className="sidebar-user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.initials}</span>
                  )}
                </div>
                <div className="sidebar-user-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
                <button
                  className="sidebar-logout-btn"
                  onClick={handleLogout}
                  title={t('user.logout', 'Déconnexion')}
                >
                  <RiLogoutBoxRLine />
                </button>
              </>
            ) : (
              <>
                <div className="sidebar-user-avatar">
                  <span>?</span>
                </div>
                <div className="sidebar-user-info">
                  <h4>{t('user.notConnected', 'Non connecté')}</h4>
                  <p>-</p>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;