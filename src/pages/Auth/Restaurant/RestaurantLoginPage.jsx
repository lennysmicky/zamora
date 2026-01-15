// src/pages/Auth/Restaurant/RestaurantLoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight 
} from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import { validateLoginForm } from '../../../utils/validators';
import useAuthStore from '../../../stores/authStore';
import { authAPI } from '../../../api/auth';
import './RestaurantAuth.css';

import logoImage from '../../../assets/images/logo.png';
import restaurantBg from '../../../assets/images/restaurant.png';

const RestaurantLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginRestaurant } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    const validation = validateLoginForm(formData.email, formData.password);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // ========================================
      //  MODE TEST - Données mock
      // ========================================
      const useMockData = true; // ← Mettre à false quand backend prêt
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        loginRestaurant({
          id: 1,
          name: 'Ahmed Benali',
          email: formData.email,
          phone: '+212 6 12 34 56 78',
          avatar: null,
          restaurantId: 123,
          restaurantName: 'Chez Ahmed - Fast Food',
          restaurantLogo: null,
          token: 'mock-jwt-token-restaurant-123'
        });
        
        navigate('/restaurant/dashboard');
        return;
      }
      // ========================================
      // FIN MODE TEST
      // ========================================
      
      // Appel API réel au backend
      const response = await authAPI.loginRestaurant({
        email: formData.email,
        password: formData.password
      });
      
      const { user, token, restaurant } = response.data;
      
      loginRestaurant({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantLogo: restaurant.logo,
        token: token
      });
      
      navigate('/restaurant/dashboard');
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          setErrors({ general: 'invalidCredentials' });
        } else if (status === 403) {
          setErrors({ general: 'accountDisabled' });
        } else if (status === 404) {
          setErrors({ general: 'accountNotFound' });
        } else {
          setErrors({ general: 'serverError' });
        }
      } else {
        setErrors({ general: 'networkError' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left - Image */}
      <div className="auth-image-side">
        <img src={restaurantBg} alt="" className="auth-image-bg" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <MdRestaurant className="auth-image-icon" />
          <h2>{t('auth.restaurant.loginTitle', 'Espace Restaurant')}</h2>
          <p>{t('auth.restaurant.loginSubtitle', 'Gérez votre restaurant facilement')}</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="auth-form-side">
        {/* Supprimé: Bouton retour - plus besoin car c'est la page principale */}

        <div className="auth-form-container">
          <div className="auth-form-logo">
            <img src={logoImage} alt="Zamora" />
            <span>Zamora</span>
          </div>

          <div className="auth-form-header">
            <h1>{t('auth.login.title', 'Connexion')}</h1>
            <p>{t('auth.login.welcomeBack', 'Bienvenue ! Connectez-vous à votre compte.')}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="auth-error-banner">
                {t(`auth.errors.${errors.general}`, 'Une erreur est survenue')}
              </div>
            )}

            <div className={`auth-input-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">{t('auth.login.email', 'Email')}</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('auth.login.emailPlaceholder', 'votre@email.com')}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="auth-input-error">
                  {t(`auth.errors.${errors.email}`, 'Email invalide')}
                </span>
              )}
            </div>

            <div className={`auth-input-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">{t('auth.login.password', 'Mot de passe')}</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <span className="auth-input-error">
                  {t(`auth.errors.${errors.password}`, 'Mot de passe invalide')}
                </span>
              )}
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>{t('auth.login.rememberMe', 'Se souvenir de moi')}</span>
              </label>
              <Link to="/auth/forgot-password" className="auth-link">
                {t('auth.login.forgotPassword', 'Mot de passe oublié ?')}
              </Link>
            </div>

            <button 
              type="submit" 
              className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner"></span>
              ) : (
                <>
                  <span>{t('auth.login.button', 'Se connecter')}</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {t('auth.login.noAccount', "Pas encore de compte ?")}{' '}
            <Link to="/register">
              {t('auth.login.register', "S'inscrire")}
            </Link>
          </p>
        </div>

        <p className="auth-footer-text">
          {t('auth.copyright', '© 2025 Zamora. Tous droits réservés.')}
        </p>
      </div>
    </div>
  );
};

export default RestaurantLoginPage;