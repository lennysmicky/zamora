import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiErrorWarningLine,
  RiShieldCheckLine,
  RiLoginCircleLine
} from 'react-icons/ri';

import { authAPI } from '../../../api/auth';
import useAuthStore from '../../../stores/authStore';
import Logo from '../../../assets/images/logo.png';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginAdmin = useAuthStore((state) => state.loginAdmin);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError(t('auth.errors.requiredFields'));
      setLoading(false);
      return;
    }

    const emailInput = formData.email.trim().toLowerCase();
    const passwordInput = formData.password;

    try {
      const response = await authAPI.loginAdmin({ email: emailInput, password: passwordInput });
      const { user, token, refreshToken } = response.data || {};

      if (!token || !user) {
        throw new Error('auth.errors.invalidResponse');
      }

      const role = String(user.role ?? user.userType ?? '').toLowerCase();
      if (role !== 'admin') {
        setError(t('auth.errors.accessDenied'));
        setLoading(false);
        return;
      }

      // Persist session for initAuth + client
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', 'admin');
      if (rememberMe && refreshToken) localStorage.setItem('refresh_token', refreshToken);

      loginAdmin({ user, token });
      navigate('/dashboard', { replace: true });

    } catch (err) {
      const status = err?.response?.status;

      // Mapping minimal (ne touche pas i18n)
      const key =
        status === 401 ? 'auth.errors.invalidCredentials' :
        status === 403 ? 'auth.errors.accessDenied' :
        status === 404 ? 'auth.errors.accountNotFound' :
        err?.message === 'auth.errors.invalidResponse' ? 'auth.errors.invalidResponse' :
        'auth.errors.loginFailed';

      setError(t(key));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src={Logo} alt="Zamora" />
          </div>
          <span className="admin-login-badge">
            <RiShieldCheckLine />
            {t('auth.admin.badge')}
          </span>
          <h1 className="admin-login-title">{t('auth.admin.title')}</h1>
          <p className="admin-login-subtitle">{t('auth.admin.subtitle')}</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <RiErrorWarningLine />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="email">
              {t('auth.email')}
            </label>
            <div className="admin-input-wrapper">
              <RiMailLine className="admin-input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className={`admin-input ${error ? 'error' : ''}`}
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="password">
              {t('auth.password')}
            </label>
            <div className="admin-input-wrapper">
              <RiLockPasswordLine className="admin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`admin-input ${error ? 'error' : ''}`}
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          <div className="admin-login-options">
            <label className="admin-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <Link to="/forgot-password" className="admin-forgot">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-btn-spinner"></span>
                {t('auth.loading')}
              </>
            ) : (
              <>
                <RiLoginCircleLine />
                {t('auth.admin.loginBtn')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
