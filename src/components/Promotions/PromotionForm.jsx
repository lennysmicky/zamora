import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';


const PromotionForm = ({ onSubmit, onCancel, initialData }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.endDate < formData.startDate) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='promotion-form'>
      <div className="form-group">
        <label>{t('Titre de la promotion')}</label>
        <input
          type="text"
          name="title"
          placeholder={t('titre de la promotion')}
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('description ')}
          <span className='required'>*</span>
        </label>
        <textarea
          name="description"
          placeholder={t('description de la promotion ')}
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>{t('date de debut ')}
          <span className='required'>*</span>
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('date de fin ')}
          <span className='required'>*</span>
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-actions">
  <button
    type="button"
    className='cancel'
    onClick={onCancel}
  >
    {t('common.cancel')}
  </button>
  <button type="submit" className='secondary'>
    {initialData ? t('mettre à jour') : t('creer')}
  </button>
</div>
    </form>
  );
};

export default PromotionForm;
