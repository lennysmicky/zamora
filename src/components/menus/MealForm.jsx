// src/components/menus/MealForm.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiImageAddLine, RiCloseLine } from 'react-icons/ri';
import Modal from '../common/Modal';
import './MealForm.css';

const MealForm = ({
    isOpen,
    onClose,
    onSubmit,
    meal = null,
    categories = [],
    selectedCategoryId = null,
    isLoading = false
}) => {
    const { t } = useTranslation();

    const isEditing = !!meal;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: null,
        price: '',
        isAvailable: true,
        image: ''
    });

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    // Remplir le formulaire si édition
    useEffect(() => {
        if (meal) {
            setFormData({
                name: meal.name || '',
                description: meal.description || '',
                categoryId: meal.categoryId || selectedCategoryId,
                price: meal.price?.toString() || '',
                isAvailable: meal.isAvailable ?? true,
                image: meal.image || ''
            });
            setImagePreview(meal.image || null);
        } else {
            setFormData({
                name: '',
                description: '',
                categoryId: selectedCategoryId,
                price: '',
                isAvailable: true,
                image: ''
            });
            setImagePreview(null);
        }
        setErrors({});
    }, [meal, selectedCategoryId, isOpen]);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'invalidType' }));
                return;
            }

            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'tooLarge' }));
                return;
            }

            // Créer preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);

            setErrors(prev => ({ ...prev, image: null }));
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'tooShort';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'required';
        }

        if (!formData.price) {
            newErrors.price = 'required';
        } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
            newErrors.price = 'invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const result = await onSubmit({
            ...formData,
            categoryId: parseInt(formData.categoryId),
            price: parseFloat(formData.price)
        });

        if (result?.success) {
            onClose();
        }
    };

    const title = isEditing
        ? t('menu.meals.edit')
        : t('menu.meals.add');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
            <form className="meal-form" onSubmit={handleSubmit}>
                <div className="meal-form-grid">
                    {/* Colonne gauche */}
                    <div className="meal-form-left">
                        {/* Nom */}
                        <div className={`form-group ${errors.name ? 'error' : ''}`}>
                            <label htmlFor="meal-name">
                                {t('menu.meals.name')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="meal-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('menu.meals.namePlaceholder')}
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
                            <label htmlFor="meal-description">
                                {t('menu.meals.description')}
                            </label>
                            <textarea
                                id="meal-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={t('menu.meals.descriptionPlaceholder')}
                                rows={3}
                            />
                        </div>

                        {/* Catégorie */}
                        <div className={`form-group ${errors.categoryId ? 'error' : ''}`}>
                            <label htmlFor="meal-category">
                                {t('menu.meals.category')} <span className="required">*</span>
                            </label>
                            <select
                                id="meal-category"
                                name="categoryId"
                                value={formData.categoryId || ''}
                                onChange={handleChange}
                                className="custom-select"
                            >
                                <option value="">{t('menu.meals.selectCategory')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <span className="form-error">
                                    {t(`menu.errors.${errors.categoryId}`)}
                                </span>
                            )}
                        </div>

                        {/* Prix */}
                        <div className={`form-group ${errors.price ? 'error' : ''}`}>
                            <label htmlFor="meal-price">
                                {t('menu.meals.price')} <span className="required">*</span>
                            </label>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    id="meal-price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder={t('menu.meals.pricePlaceholder')}
                                    min="0"
                                    step="0.01"
                                />
                                <span className="price-currency">{t('menu.meals.currency')}</span>
                            </div>
                            {errors.price && (
                                <span className="form-error">
                                    {t(`menu.errors.${errors.price}`)}
                                </span>
                            )}
                        </div>

                        {/* Disponible */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                <span>{t('menu.meals.available')}</span>
                            </label>
                        </div>
                    </div>

                    {/* Colonne droite - Image */}
                    <div className="meal-form-right">
                        <div className={`form-group ${errors.image ? 'error' : ''}`}>
                            <label>{t('menu.meals.image')}</label>

                            <div className="image-upload-container">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="image-remove-btn"
                                            onClick={handleRemoveImage}
                                        >
                                            <RiCloseLine />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="image-upload-area">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                        />
                                        <RiImageAddLine className="upload-icon" />
                                        <span>{t('menu.meals.imageUpload')}</span>
                                        <span className="upload-hint">PNG, JPG (max 5MB)</span>
                                    </label>
                                )}
                            </div>

                            {errors.image && (
                                <span className="form-error">
                                    {t(`menu.errors.${errors.image}`)}
                                </span>
                            )}
                        </div>
                    </div>
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

export default MealForm;