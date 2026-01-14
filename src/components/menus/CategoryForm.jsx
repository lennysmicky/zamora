// src/components/menus/CategoryForm.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiCloseLine } from 'react-icons/ri';
import Modal from '../common/Modal';
import './CategoryForm.css';

const CategoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  isLoading = false
}) => {
  const { t } = useTranslation();
  
  const isEditing = !!category;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    isActive: true
  });
  
  const [errors, setErrors] = useState({});

  // Remplir le formulaire si édition
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        order: category.order || 1,
        isActive: category.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        order: 1,
        isActive: true
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'tooShort';
    }
    
    if (formData.order && (isNaN(formData.order) || formData.order < 1)) {
      newErrors.order = 'invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const result = await onSubmit({
      ...formData,
      order: parseInt(formData.order) || 1
    });
    
    if (result?.success) {
      onClose();
    }
  };

  const title = isEditing 
    ? t('menu.categories.edit') 
    : t('menu.categories.add');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <form className="category-form" onSubmit={handleSubmit}>
        {/* Nom */}
        <div className={`form-group ${errors.name ? 'error' : ''}`}>
          <label htmlFor="category-name">
            {t('menu.categories.name')} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="category-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('menu.categories.namePlaceholder')}
            autoFocus
          />
          {errors.name && (
            <span className="form-error">
              {t(`menu.errors.${errors.name}`)}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="category-description">
            {t('menu.categories.description')}
          </label>
          <textarea
            id="category-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('menu.categories.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        {/* Ordre d'affichage */}
        <div className={`form-group ${errors.order ? 'error' : ''}`}>
          <label htmlFor="category-order">
            {t('menu.categories.order')}
          </label>
          <input
            type="number"
            id="category-order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min={1}
          />
          {errors.order && (
            <span className="form-error">
              {t(`menu.errors.${errors.order}`)}
            </span>
          )}
        </div>

        {/* Actif */}
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            <span>{t('menu.categories.active')}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-spinner"></span>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;