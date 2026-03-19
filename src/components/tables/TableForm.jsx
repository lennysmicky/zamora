import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
const statusOf = (t) => t?.statut ?? t?.status ?? t?.etat ?? t?.state ?? "libre";

const TableForm = ({
  table = null,
  onSubmit,
  onCreateMultiple,
  onCancel,
  onRegenerateQR,
  saving,
  existingNumbers = [],
}) => {
  const { t } = useTranslation();
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
      status: statusOf(table),
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
      setError(t('tables.errors.numberRequired'));
      return;
    }

    const existing = (existingNumbers || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));

    const prevNum = Number(numOf(table));
    const isOwnNumber = isEditMode && Number.isFinite(prevNum) && prevNum === currentNum;

    if (!isOwnNumber && existing.includes(currentNum)) {
      setError(t('tables.errors.numberExists'));
      return;
    }

    const rawName = String(form.nom ?? "").trim();

    const payload = {
      ...(isEditMode ? { _id: table?._id || table?.id } : {}),
      numero_table: currentNum,
      capacite: Number.parseInt(String(form.capacite ?? ""), 10) || 4,
      status: form.status,
      statut: form.status,
      ...(rawName
        ? { nom: rawName, name: rawName, nom_table: rawName }
        : isEditMode
        ? {}
        : { nom: `${t('tables.card.table')} ${currentNum}`, name: `${t('tables.card.table')} ${currentNum}`, nom_table: `${t('tables.card.table')} ${currentNum}` }),
    };

    const result = await onSubmit(payload);
    if (!result?.success) setError(result?.error || t('common.error'));
  };

  const handleMultipleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (multipleCount < 1 || multipleCount > 50) {
      setError(t('tables.errors.countInvalid'));
      return;
    }

    const result = await onCreateMultiple(multipleCount);
    if (!result?.success) setError(result?.error || t('common.error'));
  };

  const handleRegenerateQR = async () => {
    if (!table || !onRegenerateQR) return;
    const result = await onRegenerateQR(table._id || table.id);
    if (!result?.success) setError(result?.error || t('common.error'));
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
            <span>{t('tables.form.singleMode')}</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "multiple" ? "active" : ""}`}
            onClick={() => setMode("multiple")}
          >
            <RiGroupLine />
            <span>{t('tables.form.multipleMode')}</span>
          </button>
        </div>
      )}

      {isEditMode && (
        <div className="table-form-edit-header">
          <h4>{t('tables.form.editTitle')} {displayNum}</h4>
        </div>
      )}

      {error && <div className="table-form-error">{error}</div>}

      {(mode === "single" || isEditMode) && (
        <form onSubmit={handleSubmit}>
          <div className="table-form-grid">
            <div className="table-form-field">
              <label>{t('tables.form.number')} *</label>
              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder={isEditMode ? "" : t('tables.form.numberPlaceholder', { number: suggestedNumber })}
                min="1"
                required
              />
              {!isEditMode && (
                <span className="field-hint">{t('tables.form.numberSuggestion')} {suggestedNumber}</span>
              )}
            </div>

            <div className="table-form-field">
              <label>{t('tables.form.capacity')}</label>
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
              <label>{t('tables.form.name')}</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder={t('tables.form.namePlaceholder')}
              />
            </div>

            {isEditMode && (
              <div className="table-form-field full">
                <label>{t('tables.form.status')}</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="libre">{t('tables.status.libre')}</option>
                  <option value="occupee">{t('tables.status.occupee')}</option>
                  <option value="reservee">{t('tables.status.reservee')}</option>
                </select>
              </div>
            )}
          </div>

          <div className="table-form-info">
            <RiQrCodeLine />
            <p>
              {isEditMode
                ? t('tables.form.qrInfoEdit')
                : t('tables.form.qrInfo')}
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
              <span>{t('tables.form.regenerateQR')}</span>
            </button>
          )}

          <div className="table-form-actions">
            <button type="button" className="table-form-btn cancel" onClick={onCancel} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="table-form-btn submit" disabled={saving}>
              {saving ? (
                <>
                  <RiLoader4Line className="spin" />
                  <span>{isEditMode ? t('common.saving') : t('tables.form.creating')}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <RiSave3Line /> : <RiAddLine />}
                  <span>{isEditMode ? t('common.save') : t('tables.form.createTable')}</span>
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
              <label>{t('tables.form.count')}</label>
              <input
                type="number"
                value={multipleCount}
                onChange={(e) => setMultipleCount(Number.parseInt(e.target.value, 10) || 1)}
                min="1"
                max="50"
              />
              <span className="field-hint">
                {t('tables.card.table')} {suggestedNumber} - {suggestedNumber + multipleCount - 1}
              </span>
            </div>

            <div className="table-form-preview">
              <p>{t('tables.form.preview')}:</p>
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
            <p>{t('tables.form.qrInfo')}</p>
          </div>

          <div className="table-form-actions">
            <button type="button" className="table-form-btn cancel" onClick={onCancel} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="table-form-btn submit" disabled={saving}>
              {saving ? (
                <>
                  <RiLoader4Line className="spin" />
                  <span>{t('tables.form.creating')}</span>
                </>
              ) : (
                <>
                  <RiAddLine />
                  <span>{t('tables.form.createMultipleTables', { count: multipleCount })}</span>
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