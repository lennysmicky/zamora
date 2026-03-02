// src/components/tables/TableForm.jsx
import React, { useState } from 'react';
import {
  RiAddLine,
  RiLoader4Line,
  RiTableLine,
  RiGroupLine
} from 'react-icons/ri';
import './css/TableComponents.css';

const TableForm = ({ onSubmit, onCreateMultiple, onCancel, saving, existingNumbers }) => {
  const [mode, setMode] = useState('single'); // single | multiple
  const [form, setForm] = useState({
    numero: '',
    nom: '',
    capacite: 4,
  });
  const [multipleCount, setMultipleCount] = useState(5);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.numero) {
      setError('Le numéro de table est requis');
      return;
    }

    if (existingNumbers.includes(parseInt(form.numero))) {
      setError('Ce numéro de table existe déjà');
      return;
    }

    const result = await onSubmit({
      numero: parseInt(form.numero),
      nom: form.nom || `Table ${form.numero}`,
      capacite: parseInt(form.capacite) || 4,
      status: 'libre'
    });

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleMultipleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (multipleCount < 1 || multipleCount > 50) {
      setError('Le nombre doit être entre 1 et 50');
      return;
    }

    const result = await onCreateMultiple(multipleCount);
    if (!result.success) {
      setError(result.error);
    }
  };

  // Suggérer le prochain numéro
  const suggestedNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;

  return (
    <div className="table-form">
      {/* Mode Toggle */}
      <div className="table-form-mode">
        <button
          type="button"
          className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
          onClick={() => setMode('single')}
        >
          <RiTableLine />
          <span>Une table</span>
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === 'multiple' ? 'active' : ''}`}
          onClick={() => setMode('multiple')}
        >
          <RiGroupLine />
          <span>Plusieurs tables</span>
        </button>
      </div>

      {error && <div className="table-form-error">{error}</div>}

      {mode === 'single' ? (
        <form onSubmit={handleSingleSubmit}>
          <div className="table-form-grid">
            <div className="table-form-field">
              <label>Numéro de table *</label>
              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder={`Ex: ${suggestedNumber}`}
                min="1"
                required
              />
              <span className="field-hint">Suggestion: Table {suggestedNumber}</span>
            </div>

            <div className="table-form-field">
              <label>Capacité (personnes)</label>
              <input
                type="number"
                name="capacite"
                value={form.capacite}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>

            <div className="table-form-field full">
              <label>Nom (optionnel)</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex: Terrasse, VIP, Fenêtre..."
              />
            </div>
          </div>

          <div className="table-form-info">
            <RiQrCodeLine />
            <p>Un QR code unique sera généré automatiquement pour cette table</p>
          </div>

          <div className="table-form-actions">
            <button 
              type="button" 
              className="table-form-btn cancel"
              onClick={onCancel}
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="table-form-btn submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RiLoader4Line className="spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <RiAddLine />
                  <span>Créer la table</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleMultipleSubmit}>
          <div className="table-form-multiple">
            <div className="table-form-field">
              <label>Nombre de tables à créer</label>
              <input
                type="number"
                value={multipleCount}
                onChange={(e) => setMultipleCount(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
              />
              <span className="field-hint">
                Tables {suggestedNumber} à {suggestedNumber + multipleCount - 1} seront créées
              </span>
            </div>

            <div className="table-form-preview">
              <p>Aperçu:</p>
              <div className="preview-numbers">
                {Array.from({ length: Math.min(multipleCount, 10) }, (_, i) => (
                  <span key={i} className="preview-number">
                    {suggestedNumber + i}
                  </span>
                ))}
                {multipleCount > 10 && <span className="preview-more">...</span>}
              </div>
            </div>
          </div>

          <div className="table-form-info">
            <RiQrCodeLine />
            <p>Un QR code unique sera généré pour chaque table</p>
          </div>

          <div className="table-form-actions">
            <button 
              type="button" 
              className="table-form-btn cancel"
              onClick={onCancel}
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="table-form-btn submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RiLoader4Line className="spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <RiAddLine />
                  <span>Créer {multipleCount} tables</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TableForm;

// Ajout de l'icône manquante en haut du fichier
import { RiQrCodeLine } from 'react-icons/ri';