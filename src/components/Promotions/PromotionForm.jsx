import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiCloseLine,
  RiSaveLine,
  RiPercentLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './PromotionForm.css';

const PromotionForm = ({
  isOpen,
  onClose,
  onSubmit,
  promotion = null,
  restaurants = [],
  loading = false
}) => {
  const { t } = useTranslation();
  const isEdit = !!promotion;

  const initialState = {
    title: '',
    description: '',
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    restaurant_id: '',
    start_date: '',
    end_date: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        code: promotion.code || '',
        discount_type: promotion.discount_type || 'percentage',
        discount_value: promotion.discount_value || '',
        min_order_amount: promotion.min_order_amount || '',
        restaurant_id: promotion.restaurant_id || '',
        start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
        is_active: promotion.is_active ?? true
      });
    } else {
      setFormData(initialState);
    }
    setErrors({});
  }, [promotion, isOpen]);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('promotions.errors.titleRequired');
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value = t('promotions.errors.discountRequired');
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      newErrors.discount_value = t('promotions.errors.percentageMax');
    }

    if (!formData.start_date) {
      newErrors.start_date = t('promotions.errors.startDateRequired');
    }

    if (!formData.end_date) {
      newErrors.end_date = t('promotions.errors.endDateRequired');
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = t('promotions.errors.endDateInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="promotion-form-overlay" onClick={onClose}>
      <div className="promotion-form-modal" onClick={e => e.stopPropagation()}>
        <div className="promotion-form-header">
          <h2>
            {isEdit ? t('promotions.form.editTitle') : t('promotions.form.createTitle')}
          </h2>
          <button className="promotion-form-close" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="promotion-form">
          <div className="promotion-form-body">
            {/* Titre */}
            <div className="form-group">
              <label htmlFor="title">{t('promotions.form.title')} *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('promotions.form.titlePlaceholder')}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">{t('promotions.form.description')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('promotions.form.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Code promo */}
            <div className="form-group">
              <label htmlFor="code">{t('promotions.form.code')}</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder={t('promotions.form.codePlaceholder')}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* Type et valeur de réduction */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('promotions.form.discountType')} *</label>
                <div className="discount-type-buttons">
                  <button
                    type="button"
                    className={`discount-type-btn ${formData.discount_type === 'percentage' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, discount_type: 'percentage' }))}
                  >
                    <RiPercentLine />
                    {t('promotions.form.percentage')}
                  </button>
                  <button
                    type="button"
                    className={`discount-type-btn ${formData.discount_type === 'fixed' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, discount_type: 'fixed' }))}
                  >
                    <RiMoneyDollarCircleLine />
                    {t('promotions.form.fixedAmount')}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discount_value">{t('promotions.form.discountValue')} *</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="discount_value"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    className={errors.discount_value ? 'error' : ''}
                  />
                  <span className="input-suffix">
                    {formData.discount_type === 'percentage' ? '%' : 'FCFA'}
                  </span>
                </div>
                {errors.discount_value && <span className="error-message">{errors.discount_value}</span>}
              </div>
            </div>

            {/* Montant minimum */}
            <div className="form-group">
              <label htmlFor="min_order_amount">{t('promotions.form.minOrderAmount')}</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="min_order_amount"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
                <span className="input-suffix">FCFA</span>
              </div>
            </div>

            {/* Restaurant */}
            <div className="form-group">
              <label htmlFor="restaurant_id">{t('promotions.form.restaurant')}</label>
              <select
                id="restaurant_id"
                name="restaurant_id"
                value={formData.restaurant_id}
                onChange={handleChange}
              >
                <option value="">{t('promotions.form.allRestaurants')}</option>
                {restaurants.map(resto => (
                  <option key={resto.id} value={resto.id}>{resto.name}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">{t('promotions.form.startDate')} *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={errors.start_date ? 'error' : ''}
                />
                {errors.start_date && <span className="error-message">{errors.start_date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="end_date">{t('promotions.form.endDate')} *</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={errors.end_date ? 'error' : ''}
                />
                {errors.end_date && <span className="error-message">{errors.end_date}</span>}
              </div>
            </div>

            {/* Active */}
            <div className="form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                {t('promotions.form.isActive')}
              </label>
            </div>
          </div>

          <div className="promotion-form-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <span className="btn-loading"></span>
              ) : (
                <>
                  <RiSaveLine />
                  {isEdit ? t('common.save') : t('common.create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm;