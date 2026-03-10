import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiToggleLine,
  RiToggleFill,
  RiDeleteBin6Line,
  RiAlertLine,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import './css/SettingsSections.css';

const AccountSection = ({ restaurant, saving, onToggleActive, onDeleteAccount }) => {
  const { t } = useTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteError, setDeleteError] = useState('');

  const rawStatus =
    restaurant?.status ??
    restaurant?.statut ??
    restaurant?.etat ??
    restaurant?.isActive ??
    restaurant?.actif;

  const isOpen =
    rawStatus === 'Ouvert' ||
    rawStatus === true ||
    rawStatus === 'true' ||
    rawStatus === 1;

  const handleToggle = async () => {
    const result = await onToggleActive(!isOpen);

    if (result.success) {
      setMessage({
        type: 'success',
        text: isOpen ? 'Restaurant fermé' : 'Restaurant ouvert'
      });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setDeleteError('Mot de passe requis');
      return;
    }

    const result = await onDeleteAccount(deletePassword);
    if (!result.success) {
      setDeleteError(result.error);
    }
  };

  return (
    <div className="ss-section">
      <div className="ss-header">
        <h3>{t('settings.account.title', 'Gestion du compte')}</h3>
        <p>{t('settings.account.subtitle', 'Ouvrez, fermez ou supprimez votre compte')}</p>
      </div>

      {message.text && (
        <div className={`ss-message ss-message-${message.type}`}>
          {message.type === 'success' ? <RiCheckLine /> : <RiCloseLine />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="ss-card">
        <div className="ss-card-header">
          <div className="ss-card-info">
            <h4>Statut du restaurant</h4>
            <p>Ouvrez ou fermez votre restaurant</p>
          </div>
          <div className={`ss-status-badge ${isOpen ? 'active' : 'inactive'}`}>
            {isOpen ? 'Ouvert' : 'Fermé'}
          </div>
        </div>

        <div className="ss-card-content">
          <p className="ss-card-desc">
            {isOpen
              ? 'Votre restaurant est ouvert et peut recevoir des commandes.'
              : 'Votre restaurant est fermé et ne peut pas recevoir de commandes.'
            }
          </p>

          <button
            className={`ss-toggle-btn ${isOpen ? 'active' : ''}`}
            onClick={handleToggle}
            disabled={saving}
          >
            {saving ? (
              <RiLoader4Line className="ss-spinner" />
            ) : isOpen ? (
              <RiToggleFill />
            ) : (
              <RiToggleLine />
            )}
            <span>{isOpen ? 'Fermer' : 'Ouvrir'}</span>
          </button>
        </div>
      </div>

      <div className="ss-card ss-card-danger">
        <div className="ss-card-header">
          <div className="ss-card-info">
            <h4>
              <RiAlertLine />
              Zone de danger
            </h4>
            <p>Actions irréversibles</p>
          </div>
        </div>

        <div className="ss-card-content">
          <p className="ss-card-desc ss-text-danger">
            La suppression de votre compte est définitive. Toutes vos données,
            commandes et configurations seront perdues.
          </p>

          <button
            className="ss-btn ss-btn-danger"
            onClick={() => setShowDeleteDialog(true)}
            disabled={saving}
          >
            <RiDeleteBin6Line />
            <span>Supprimer mon compte</span>
          </button>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="ss-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="ss-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ss-dialog-header">
              <RiAlertLine className="ss-dialog-icon" />
              <h4>Supprimer le compte ?</h4>
            </div>

            <div className="ss-dialog-body">
              <p>
                Cette action est <strong>irréversible</strong>.
                Entrez votre mot de passe pour confirmer.
              </p>

              <div className={`ss-field ${deleteError ? 'ss-field-error' : ''}`}>
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="Votre mot de passe"
                />
                {deleteError && (
                  <span className="ss-field-error-text">{deleteError}</span>
                )}
              </div>
            </div>

            <div className="ss-dialog-actions">
              <button
                className="ss-btn ss-btn-ghost"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
              >
                Annuler
              </button>

              <button
                className="ss-btn ss-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RiLoader4Line className="ss-spinner" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer définitivement</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection;