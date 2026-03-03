// src/components/tables/TableForm.jsx
import React, { useState, useEffect } from "react";
import {
  RiAddLine,
  RiSave3Line,
  RiLoader4Line,
  RiTableLine,
  RiGroupLine,
  RiQrCodeLine,
  RiRefreshLine,
} from "react-icons/ri";
import "./css/TableComponents.css";

const numOf = (t) => t?.numero_table ?? t?.numero ?? t?.number ?? "";
const nameOf = (t) => t?.nom ?? t?.nom_table ?? t?.name ?? "";

const TableForm = ({
  table = null,
  onSubmit,
  onCreateMultiple,
  onCancel,
  onRegenerateQR,
  saving,
  existingNumbers = [],
}) => {
  const isEditMode = !!table;
  const [mode, setMode] = useState("single");

  const [form, setForm] = useState({
    numero: "",
    nom: "",
    capacite: 4,
    status: "libre",
  });

  const [multipleCount, setMultipleCount] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!table) return;
    setForm({
      numero: numOf(table) ?? "",
      nom: nameOf(table) ?? "",
      capacite: table?.capacite ?? table?.capacity ?? 4,
      status: table?.status ?? "libre",
    });
  }, [table]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const currentNum = Number.parseInt(String(form.numero ?? ""), 10);
    if (!Number.isFinite(currentNum) || currentNum < 1) {
      setError("Le numéro de table est requis");
      return;
    }

    const existing = (existingNumbers || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));

    const prevNum = Number(numOf(table));
    const isOwnNumber = isEditMode && Number.isFinite(prevNum) && prevNum === currentNum;

    if (!isOwnNumber && existing.includes(currentNum)) {
      setError("Ce numéro de table existe déjà");
      return;
    }

    const rawName = String(form.nom ?? "").trim();

    // ✅ en CREATE: nom par défaut si vide
    // ✅ en EDIT: si vide => on n’envoie pas de nom (ne pas écraser côté backend)
    const payload = {
      ...(isEditMode ? { _id: table?._id || table?.id } : {}),
      numero_table: currentNum,
      capacite: Number.parseInt(String(form.capacite ?? ""), 10) || 4,
      status: form.status,
      ...(rawName
        ? { nom: rawName, name: rawName, nom_table: rawName }
        : isEditMode
        ? {}
        : { nom: `Table ${currentNum}`, name: `Table ${currentNum}`, nom_table: `Table ${currentNum}` }),
    };

    const result = await onSubmit(payload);
    if (!result?.success) setError(result?.error || "Erreur");
  };

  const handleMultipleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (multipleCount < 1 || multipleCount > 50) {
      setError("Le nombre doit être entre 1 et 50");
      return;
    }

    const result = await onCreateMultiple(multipleCount);
    if (!result?.success) setError(result?.error || "Erreur");
  };

  const handleRegenerateQR = async () => {
    if (!table || !onRegenerateQR) return;
    const result = await onRegenerateQR(table._id || table.id);
    if (!result?.success) setError(result?.error || "Erreur");
  };

  const suggestedNumber =
    (existingNumbers?.length ?? 0) > 0 ? Math.max(...existingNumbers) + 1 : 1;

  const displayNum = numOf(table);

  return (
    <div className="table-form">
      {!isEditMode && (
        <div className="table-form-mode">
          <button
            type="button"
            className={`mode-btn ${mode === "single" ? "active" : ""}`}
            onClick={() => setMode("single")}
          >
            <RiTableLine />
            <span>Une table</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "multiple" ? "active" : ""}`}
            onClick={() => setMode("multiple")}
          >
            <RiGroupLine />
            <span>Plusieurs</span>
          </button>
        </div>
      )}

      {isEditMode && (
        <div className="table-form-edit-header">
          <h4>Modifier la Table {displayNum}</h4>
        </div>
      )}

      {error && <div className="table-form-error">{error}</div>}

      {(mode === "single" || isEditMode) && (
        <form onSubmit={handleSubmit}>
          <div className="table-form-grid">
            <div className="table-form-field">
              <label>Numéro de table *</label>
              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder={isEditMode ? "" : `Ex: ${suggestedNumber}`}
                min="1"
                required
              />
              {!isEditMode && (
                <span className="field-hint">Suggestion: Table {suggestedNumber}</span>
              )}
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

            {isEditMode && (
              <div className="table-form-field full">
                <label>Statut</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="libre">Libre</option>
                  <option value="occupee">Occupée</option>
                  <option value="reservee">Réservée</option>
                </select>
              </div>
            )}
          </div>

          <div className="table-form-info">
            <RiQrCodeLine />
            <p>
              {isEditMode
                ? "Le QR code sera régénéré automatiquement si vous changez le numéro"
                : "Un QR code unique sera généré automatiquement"}
            </p>
          </div>

          {isEditMode && onRegenerateQR && (
            <button
              type="button"
              className="table-form-btn regenerate"
              onClick={handleRegenerateQR}
              disabled={saving}
            >
              <RiRefreshLine />
              <span>Régénérer le QR Code</span>
            </button>
          )}

          <div className="table-form-actions">
            <button type="button" className="table-form-btn cancel" onClick={onCancel} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="table-form-btn submit" disabled={saving}>
              {saving ? (
                <>
                  <RiLoader4Line className="spin" />
                  <span>{isEditMode ? "Enregistrement..." : "Création..."}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <RiSave3Line /> : <RiAddLine />}
                  <span>{isEditMode ? "Enregistrer" : "Créer la table"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {!isEditMode && mode === "multiple" && (
        <form onSubmit={handleMultipleSubmit}>
          <div className="table-form-multiple">
            <div className="table-form-field">
              <label>Nombre de tables à créer</label>
              <input
                type="number"
                value={multipleCount}
                onChange={(e) => setMultipleCount(Number.parseInt(e.target.value, 10) || 1)}
                min="1"
                max="50"
              />
              <span className="field-hint">
                Tables {suggestedNumber} à {suggestedNumber + multipleCount - 1}
              </span>
            </div>

            <div className="table-form-preview">
              <p>Aperçu:</p>
              <div className="preview-numbers">
                {Array.from({ length: Math.min(multipleCount, 8) }, (_, i) => (
                  <span key={i} className="preview-number">
                    {suggestedNumber + i}
                  </span>
                ))}
                {multipleCount > 8 && <span className="preview-more">+{multipleCount - 8}</span>}
              </div>
            </div>
          </div>

          <div className="table-form-info">
            <RiQrCodeLine />
            <p>Un QR code unique sera généré pour chaque table</p>
          </div>

          <div className="table-form-actions">
            <button type="button" className="table-form-btn cancel" onClick={onCancel} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="table-form-btn submit" disabled={saving}>
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