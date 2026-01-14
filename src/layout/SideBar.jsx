// src/layout/SideBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine, RiDashboardFill, RiShoppingBag3Line, RiShoppingBag3Fill,
  RiRestaurantLine, RiRestaurantFill, RiCoupon3Line, RiCoupon3Fill,
  RiGroupLine, RiGroupFill, RiSettings4Line, RiSettings4Fill,
  RiLogoutBoxRLine, RiStore2Line, RiStore2Fill, RiNotification3Line, RiNotification3Fill,
  RiSecurePaymentLine, RiSecurePaymentFill, RiUserLine, RiUserFill,
  RiSunLine, RiMoonLine, RiComputerLine, RiArrowDownSLine,
  RiGiftLine, RiGiftFill, RiMessage3Line, RiMessage3Fill
} from 'react-icons/ri';

// Logo
import Logo from '../assets/images/logo.png';
// avatar default
import defaultavatar from '../assets/images/defaultavatar.png';
// Auth Store
import useAuthStore from '../stores/authStore';

// ====================
// Navigation Config
// ====================
const adminNavItems = [
  { path: '/dashboard', labelKey: 'sidebar.dashboard', icon: RiDashboardLine, iconActive: RiDashboardFill },
  { path: '/orders', labelKey: 'sidebar.orders', icon: RiShoppingBag3Line, iconActive: RiShoppingBag3Fill },
  { path: '/menus', labelKey: 'sidebar.menus', icon: RiRestaurantLine, iconActive: RiRestaurantFill },
  { path: '/restaurants', labelKey: 'sidebar.restaurants', icon: RiStore2Line, iconActive: RiStore2Fill },
  { path: '/customers', labelKey: 'sidebar.customers', icon: RiGroupLine, iconActive: RiGroupFill },
  { path: '/users', labelKey: 'sidebar.users', icon: RiUserLine, iconActive: RiUserFill },
  { path: '/promotions', labelKey: 'sidebar.promotions', icon: RiCoupon3Line, iconActive: RiCoupon3Fill },
  { path: '/special-offers', labelKey: 'sidebar.specialOffers', icon: RiGiftLine, iconActive: RiGiftFill },
  { path: '/payments', labelKey: 'sidebar.payments', icon: RiSecurePaymentLine, iconActive: RiSecurePaymentFill },
  { path: '/messages', labelKey: 'sidebar.messages', icon: RiMessage3Line, iconActive: RiMessage3Fill },
  { path: '/notifications', labelKey: 'sidebar.notifications', icon: RiNotification3Line, iconActive: RiNotification3Fill },
  { path: '/settings', labelKey: 'sidebar.settings', icon: RiSettings4Line, iconActive: RiSettings4Fill }
];

const restaurantNavItems = [
  { path: '/restaurant/dashboard', labelKey: 'sidebar.dashboard', icon: RiDashboardLine, iconActive: RiDashboardFill },
  { path: '/restaurant/orders', labelKey: 'sidebar.orders', icon: RiShoppingBag3Line, iconActive: RiShoppingBag3Fill },
  { path: '/restaurant/menu', labelKey: 'sidebar.menus', icon: RiRestaurantLine, iconActive: RiRestaurantFill },
  { path: '/restaurant/promotions', labelKey: 'sidebar.promotions', icon: RiCoupon3Line, iconActive: RiCoupon3Fill },
  { path: '/restaurant/special-offers', labelKey: 'sidebar.specialOffers', icon: RiGiftLine, iconActive: RiGiftFill },
  { path: '/restaurant/payments', labelKey: 'sidebar.payments', icon: RiSecurePaymentLine, iconActive: RiSecurePaymentFill },
  { path: '/restaurant/messages', labelKey: 'sidebar.messages', icon: RiMessage3Line, iconActive: RiMessage3Fill },
  { path: '/restaurant/notifications', labelKey: 'sidebar.notifications', icon: RiNotification3Line, iconActive: RiNotification3Fill },
  { path: '/restaurant/settings', labelKey: 'sidebar.settings', icon: RiSettings4Line, iconActive: RiSettings4Fill }
];

const languageOptions = [
  { id: 'fr', labelKey: 'language.fr', flag: '🇫🇷' },
  { id: 'en', labelKey: 'language.en', flag: '🇬🇧' }
];

const themeOptionsConfig = [
  { id: 'light', labelKey: 'theme.light', icon: RiSunLine },
  { id: 'dark', labelKey: 'theme.dark', icon: RiMoonLine },
  { id: 'system', labelKey: 'theme.system', icon: RiComputerLine }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { user: authUser, userType, restaurantName, logout: authLogout, isAuthenticated } = useAuthStore();

  const navItems = userType === 'restaurant' ? restaurantNavItems : adminNavItems;

  const getBrandSubtitle = () => userType === 'restaurant'
    ? restaurantName || t('sidebar.restaurantDashboard', 'Espace Restaurant')
    : t('sidebar.brandSubtitle', 'Administration');

  const [theme, setTheme] = useState('system');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const user = {
    name: authUser?.name || restaurantName || 'Utilisateur',
    email: authUser?.email || '-',
    initials: getInitials(authUser?.name || restaurantName),
    avatar: authUser?.avatar || null
  };

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    if (selectedTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', selectedTheme === 'dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setThemeDropdownOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target)) setLanguageDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeDropdownOpen(false);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
    setLanguageDropdownOpen(false);
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login'); // corrigé pour la bonne route
  };

  const CurrentIcon = themeOptionsConfig.find(opt => opt.id === theme)?.icon || RiSunLine;

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = isActive ? item.iconActive : item.icon;
    return (
      <li key={item.path} className="sidebar-nav-item">
        <NavLink to={item.path} className={`sidebar-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Icon />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${!isOpen ? 'sidebar-hidden' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo"><img src={Logo} alt="Logo" /></div>
          <div className="sidebar-brand-text">
            <h1>Zamora</h1>
            <p>{getBrandSubtitle()}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">{navItems.map(renderNavItem)}</ul>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-dropdowns-row">
            <div className="sidebar-theme-dropdown" ref={dropdownRef}>
              <button className="sidebar-theme-trigger" onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}>
                <CurrentIcon />
                <span>{t(themeOptionsConfig.find(opt => opt.id === theme)?.labelKey)}</span>
                <RiArrowDownSLine className={themeDropdownOpen ? 'open' : ''} />
              </button>
              {themeDropdownOpen && (
                <div className="sidebar-theme-menu">
                  {themeOptionsConfig.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.id} className={theme === opt.id ? 'active' : ''} onClick={() => handleThemeChange(opt.id)}>
                        <Icon /><span>{t(opt.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sidebar-theme-dropdown" ref={languageDropdownRef}>
              <button className="sidebar-theme-trigger" onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}>
                <span className="sidebar-lang-flag">{languageOptions.find(opt => opt.id === language)?.flag}</span>
                <span>{t(languageOptions.find(opt => opt.id === language)?.labelKey)}</span>
                <RiArrowDownSLine className={languageDropdownOpen ? 'open' : ''} />
              </button>
              {languageDropdownOpen && (
                <div className="sidebar-theme-menu">
                  {languageOptions.map(opt => (
                    <button key={opt.id} className={language === opt.id ? 'active' : ''} onClick={() => handleLanguageChange(opt.id)}>
                      <span className="sidebar-lang-flag">{opt.flag}</span>
                      <span>{t(opt.labelKey)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-user">
            {isAuthenticated ? (
              <>
                <div className="sidebar-user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" onError={(e) => {e.currentTarget.src = defaultavatar;
                      }}
                    />
                  ) : (
                    <img src={defaultavatar} alt="Avatar" />
                  )}
                </div>
                <div className="sidebar-user-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
                <button className="sidebar-logout-btn" onClick={handleLogout} title={t('user.logout', 'Déconnexion')}>
                  <RiLogoutBoxRLine />
                </button>
              </>
            ) : (
              <>
                <div className="sidebar-user-avatar"><span>?</span></div>
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
