import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiImageEditLine,
  RiSave3Line,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import './css/SettingsSections.css';

const ProfileSection = ({ restaurant, saving, onUpdateInfo, onUpdateLogo }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (restaurant) {
      setForm({
        nom: restaurant.nom || restaurant.name || '',
        email: restaurant.email || '',
        telephone: restaurant.telephone || restaurant.phone || '',
        adresse: restaurant.adresse || restaurant.address || '',
        description: restaurant.description || '',
      });
      setLogoPreview(restaurant.logo || restaurant.image || null);
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    const result = await onUpdateLogo(file);

    if (result.success) {
      setMessage({ type: 'success', text: 'Logo mis à jour !' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Payload large pour couvrir plusieurs noms de champs backend
    const payload = {
      nom: form.nom,
      name: form.nom,
      email: form.email,
      telephone: form.telephone,
      phone: form.telephone,
      adresse: form.adresse,
      address: form.adresse,
      description: form.description,
    };

    const result = await onUpdateInfo(payload);

    if (result.success) {
      setMessage({ type: 'success', text: 'Informations mises à jour !' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="ss-section">
      <div className="ss-header">
        <h3>{t('settings.profile.title', 'Profil du restaurant')}</h3>
        <p>{t('settings.profile.subtitle', 'Gérez les informations de votre restaurant')}</p>
      </div>

      {message.text && (
        <div className={`ss-message ss-message-${message.type}`}>
          {message.type === 'success' ? <RiCheckLine /> : <RiCloseLine />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="ss-logo-section">
        <div className="ss-logo-wrapper" onClick={handleLogoClick}>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="ss-logo-img" />
          ) : (
            <div className="ss-logo-placeholder">
              <RiImageEditLine />
            </div>
          )}
          <div className="ss-logo-overlay">
            <RiImageEditLine />
            <span>Changer</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{ display: 'none' }}
        />

        <span className="ss-logo-hint">Cliquez pour changer le logo</span>
      </div>

      <form className="ss-form" onSubmit={handleSubmit}>
        <div className="ss-form-grid">
          <div className="ss-field">
            <label>Nom du restaurant *</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex: Chez Mama"
              required
            />
          </div>

          <div className="ss-field">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@restaurant.com"
              required
            />
          </div>

          <div className="ss-field">
            <label>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="+228 90 00 00 00"
            />
          </div>

          <div className="ss-field">
            <label>Adresse</label>
            <input
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              placeholder="123 Rue Example, Lomé"
            />
          </div>

          <div className="ss-field ss-field-full">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre restaurant..."
              rows={3}
            />
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
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <RiSave3Line />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;