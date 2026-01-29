import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiStore2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine
} from 'react-icons/ri';
import './RestaurantsForm.css';

const RestaurantsForm = ({ 
  restaurant, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone ? String(restaurant.phone) : '',
        email: restaurant.email || '',
        status: restaurant.status || 'ouvert'
      });
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        status: checked ? 'ouvert' : 'fermé' 
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
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