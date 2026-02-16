// src/components/specialOffers/SpecialOfferForm.jsx
import React, { useState, useEffect } from 'react';
import {
  RiImageAddLine,
  RiCloseLine,
  RiMagicLine,
  RiTimeLine,
  RiCalendarLine,
  RiLoader4Line,
  RiSave3Line
} from 'react-icons/ri';
import './css/SpecialOfferForm.css';

const SpecialOfferForm = ({
  offer,
  onSubmit,
  onCancel,
  onGenerateCode,
  loading,
  t
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    imagePreview: null,
    type: 'percentage',
    value: '',
    targetType: 'all',
    targetItems: [],
    targetCategory: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [],
    minOrderAmount: '',
    channels: [],
    maxRedemptions: '',
    maxPerCustomer: '',
    promoCode: '',
    autoGenerateCode: false,
    status: 'draft'
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        image: null,
        imagePreview: offer.image || null,
        type: offer.type || 'percentage',
        value: offer.value || '',
        targetType: offer.targetType || 'all',
        targetItems: offer.targetItems || [],
        targetCategory: offer.targetCategory || '',
        startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
        endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
        startTime: offer.startTime || '',
        endTime: offer.endTime || '',
        daysOfWeek: offer.daysOfWeek || [],
        minOrderAmount: offer.minOrderAmount || '',
        channels: offer.channels || [],
        maxRedemptions: offer.maxRedemptions || '',
        maxPerCustomer: offer.maxPerCustomer || '',
        promoCode: offer.promoCode || '',
        autoGenerateCode: false,
        status: offer.status || 'draft'
      });
    }
  }, [offer]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  const handleGenerateCode = async () => {
    const code = await onGenerateCode();
    if (code) {
      handleChange('promoCode', code);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day];
      return { ...prev, daysOfWeek: days };
    });
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => {
      const channels = prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels: channels };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('validation.required', 'Champ requis');
    }
    
    if (!formData.type) {
      newErrors.type = t('validation.required', 'Champ requis');
    }
    
    if (!formData.value && formData.type !== 'free_delivery' && formData.type !== 'bogo') {
      newErrors.value = t('validation.required', 'Champ requis');
    }
    
    if (!formData.startDate) {
      newErrors.startDate = t('validation.required', 'Champ requis');
    }
    
    if (!formData.endDate) {
      newErrors.endDate = t('validation.required', 'Champ requis');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const daysOfWeek = [
    { key: 'mon', label: t('days.mon', 'Lun') },
    { key: 'tue', label: t('days.tue', 'Mar') },
    { key: 'wed', label: t('days.wed', 'Mer') },
    { key: 'thu', label: t('days.thu', 'Jeu') },
    { key: 'fri', label: t('days.fri', 'Ven') },
    { key: 'sat', label: t('days.sat', 'Sam') },
    { key: 'sun', label: t('days.sun', 'Dim') }
  ];

  const channels = [
    { key: 'dine_in', label: t('specialOffers.channels.dineIn', 'Sur place') },
    { key: 'takeaway', label: t('specialOffers.channels.takeaway', 'À emporter') },
    { key: 'delivery', label: t('specialOffers.channels.delivery', 'Livraison') }
  ];

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      {/* Section: Infos de base */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.basicInfo', 'Informations de base')}
        </h4>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>{t('specialOffers.form.title', 'Titre')} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('specialOffers.form.titlePlaceholder', 'Ex: Happy Hour -20%')}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>{t('specialOffers.form.description', 'Description courte')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('specialOffers.form.descriptionPlaceholder', 'Décrivez votre offre...')}
              rows={3}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.image', 'Image (optionnel)')}</label>
            <div className="image-upload-zone">
              {formData.imagePreview ? (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    <RiCloseLine />
                  </button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <RiImageAddLine />
                  <span>{t('specialOffers.form.uploadImage', 'Ajouter une image')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Type d'offre */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.offerType', 'Type d\'offre')}
        </h4>

        <div className="offer-type-grid">
          {[
            { key: 'percentage', label: '% Remise', icon: '🏷️' },
            { key: 'fixed', label: 'Montant fixe', icon: '💰' },
            { key: 'special_price', label: 'Prix spécial', icon: '⭐' },
            { key: 'bundle', label: 'Bundle', icon: '📦' },
            { key: 'bogo', label: '1 acheté = 1 offert', icon: '🎁' },
            { key: 'free_delivery', label: 'Livraison gratuite', icon: '🚚' }
          ].map(type => (
            <button
              key={type.key}
              type="button"
              className={`offer-type-btn ${formData.type === type.key ? 'active' : ''}`}
              onClick={() => handleChange('type', type.key)}
            >
              <span className="type-icon">{type.icon}</span>
              <span className="type-label">{type.label}</span>
            </button>
          ))}
        </div>

        {(formData.type === 'percentage' || formData.type === 'fixed' || formData.type === 'special_price') && (
          <div className="form-row">
            <div className="form-group">
              <label>
                {formData.type === 'percentage' 
                  ? t('specialOffers.form.percentage', 'Pourcentage de remise')
                  : formData.type === 'fixed'
                    ? t('specialOffers.form.fixedAmount', 'Montant de la remise')
                    : t('specialOffers.form.specialPrice', 'Prix spécial')
                } *
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={errors.value ? 'error' : ''}
                />
                <span className="input-suffix">
                  {formData.type === 'percentage' ? '%' : 'F CFA'}
                </span>
              </div>
              {errors.value && <span className="form-error">{errors.value}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Section: Cible */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.target', 'Cible de l\'offre')}
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.targetType', 'Appliquer sur')}</label>
            <select
              value={formData.targetType}
              onChange={(e) => handleChange('targetType', e.target.value)}
            >
              <option value="all">{t('specialOffers.target.all', 'Tout le menu')}</option>
              <option value="category">{t('specialOffers.target.category', 'Une catégorie')}</option>
              <option value="item">{t('specialOffers.target.items', 'Articles spécifiques')}</option>
            </select>
          </div>
        </div>

        {/* TODO: Add category/items selector based on targetType */}
      </div>

      {/* Section: Période */}
      <div className="form-section">
        <h4 className="form-section-title">
          <RiCalendarLine />
          {t('specialOffers.form.period', 'Période de validité')}
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.startDate', 'Date de début')} *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>
          <div className="form-group">
            <label>{t('specialOffers.form.endDate', 'Date de fin')} *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={errors.endDate ? 'error' : ''}
            />
            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.startTime', 'Heure de début')}</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>{t('specialOffers.form.endTime', 'Heure de fin')}</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>{t('specialOffers.form.daysOfWeek', 'Jours de la semaine')}</label>
            <div className="days-selector">
              {daysOfWeek.map(day => (
                <button
                  key={day.key}
                  type="button"
                  className={`day-btn ${formData.daysOfWeek.includes(day.key) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(day.key)}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <span className="form-hint">
              {t('specialOffers.form.daysHint', 'Laissez vide pour tous les jours')}
            </span>
          </div>
        </div>
      </div>

      {/* Section: Conditions */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.conditions', 'Conditions')}
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.minOrder', 'Commande minimum')}</label>
            <div className="input-with-suffix">
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                placeholder="0"
                min="0"
              />
              <span className="input-suffix">F CFA</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>{t('specialOffers.form.channels', 'Canaux')}</label>
            <div className="channels-selector">
              {channels.map(channel => (
                <label key={channel.key} className="channel-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes(channel.key)}
                    onChange={() => handleChannelToggle(channel.key)}
                  />
                  <span>{channel.label}</span>
                </label>
              ))}
            </div>
            <span className="form-hint">
              {t('specialOffers.form.channelsHint', 'Laissez vide pour tous les canaux')}
            </span>
          </div>
        </div>
      </div>

      {/* Section: Limites */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.limits', 'Limites d\'utilisation')}
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t('specialOffers.form.maxRedemptions', 'Utilisations totales max')}</label>
            <input
              type="number"
              value={formData.maxRedemptions}
              onChange={(e) => handleChange('maxRedemptions', e.target.value)}
              placeholder={t('specialOffers.form.unlimited', 'Illimité')}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>{t('specialOffers.form.maxPerCustomer', 'Max par client')}</label>
            <input
              type="number"
              value={formData.maxPerCustomer}
              onChange={(e) => handleChange('maxPerCustomer', e.target.value)}
              placeholder={t('specialOffers.form.unlimited', 'Illimité')}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Section: Code promo */}
      <div className="form-section">
        <h4 className="form-section-title">
          {t('specialOffers.form.promoCode', 'Code promo (optionnel)')}
        </h4>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>{t('specialOffers.form.code', 'Code')}</label>
            <div className="promo-code-input">
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                placeholder="SUMMER20"
              />
              <button
                type="button"
                className="generate-code-btn"
                onClick={handleGenerateCode}
              >
                <RiMagicLine />
                <span>{t('specialOffers.form.generate', 'Générer')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel', 'Annuler')}
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <RiLoader4Line className="spin" />
              <span>{t('common.saving', 'Enregistrement...')}</span>
            </>
          ) : (
            <>
              <RiSave3Line />
              <span>
                {offer 
                  ? t('common.save', 'Enregistrer')
                  : t('specialOffers.form.create', 'Créer l\'offre')
                }
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SpecialOfferForm;