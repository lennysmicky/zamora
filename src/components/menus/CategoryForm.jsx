import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../common/Modal";
import useAuthStore from "../../stores/authStore";
import "./CategoryForm.css";

const ALL_REST = "__ALL__";
const idOf = (x) => x?.id ?? x?._id ?? null;

const readLocal = (...keys) => {
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v != null && v !== "") return v;
    }
  } catch {}
  return null;
};

const buildInitial = (category, restaurants = [], isAdminMode = false) => {
  const rid =
    String(
      category?.restaurantId ??
        category?.restaurentId ??
        category?.restaurent ??
        category?.restaurant ??
        category?.restaurant?._id ??
        category?.restaurent?._id ??
        ""
    ) || "";

  const fallbackRestId =
    !rid && isAdminMode && Array.isArray(restaurants) && restaurants.length === 1
      ? String(idOf(restaurants[0]) || "")
      : "";

  return {
    restaurantId: rid || fallbackRestId,
    name: category?.name || category?.nom || "",
    description: category?.description || "",
    order: String(category?.order ?? 1),
    isActive: category?.isActive ?? true,
  };
};

export default function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  restaurants = [],
  isLoading = false,
}) {
  const { t } = useTranslation();

  const userTypeStore = useAuthStore((s) => s?.userType ?? null);
  const roleLS = readLocal("user_role", "role", "userType");
  const isAdminMode = (userTypeStore ?? roleLS) === "admin";

  const categoryId = useMemo(() => idOf(category), [category]);
  const restosSafe = useMemo(() => (Array.isArray(restaurants) ? restaurants : []), [restaurants]);

  const [formData, setFormData] = useState(() => buildInitial(category, restosSafe, isAdminMode));
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFormData(buildInitial(category, restosSafe, isAdminMode));
    setErrors({});
    setSearch("");
  }, [isOpen, categoryId, isAdminMode, restosSafe]);

  const filteredRestos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restosSafe;
    return restosSafe.filter((r) => {
      const label = String(r?.name ?? r?.nom ?? r?.title ?? "").toLowerCase();
      return label.includes(q);
    });
  }, [restosSafe, search]);

  const setField = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const validate = () => {
    const next = {};

    if (isAdminMode && !formData.restaurantId) next.restaurantId = "required";

    const name = formData.name.trim();
    if (!name) next.name = "required";
    else if (name.length < 2) next.name = "tooShort";

    const orderNum = Number(formData.order);
    if (formData.order !== "" && (Number.isNaN(orderNum) || orderNum < 1)) next.order = "invalid";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      restaurantId: formData.restaurantId ? String(formData.restaurantId) : undefined, // ✅ __ALL__ passe tel quel au hook
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      order: parseInt(formData.order, 10) || 1,
      isActive: !!formData.isActive,
    };

    const res = await onSubmit?.(payload);
    if (res?.success) onClose?.();
  };

  const title = category ? t("menu.categories.edit") : t("menu.categories.add");
  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="small">
      <form className="category-form" onSubmit={handleSubmit}>
        {isAdminMode && (
          <>
            <div className={`form-group ${errors.restaurantId ? "error" : ""}`}>
              <label htmlFor="category-restaurant">
                Restaurant <span className="required">*</span>
              </label>

              {/* ✅ filtre */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un restaurant..."
                disabled={isLoading}
                style={{ marginBottom: 8 }}
              />

              <select
                id="category-restaurant"
                name="restaurantId"
                value={formData.restaurantId || ""}
                onChange={handleChange}
                className="custom-select"
                disabled={isLoading}
              >
                <option value="">Sélectionner…</option>
                <option value={ALL_REST}>Tous les restaurants</option>

                {filteredRestos.map((r, idx) => {
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
          </>
        )}

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
            <input type="checkbox" name="isActive" checked={!!formData.isActive} onChange={handleChange} disabled={isLoading} />
            <span className="checkmark" />
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
}