// src/components/menus/MealForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine, RiImageAddLine } from "react-icons/ri";
import Modal from "../common/Modal";
import useAuthStore from "../../stores/authStore";
import "./MealForm.css";

const idOf = (x) => x?.id ?? x?._id ?? null;

const getRole = () => {
  try {
    return localStorage.getItem("user_role");
  } catch {
    return null;
  }
};

const MealForm = ({
  isOpen,
  onClose,
  onSubmit,
  meal = null,
  categories = [],
  menus = [],
  restaurants = [], // NEW
  selectedCategoryId = null,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const isEditing = !!meal;

  const storeUserType = useAuthStore((s) => s?.userType ?? null);
  const isAdminMode = (storeUserType ?? getRole()) === "admin";

  const cats = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const menusSafe = useMemo(() => (Array.isArray(menus) ? menus : []), [menus]);
  const restosSafe = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants]);
  const mealId = useMemo(() => idOf(meal), [meal]);

  const [formData, setFormData] = useState({
    restaurantId: "", // NEW (admin required)
    name: "",
    description: "",
    menuId: "",
    categoryId: "",
    price: "",
    isAvailable: true,
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (meal) {
      const rid =
        String(
          meal.restaurantId ??
            meal.restaurentId ??
            meal.restaurent ??
            meal.restaurant ??
            meal?.restaurant?._id ??
            meal?.restaurent?._id ??
            ""
        ) || "";

      const mid =
        String(
          meal.menuId ??
            meal.menu ??
            idOf(meal.menu) ??
            meal?.menu?._id ??
            ""
        ) || "";

      const cid =
        String(
          meal.categoryId ??
            meal.categorieId ??
            idOf(meal.categorie) ??
            selectedCategoryId ??
            ""
        ) || "";

      setFormData({
        restaurantId: rid,
        name: meal.name || meal.nom || "",
        description: meal.description || "",
        menuId: mid,
        categoryId: cid,
        price: meal.price != null ? String(meal.price) : "",
        isAvailable: meal.isAvailable ?? meal.isAvaible ?? true,
        image: meal.image || "",
      });

      setImagePreview(meal.image || null);
    } else {
      const fallbackCid = String(selectedCategoryId || idOf(cats[0]) || "");
      const fallbackMenuId = menusSafe.length === 1 ? String(idOf(menusSafe[0]) || "") : "";
      const fallbackRestId = restosSafe.length === 1 ? String(idOf(restosSafe[0]) || "") : "";

      setFormData({
        restaurantId: fallbackRestId,
        name: "",
        description: "",
        menuId: fallbackMenuId,
        categoryId: fallbackCid,
        price: "",
        isAvailable: true,
        image: "",
      });
      setImagePreview(null);
    }

    setErrors({});
  }, [isOpen, mealId, selectedCategoryId]);

  const setField = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "invalidType" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "tooLarge" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setField("image", reader.result);
    };
    reader.readAsDataURL(file);

    setErrors((p) => ({ ...p, image: null }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setField("image", "");
  };

  const validate = () => {
    const next = {};

    if (isAdminMode && !formData.restaurantId) next.restaurantId = "required";

    if (!formData.name.trim()) next.name = "required";
    else if (formData.name.trim().length < 2) next.name = "tooShort";

    if (!formData.menuId) next.menuId = "required";
    if (!formData.categoryId) next.categoryId = "required";

    if (formData.price === "") next.price = "required";
    else if (Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) next.price = "invalid";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      restaurantId: formData.restaurantId ? String(formData.restaurantId) : undefined,
      menuId: String(formData.menuId),
      categoryId: String(formData.categoryId),
      price: Number(formData.price),
    };

    const result = await onSubmit?.(payload);
    if (result?.success) onClose?.();
  };

  const title = isEditing ? t("menu.meals.edit") : t("menu.meals.add");
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <form className="meal-form" onSubmit={handleSubmit}>
        <div className="meal-form-grid">
          <div className="meal-form-left">
            {/* Restaurant (admin only, required) */}
            {isAdminMode && (
              <div className={`form-group ${errors.restaurantId ? "error" : ""}`}>
                <label htmlFor="meal-restaurant">
                  Restaurant <span className="required">*</span>
                </label>
                <select
                  id="meal-restaurant"
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
                  <span className="form-error">{t(`menu.errors.${errors.restaurantId}`, { defaultValue: "Requis" })}</span>
                )}
              </div>
            )}

            <div className={`form-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="meal-name">
                {t("menu.meals.name")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="meal-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("menu.meals.namePlaceholder")}
                autoFocus
                disabled={isLoading}
              />
              {errors.name && <span className="form-error">{t(`menu.errors.${errors.name}`)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="meal-description">{t("menu.meals.description")}</label>
              <textarea
                id="meal-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t("menu.meals.descriptionPlaceholder")}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className={`form-group ${errors.menuId ? "error" : ""}`}>
              <label htmlFor="meal-menu">
                {t("menu.menus.title", { defaultValue: "Menu" })} <span className="required">*</span>
              </label>
              <select
                id="meal-menu"
                name="menuId"
                value={formData.menuId || ""}
                onChange={handleChange}
                className="custom-select"
                disabled={isLoading}
              >
                <option value="">{t("menu.menus.selectMenu", { defaultValue: "Sélectionner un menu" })}</option>
                {menusSafe.map((m, idx) => {
                  const id = idOf(m);
                  const key = id != null ? String(id) : `menu-${idx}`;
                  const label = m.name ?? m.nom ?? m.title ?? key;
                  return (
                    <option key={key} value={id != null ? String(id) : ""}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {errors.menuId && <span className="form-error">{t(`menu.errors.${errors.menuId}`)}</span>}
            </div>

            <div className={`form-group ${errors.categoryId ? "error" : ""}`}>
              <label htmlFor="meal-category">
                {t("menu.meals.category")} <span className="required">*</span>
              </label>
              <select
                id="meal-category"
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className="custom-select"
                disabled={isLoading}
              >
                <option value="">{t("menu.meals.selectCategory")}</option>
                {cats.map((cat, idx) => {
                  const id = idOf(cat);
                  const key = id != null ? String(id) : `cat-${idx}`;
                  const label = cat.name ?? cat.nom ?? cat.title ?? key;
                  return (
                    <option key={key} value={id != null ? String(id) : ""}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {errors.categoryId && <span className="form-error">{t(`menu.errors.${errors.categoryId}`)}</span>}
            </div>

            <div className={`form-group ${errors.price ? "error" : ""}`}>
              <label htmlFor="meal-price">
                {t("menu.meals.price")} <span className="required">*</span>
              </label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  id="meal-price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t("menu.meals.pricePlaceholder")}
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                <span className="price-currency">{t("menu.meals.currency")}</span>
              </div>
              {errors.price && <span className="form-error">{t(`menu.errors.${errors.price}`)}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={!!formData.isAvailable}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span>{t("menu.meals.available")}</span>
              </label>
            </div>
          </div>

          <div className="meal-form-right">
            <div className={`form-group ${errors.image ? "error" : ""}`}>
              <label>{t("menu.meals.image")}</label>

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
                    <span>{t("menu.meals.imageUpload")}</span>
                    <span className="upload-hint">PNG, JPG (max 5MB)</span>
                  </label>
                )}
              </div>

              {errors.image && <span className="form-error">{t(`menu.errors.${errors.image}`)}</span>}
            </div>
          </div>
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

export default MealForm;