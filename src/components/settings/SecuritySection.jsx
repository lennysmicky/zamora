// src/components/settings/SecuritySection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiLockLine, 
  RiEyeLine, 
  RiEyeOffLine,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import './css/SettingsSections.css';

const SecuritySection = ({ saving, onChangePassword }) => {
  const { t } = useTranslation();
  
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleShow = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.currentPassword) {
      newErrors.currentPassword = 'Mot de passe actuel requis';
    }
    
    if (!form.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Minimum 8caractères';
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validate()) return;

    const result = await onChangePassword(form);
    if (result.success) {
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="ss-section">
      <div className="ss-header">
        <h3>{t('settings.security.title', 'Sécurité')}</h3>
        <p>{t('settings.security.subtitle', 'Changez votre mot de passe')}</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`ss-message ss-message-${message.type}`}>
          {message.type === 'success' ? <RiCheckLine /> : <RiCloseLine />}
          <span>{message.text}</span>
        </div>
      )}

      <form className="ss-form" onSubmit={handleSubmit}>
        <div className="ss-form-stack">
          {/* Current Password */}
          <div className={`ss-field ${errors.currentPassword ? 'ss-field-error' : ''}`}>
            <label>
              <RiLockLine />
              Mot de passe actuel *
            </label>
            <div className="ss-password-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="ss-password-toggle"
                onClick={() => toggleShow('current')}
              >
                {showPasswords.current ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="ss-field-error-text">{errors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className={`ss-field ${errors.newPassword ? 'ss-field-error' : ''}`}>
            <label>
              <RiLockLine />
              Nouveau mot de passe *
            </label>
            <div className="ss-password-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="ss-password-toggle"
                onClick={() => toggleShow('new')}
              >
                {showPasswords.new ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="ss-field-error-text">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={`ss-field ${errors.confirmPassword ? 'ss-field-error' : ''}`}>
            <label>
              <RiLockLine />
              Confirmer le mot de passe *
            </label>
            <div className="ss-password-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="ss-password-toggle"
                onClick={() => toggleShow('confirm')}
              >
                {showPasswords.confirm ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="ss-field-error-text">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className="ss-actions">
          <button 
            type="submit" 
            className="ss-btn ss-btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <RiLoader4Line className="ss-spinner" />
                <span>Modification...</span>
              </>
            ) : (
              <span>Changer le mot de passe</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySection;