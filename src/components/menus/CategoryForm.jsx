// src/components/menus/CategoryForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../common/Modal";
import "./CategoryForm.css";

const idOf = (x) => x?.id ?? x?._id ?? null;

const buildInitial = (category) => ({
  name: category?.name || category?.nom || "",
  description: category?.description || "",
  order: String(category?.order ?? 1), // string pour input controlled
  isActive: category?.isActive ?? true,
});

const CategoryForm = ({ isOpen, onClose, onSubmit, category = null, isLoading = false }) => {
  const { t } = useTranslation();
  const categoryId = useMemo(() => idOf(category), [category]);

  const [formData, setFormData] = useState(() => buildInitial(category));
  const [errors, setErrors] = useState({});

  // ✅ reset seulement quand on ouvre / change d’item
  useEffect(() => {
    if (!isOpen) return;
    setFormData(buildInitial(category));
    setErrors({});
  }, [isOpen, categoryId, category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    if (!name) newErrors.name = "required";
    else if (name.length < 2) newErrors.name = "tooShort";

    const orderNum = Number(formData.order);
    if (formData.order !== "" && (Number.isNaN(orderNum) || orderNum < 1)) {
      newErrors.order = "invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      order: parseInt(formData.order, 10) || 1,
      isActive: !!formData.isActive,
    };

    const result = await onSubmit?.(payload);
    if (result?.success) onClose?.();
  };

  const title = category ? t("menu.categories.edit") : t("menu.categories.add");

  return (
    <Modal isOpen={!!isOpen} onClose={onClose} title={title} size="small">
      <form className="category-form" onSubmit={handleSubmit}>
        <div className={`form-group ${errors.name ? "error" : ""}`}>
          <label htmlFor="category-name">
            {t("menu.categories.name")} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="category-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("menu.categories.namePlaceholder")}
            autoFocus
            disabled={isLoading}
          />
          {errors.name && <span className="form-error">{t(`menu.errors.${errors.name}`)}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category-description">{t("menu.categories.description")}</label>
          <textarea
            id="category-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t("menu.categories.descriptionPlaceholder")}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className={`form-group ${errors.order ? "error" : ""}`}>
          <label htmlFor="category-order">{t("menu.categories.order")}</label>
          <input
            type="number"
            id="category-order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min={1}
            disabled={isLoading}
          />
          {errors.order && <span className="form-error">{t(`menu.errors.${errors.order}`)}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={!!formData.isActive}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span className="checkmark"></span>
            <span>{t("menu.categories.active")}</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? <span className="btn-spinner" /> : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;