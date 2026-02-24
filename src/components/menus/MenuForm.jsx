// src/components/menus/MenuForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiImageAddLine, RiCloseLine } from "react-icons/ri";
import Modal from "../common/Modal";
import useAuthStore from "../../stores/authStore";
import "./MealForm.css"; // réutilise le design existant

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const idOf = (x) => x?.id ?? x?._id ?? null;

const getRole = () => {
  try {
    return localStorage.getItem("user_role");
  } catch {
    return null;
  }
};

const toInputDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const MenuForm = ({
  isOpen,
  onClose,
  onSubmit,
  menu = null,
  restaurants = [], // NEW
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const storeUserType = useAuthStore((s) => s?.userType ?? null);
  const isAdminMode = (storeUserType ?? getRole()) === "admin";

  const restosSafe = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants]);
  const isEditing = !!menu;

  const [formData, setFormData] = useState({
    restaurantId: "", // NEW (admin required)
    name: "",
    description: "",
    isActive: true,
    isDefault: false,
    startTime: "",
    endTime: "",
    validDays: [],
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const title = useMemo(
    () =>
      isEditing
        ? t("menu.menus.edit", { defaultValue: "Modifier un menu" })
        : t("menu.menus.add", { defaultValue: "Ajouter un menu" }),
    [isEditing, t]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (menu) {
      const days = Array.isArray(menu.validDays) ? menu.validDays : menu.validDays ? [menu.validDays] : [];

      const rid =
        String(
          menu.restaurantId ??
            menu.restaurentId ??
            menu.restaurent ??
            menu.restaurant ??
            menu?.restaurant?._id ??
            menu?.restaurent?._id ??
            ""
        ) || "";

      setFormData({
        restaurantId: rid,
        name: menu.name || "",
        description: menu.description || "",
        isActive: menu.isActive ?? true,
        isDefault: menu.isDefault ?? false,
        startTime: toInputDate(menu.startTime),
        endTime: toInputDate(menu.endTime),
        validDays: days,
        image: menu.image || "",
      });

      setImagePreview(menu.image || null);
    } else {
      const fallbackRestId = restosSafe.length === 1 ? String(idOf(restosSafe[0]) || "") : "";

      setFormData({
        restaurantId: fallbackRestId,
        name: "",
        description: "",
        isActive: true,
        isDefault: false,
        startTime: "",
        endTime: "",
        validDays: [],
        image: "",
      });

      setImagePreview(null);
    }

    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, isOpen]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const cur = new Set(prev.validDays || []);
      if (cur.has(day)) cur.delete(day);
      else cur.add(day);
      return { ...prev, validDays: Array.from(cur) };
    });
    if (errors.validDays) setErrors((prev) => ({ ...prev, validDays: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "invalidType" }));
      return;
    }

    // 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "tooLarge" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setField("image", reader.result);
    };
    reader.readAsDataURL(file);

    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setField("image", "");
  };

  const validate = () => {
    const next = {};

    // Admin: restaurant obligatoire
    if (isAdminMode && !formData.restaurantId) next.restaurantId = "required";

    if (!formData.name.trim()) next.name = "required";
    else if (formData.name.trim().length < 2) next.name = "tooShort";

    if (!formData.startTime) next.startTime = "required";
    if (!formData.endTime) next.endTime = "required";

    if (formData.startTime && formData.endTime) {
      const s = new Date(formData.startTime);
      const e = new Date(formData.endTime);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e < s) {
        next.endTime = "endBeforeStart";
      }
    }

    if (!Array.isArray(formData.validDays) || formData.validDays.length === 0) {
      next.validDays = "required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      restaurantId: formData.restaurantId ? String(formData.restaurantId) : undefined,
      validDays: formData.validDays, // mapping backend géré côté api/menus.js
    };

    const result = await onSubmit?.(payload);
    if (result?.success) onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <form className="meal-form" onSubmit={handleSubmit}>
        <div className="meal-form-grid">
          {/* Colonne gauche */}
          <div className="meal-form-left">
            {/* Restaurant (admin only) */}
            {isAdminMode && (
              <div className={`form-group ${errors.restaurantId ? "error" : ""}`}>
                <label>
                  Restaurant <span className="required">*</span>
                </label>
                <select
                  name="restaurantId"
                  value={formData.restaurantId || ""}
                  onChange={handleChange}
                  className="custom-select"
                  disabled={isLoading}
                >
                  <option value="">Sélectionner un restaurant</option>
                  {restosSafe.map((r, idx) => {
                    const id = idOf(r);
                    const key = id != null ? String(id) : `resto-${idx}`;
                    const label = r.name ?? r.nom ?? r.title ?? key;
                    return (
                      <option key={key} value={id != null ? String(id) : ""}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                {errors.restaurantId && (
                  <span className="form-error">{t("menu.errors.required", { defaultValue: "Obligatoire" })}</span>
                )}
              </div>
            )}

            {/* Nom */}
            <div className={`form-group ${errors.name ? "error" : ""}`}>
              <label>
                {t("menu.menus.name", { defaultValue: "Nom" })} <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("menu.menus.namePlaceholder", { defaultValue: "Ex: Dîner" })}
                autoFocus
                disabled={isLoading}
              />
              {errors.name && (
                <span className="form-error">{t(`menu.errors.${errors.name}`, { defaultValue: "Champ invalide" })}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label>{t("menu.menus.description", { defaultValue: "Description" })}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t("menu.menus.descriptionPlaceholder", { defaultValue: "Optionnel" })}
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Période */}
            <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={`form-group ${errors.startTime ? "error" : ""}`} style={{ margin: 0 }}>
                <label>
                  {t("menu.menus.startTime", { defaultValue: "Début" })} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.startTime && (
                  <span className="form-error">{t("menu.errors.required", { defaultValue: "Obligatoire" })}</span>
                )}
              </div>

              <div className={`form-group ${errors.endTime ? "error" : ""}`} style={{ margin: 0 }}>
                <label>
                  {t("menu.menus.endTime", { defaultValue: "Fin" })} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.endTime && (
                  <span className="form-error">
                    {errors.endTime === "endBeforeStart"
                      ? t("menu.menus.endBeforeStart", { defaultValue: "La fin doit être après le début" })
                      : t("menu.errors.required", { defaultValue: "Obligatoire" })}
                  </span>
                )}
              </div>
            </div>

            {/* Statuts */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span>{t("menu.menus.isActive", { defaultValue: "Actif" })}</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span>{t("menu.menus.isDefault", { defaultValue: "Menu par défaut" })}</span>
              </label>
            </div>

            {/* Jours */}
            <div className={`form-group ${errors.validDays ? "error" : ""}`}>
              <label>
                {t("menu.menus.validDays", { defaultValue: "Jours valides" })} <span className="required">*</span>
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                {DAYS.map((d) => {
                  const checked = (formData.validDays || []).includes(d);
                  return (
                    <label key={d} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleDay(d)} disabled={isLoading} />
                      <span style={{ textTransform: "capitalize" }}>{d}</span>
                    </label>
                  );
                })}
              </div>

              {errors.validDays && (
                <span className="form-error">{t("menu.errors.required", { defaultValue: "Obligatoire" })}</span>
              )}
            </div>
          </div>

          {/* Colonne droite - Image */}
          <div className="meal-form-right">
            <div className={`form-group ${errors.image ? "error" : ""}`}>
              <label>{t("menu.menus.image", { defaultValue: "Image" })}</label>

              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <RiCloseLine />
                    </button>
                  </div>
                ) : (
                  <label className="image-upload-area">
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden disabled={isLoading} />
                    <RiImageAddLine className="upload-icon" />
                    <span>{t("menu.menus.imageUpload", { defaultValue: "Ajouter une image" })}</span>
                    <span className="upload-hint">PNG, JPG (max 5MB)</span>
                  </label>
                )}
              </div>

              {errors.image && (
                <span className="form-error">
                  {errors.image === "tooLarge"
                    ? t("menu.errors.tooLarge", { defaultValue: "Fichier trop grand" })
                    : t("menu.errors.invalidType", { defaultValue: "Type invalide" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
            {t("common.cancel", { defaultValue: "Annuler" })}
          </button>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? <span className="btn-spinner"></span> : t("common.save", { defaultValue: "Enregistrer" })}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MenuForm;