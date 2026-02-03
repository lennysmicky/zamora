import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiStore2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine
} from 'react-icons/ri';
import './RestaurantsForm.css';

const RestaurantsForm = ({ 
  restaurant, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const { t } = useTranslation();

  const isEditMode = !!restaurant;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    status: 'active'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone ? String(restaurant.phone) : '',
        email: restaurant.email || '',
        password: '',
        status: restaurant.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        password: '',
        status: 'active'
      });
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        status: checked ? 'active' : 'inactive' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    
    if (!formData.name.trim()) errs.name = 'required';
    if (!formData.address.trim()) errs.address = 'required';
    if (!formData.phone.trim()) errs.phone = 'required';
    if (!formData.email.trim()) errs.email = 'required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'invalid';
    
    // Password requis uniquement en création
    if (!isEditMode) {
      if (!formData.password.trim()) {
        errs.password = 'required';
      } else if (formData.password.length < 8) {
        errs.password = 'minLength';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // En modification, ne pas envoyer le password s'il est vide
      const dataToSubmit = { ...formData };
      if (isEditMode && !formData.password.trim()) {
        delete dataToSubmit.password;
      }
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form className="restaurant-form" onSubmit={handleSubmit}>
      {/* Nom */}
      <div className={`form-group ${errors.name ? 'error' : ''}`}>
        <label>
          <RiStore2Line />
          {t('restaurants.form.name', 'Nom du restaurant')} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('restaurants.form.namePlaceholder', 'Ex: Pizza Palace')}
        />
        {errors.name && <span className="form-error">{t('common.required', 'Ce champ est requis')}</span>}
      </div>

      {/* Adresse */}
      <div className={`form-group ${errors.address ? 'error' : ''}`}>
        <label>
          <RiMapPinLine />
          {t('restaurants.form.address', 'Adresse')} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder={t('restaurants.form.addressPlaceholder', 'Ex: 123 Rue de Paris')}
        />
        {errors.address && <span className="form-error">{t('common.required', 'Ce champ est requis')}</span>}
      </div>

      {/* Téléphone + Email */}
      <div className="form-row">
        <div className={`form-group ${errors.phone ? 'error' : ''}`}>
          <label>
            <RiPhoneLine />
            {t('restaurants.form.phone', 'Téléphone')} <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('restaurants.form.phonePlaceholder', '0612345678')}
          />
          {errors.phone && <span className="form-error">{t('common.required', 'Ce champ est requis')}</span>}
        </div>

        <div className={`form-group ${errors.email ? 'error' : ''}`}>
          <label>
            <RiMailLine />
            {t('restaurants.form.email', 'Email')} <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('restaurants.form.emailPlaceholder', 'contact@restaurant.fr')}
          />
          {errors.email && (
            <span className="form-error">
              {errors.email === 'invalid' 
                ? t('common.invalidEmail', 'Email invalide') 
                : t('common.required', 'Ce champ est requis')
              }
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div className={`form-group ${errors.password ? 'error' : ''}`}>
        <label>
          <RiLockPasswordLine />
          {t('restaurants.form.password', 'Mot de passe')} 
          {!isEditMode && <span className="required">*</span>}
          {isEditMode && <span className="optional">({t('common.optional', 'optionnel')})</span>}
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditMode 
              ? t('restaurants.form.passwordPlaceholderEdit', 'Laisser vide pour ne pas modifier')
              : t('restaurants.form.passwordPlaceholder', 'Minimum 8 caractères')
            }
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
        {errors.password && (
          <span className="form-error">
            {errors.password === 'minLength' 
              ? t('common.minLength', 'Minimum 6 caractères') 
              : t('common.required', 'Ce champ est requis')
            }
          </span>
        )}
      </div>

      {/* Statut - Checkbox */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="status"
            checked={formData.status === 'active'}
            onChange={handleChange}
          />
          <span className="checkmark"></span>
          <span className="checkbox-text">
            {t('restaurants.form.activeStatus', 'Restaurant actif')}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button 
          type="button" 
          className="btn-cancel" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          {t('common.cancel', 'Annuler')}
        </button>
        <button 
          type="submit" 
          className="btn-submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <span className="btn-spinner"></span> : t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
};

export default RestaurantsForm;