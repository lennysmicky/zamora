// src/pages/Auth/Restaurant/RestaurantRegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import { MdRestaurant, MdStorefront } from 'react-icons/md';
import { validateRegisterForm, getPasswordStrength } from '../../../utils/validators';
import { authAPI } from '../../../api/auth';
import useAuthStore from '../../../stores/authStore';
import logoImage from '../../../assets/images/logo.png';
import restaurantBg from '../../../assets/images/restaurant.png';
import './RestaurantAuth.css';

const RestaurantRegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginRestaurant } = useAuthStore();

  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'password') setPasswordStrength(getPasswordStrength(value));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation locale
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Vérification confirm password côté frontend
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'passwordMismatch' }));
      return;
    }

    setIsLoading(true);

    try {
      // Payload conforme au schéma backend
      const payload = {
        name: formData.restaurantName.trim(),
        address: formData.address.trim(),
        phone: Number(formData.phone),       // conversion Number pour Mongoose
        email: formData.email.trim().toLowerCase(),
        role: 'restaurant',                  // enum valide pour le backend
        password: formData.password
      };

      console.log("Payload envoyé au backend:", payload);

      const response = await authAPI.registerRestaurant(payload);

      const { user, token } = response.data;

      if (token && user) {
        loginRestaurant({ user, token });
        localStorage.setItem('user_role', 'restaurant');
        navigate('/restaurant/dashboard', { replace: true });
      } else {
        setErrors({ general: t('auth.errors.registerFailed', 'Inscription échouée') });
      }
    } catch (err) {
      console.error("Erreur backend:", err.response?.data);
      const message = err.response?.data?.message || t('auth.errors.unknown', 'Une erreur est survenue');
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordInputType = (show) => (show ? 'text' : 'password');

  return (
    <div className="auth-container">
      {/* Left - Image */}
      <div className="auth-image-side">
        <img src={restaurantBg} alt="" className="auth-image-bg" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <MdStorefront className="auth-image-icon" />
          <h2>{t('auth.restaurant.registerTitle')}</h2>
          <p>{t('auth.restaurant.registerSubtitle')}</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-logo">
            <img src={logoImage} alt="Zamora" />
            <span>Zamora</span>
          </div>

          <div className="auth-form-header">
            <h1>{t('auth.register.title')}</h1>
            <p>{t('auth.register.subtitle')}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="auth-error-banner">{errors.general}</div>
            )}

            {/* Restaurant Name */}
            <div className={`auth-input-group ${errors.restaurantName ? 'error' : ''}`}>
              <label>{t('auth.register.restaurantName')}</label>
              <div className="auth-input-wrapper">
                <MdRestaurant className="auth-input-icon" />
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder={t('auth.register.restaurantNamePlaceholder')}
                  autoComplete="organization"
                />
              </div>
              {errors.restaurantName && (
                <span className="auth-input-error">{t(`auth.errors.${errors.restaurantName}`)}</span>
              )}
            </div>

            {/* Email */}
            <div className={`auth-input-group ${errors.email ? 'error' : ''}`}>
              <label>{t('auth.register.email')}</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('auth.register.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="auth-input-error">{t(`auth.errors.${errors.email}`)}</span>
              )}
            </div>

            {/* Phone */}
            <div className={`auth-input-group ${errors.phone ? 'error' : ''}`}>
              <label>{t('auth.register.phone')}</label>
              <div className="auth-input-wrapper">
                <FiPhone className="auth-input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('auth.register.phonePlaceholder')}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <span className="auth-input-error">{t(`auth.errors.${errors.phone}`)}</span>
              )}
            </div>

            {/* Address */}
            <div className={`auth-input-group ${errors.address ? 'error' : ''}`}>
              <label>{t('auth.register.address')}</label>
              <div className="auth-input-wrapper">
                <FiMapPin className="auth-input-icon" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('auth.register.addressPlaceholder')}
                  autoComplete="street-address"
                />
              </div>
              {errors.address && (
                <span className="auth-input-error">{t(`auth.errors.${errors.address}`)}</span>
              )}
            </div>

            {/* Password */}
            <div className={`auth-input-group ${errors.password ? 'error' : ''}`}>
              <label>{t('auth.register.password')}</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type={getPasswordInputType(showPassword)}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formData.password && (
                <div className="auth-password-strength">
                  <div className={`strength-bar ${passwordStrength}`}>
                    <span></span><span></span><span></span>
                  </div>
                  <span className={`strength-text ${passwordStrength}`}>
                    {t(`auth.passwordStrength.${passwordStrength}`)}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="auth-input-error">{t(`auth.errors.${errors.password}`)}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`auth-input-group ${errors.confirmPassword ? 'error' : ''}`}>
              <label>{t('auth.register.confirmPassword')}</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type={getPasswordInputType(showConfirmPassword)}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-input-error">{t(`auth.errors.${errors.confirmPassword}`)}</span>
              )}
            </div>

            {/* Terms */}
            <div className={`auth-terms ${errors.acceptTerms ? 'error' : ''}`}>
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>
                  {t('auth.register.terms')}{' '}
                  <Link to="/terms">{t('auth.register.termsLink')}</Link>{' '}
                  {t('auth.register.and')}{' '}
                  <Link to="/privacy">{t('auth.register.privacyLink')}</Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="auth-input-error">{t(`auth.errors.${errors.acceptTerms}`)}</span>
              )}
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
                  <span>{t('auth.register.button')}</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/">{t('auth.register.login')}</Link>
          </p>
        </div>

        <p className="auth-footer-text">{t('auth.copyright', '© 2025 Zamora. Tous droits réservés.')}</p>
      </div>
    </div>
  );
};

export default RestaurantRegisterPage;
