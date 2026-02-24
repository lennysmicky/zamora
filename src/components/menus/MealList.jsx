// src/components/menus/MealList.jsx
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiRestaurantLine,
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";
import ConfirmDialog from "../common/ConfirmDialog";
import resolveImageSrc from "../../utils/resolveImageSrc";
import "./MealList.css";

const idOf = (x) => x?.id ?? x?._id ?? null;

const MealList = ({
  meals = [],
  selectedCategory,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onToggleAvailability,
  isLoading,
}) => {
  const { t } = useTranslation();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const selectedCategoryId = useMemo(() => idOf(selectedCategory), [selectedCategory]);

  // ✅ CORRIGÉ: on autorise le clic même sans catégorie sélectionnée
  const canAddMeal = !!selectedCategoryId;

  const handleDeleteClick = (meal) => {
    setMealToDelete(meal);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const mid = idOf(mealToDelete);
    if (!mid) return;

    setIsDeleting(true);
    try {
      const res = await onDeleteMeal?.(String(mid));
      if (res?.success) {
        setShowConfirmDelete(false);
        setMealToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (meal) => {
    const mid = idOf(meal);
    if (!mid) return;

    setTogglingId(String(mid));
    try {
      await onToggleAvailability?.(String(mid));
    } finally {
      setTogglingId(null);
    }
  };

  const formatPrice = (price) => {
    const n = Number(price);
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("fr-MA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  //  NOUVEAU: Handler pour le bouton
  const handleAddClick = () => {
    if (canAddMeal) {
      onAddMeal?.();
    } else {
      alert(t("menu.meals.selectCategory"));
    }
  };

  return (
    <div className="meal-list">
      <div className="meal-list-header">
        <div className="meal-list-title">
          <h3>{t("menu.meals.title")}</h3>
          {selectedCategory?.name ? (
            <span className="meal-category-badge">{selectedCategory.name}</span>
          ) : null}
        </div>

        {/* ✅ CORRIGÉ: Bouton toujours cliquable */}
        <button
          type="button"
          className="meal-add-btn"
          onClick={handleAddClick}
          disabled={!canAddMeal}
          title={canAddMeal ? t("menu.meals.add") : t("menu.meals.selectCategory")}
        >
          <RiAddLine />
          <span>{t("menu.meals.add")}</span>
        </button>
      </div>

      <div className="meal-list-content">
        {!selectedCategoryId ? (
          <div className="meal-list-empty select-category">
            <RiRestaurantLine className="empty-icon" />
            <p>{t("menu.meals.selectCategory")}</p>
            <span>{t("menu.meals.selectCategoryDesc")}</span>
          </div>
        ) : isLoading ? (
          <div className="meal-table-container">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>{t("menu.meals.name")}</th>
                  <th>{t("menu.meals.price")}</th>
                  <th>{t("menu.meals.availability")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td>
                      <div className="skeleton-text" style={{ width: "150px" }} />
                      <div className="skeleton-text small" style={{ width: "200px" }} />
                    </td>
                    <td>
                      <div className="skeleton-text" style={{ width: "60px" }} />
                    </td>
                    <td>
                      <div className="skeleton-text" style={{ width: "80px" }} />
                    </td>
                    <td>
                      <div className="skeleton-text" style={{ width: "100px" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : meals.length === 0 ? (
          <div className="meal-list-empty">
            <RiRestaurantLine className="empty-icon" />
            <p>{t("menu.meals.empty")}</p>
            <span>{t("menu.meals.emptyDesc")}</span>
          </div>
        ) : (
          <div className="meal-table-container">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>{t("menu.meals.name")}</th>
                  <th>{t("menu.meals.price")}</th>
                  <th>{t("menu.meals.availability")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal, idx) => {
                  const mid = idOf(meal);
                  const key = mid != null ? String(mid) : `meal-${idx}`;
                  const img = resolveImageSrc(meal?.image);
                  const isAvailable = meal?.isAvailable ?? meal?.isAvaible ?? true;
                  const isToggling = togglingId != null && String(togglingId) === String(mid);

                  return (
                    <tr key={key} className={!isAvailable ? "unavailable" : ""}>
                      <td className="meal-info-cell">
                        <div className="meal-info">
                          {img ? (
                            <img
                              src={img}
                              alt={meal?.name ?? meal?.nom ?? ""}
                              className="meal-image"
                              loading="lazy"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : null}
                          <div className="meal-details">
                            <span className="meal-name">{meal?.name ?? meal?.nom ?? ""}</span>
                            {meal?.description ? (
                              <span className="meal-description">{meal.description}</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="meal-price-cell">
                        <span className="meal-price">
                          {formatPrice(meal?.price)} {t("menu.meals.currency")}
                        </span>
                      </td>

                      <td className="meal-availability-cell">
                        <button
                          className={`availability-toggle ${isAvailable ? "available" : "unavailable"}`}
                          onClick={() => handleToggleAvailability(meal)}
                          disabled={isToggling || mid == null}
                          title={t("menu.actions.toggleAvailability")}
                        >
                          {isToggling ? (
                            <span className="toggle-spinner" />
                          ) : isAvailable ? (
                            <>
                              <RiToggleFill />
                              <span>{t("menu.meals.available")}</span>
                            </>
                          ) : (
                            <>
                              <RiToggleLine />
                              <span>{t("menu.meals.unavailable")}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="meal-actions-cell">
                        <div className="meal-actions">
                          <button
                            className="meal-action-btn edit"
                            onClick={() => onEditMeal?.(meal)}
                            title={t("menu.actions.edit")}
                          >
                            <RiEditLine />
                          </button>
                          <button
                            className="meal-action-btn delete"
                            onClick={() => handleDeleteClick(meal)}
                            title={t("menu.actions.delete")}
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title={t("menu.meals.confirmDelete")}
        message={t("menu.meals.confirmDeleteMessage")}
        type="danger"
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MealList;