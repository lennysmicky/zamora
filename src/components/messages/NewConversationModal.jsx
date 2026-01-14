// src/components/messages/NewConversationModal.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import './messages.css';

const NewConversationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  sending,
  restaurants = [],
  isAdmin
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    restaurant_id: '',
    subject: '',
    type: 'support',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // Gérer les changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Valider
  const validate = () => {
    const newErrors = {};
    if (isAdmin && !formData.restaurant_id) {
      newErrors.restaurant_id = t('messages.errors.restaurantRequired');
    }
    if (!formData.subject.trim()) {
      newErrors.subject = t('messages.errors.subjectRequired');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('messages.errors.messageRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Reset form
  const handleClose = () => {
    setFormData({
      restaurant_id: '',
      subject: '',
      type: 'support',
      message: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('messages.newConversation')}
    >
      <form className="new-conversation-form" onSubmit={handleSubmit}>
        {/* Restaurant (Admin only) */}
        {isAdmin && (
          <div className="new-conversation-form-group">
            <label htmlFor="restaurant_id">{t('messages.selectRestaurant')}</label>
            <select
              id="restaurant_id"
              name="restaurant_id"
              value={formData.restaurant_id}
              onChange={handleChange}
              className={errors.restaurant_id ? 'error' : ''}
            >
              <option value="">{t('messages.selectRestaurantPlaceholder')}</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            {errors.restaurant_id && (
              <span className="new-conversation-form-error">{errors.restaurant_id}</span>
            )}
          </div>
        )}

        {/* Type (Admin only) */}
        {isAdmin && (
          <div className="new-conversation-form-group">
            <label htmlFor="type">{t('messages.conversationType')}</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="support">{t('messages.typeSupport')}</option>
              <option value="info">{t('messages.typeInfo')}</option>
              <option value="warning">{t('messages.typeWarning')}</option>
            </select>
          </div>
        )}

        {/* Sujet */}
        <div className="new-conversation-form-group">
          <label htmlFor="subject">{t('messages.subject')}</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder={t('messages.subjectPlaceholder')}
            className={errors.subject ? 'error' : ''}
          />
          {errors.subject && (
            <span className="new-conversation-form-error">{errors.subject}</span>
          )}
        </div>

        {/* Message */}
        <div className="new-conversation-form-group">
          <label htmlFor="message">{t('messages.message')}</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t('messages.messagePlaceholder')}
            rows={4}
            className={errors.message ? 'error' : ''}
          />
          {errors.message && (
            <span className="new-conversation-form-error">{errors.message}</span>
          )}
        </div>

        {/* Actions */}
        <div className="new-conversation-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={sending}
          >
            {t('messages.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending}
          >
            {sending ? t('messages.sending') : t('messages.startConversation')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewConversationModal;