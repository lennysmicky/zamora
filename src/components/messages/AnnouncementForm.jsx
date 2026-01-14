// src/components/messages/AnnouncementForm.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import './messages.css';

const AnnouncementForm = ({ isOpen, onClose, onSubmit, sending }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target: 'all',
    expires_at: ''
  });

  const [errors, setErrors] = useState({});

  // Gérer les changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Valider
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = t('messages.errors.titleRequired');
    }
    if (!formData.content.trim()) {
      newErrors.content = t('messages.errors.contentRequired');
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

  // Reset form quand on ferme
  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target: 'all',
      expires_at: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('messages.newAnnouncement')}
    >
      <form className="announcement-form" onSubmit={handleSubmit}>
        {/* Titre */}
        <div className="announcement-form-group">
          <label htmlFor="title">{t('messages.announcementTitle')}</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('messages.announcementTitlePlaceholder')}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="announcement-form-error">{errors.title}</span>}
        </div>

        {/* Contenu */}
        <div className="announcement-form-group">
          <label htmlFor="content">{t('messages.announcementContent')}</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder={t('messages.announcementContentPlaceholder')}
            rows={4}
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <span className="announcement-form-error">{errors.content}</span>}
        </div>

        {/* Type */}
        <div className="announcement-form-group">
          <label htmlFor="type">{t('messages.announcementTypeLabel')}</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="info">{t('messages.announcementType.info')}</option>
            <option value="warning">{t('messages.announcementType.warning')}</option>
            <option value="urgent">{t('messages.announcementType.urgent')}</option>
          </select>
        </div>

        {/* Cible */}
        <div className="announcement-form-group">
          <label htmlFor="target">{t('messages.announcementTarget')}</label>
          <select
            id="target"
            name="target"
            value={formData.target}
            onChange={handleChange}
          >
            <option value="all">{t('messages.targetAll')}</option>
            <option value="specific">{t('messages.targetSpecific')}</option>
          </select>
        </div>

        {/* Date d'expiration */}
        <div className="announcement-form-group">
          <label htmlFor="expires_at">{t('messages.expiresAt')} ({t('messages.optional')})</label>
          <input
            type="date"
            id="expires_at"
            name="expires_at"
            value={formData.expires_at}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Actions */}
        <div className="announcement-form-actions">
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
            {sending ? t('messages.sending') : t('messages.publish')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementForm;