// src/components/menus/MealList.jsx
import { useState } from "react";
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
import { getImageUrl } from "../../api/client";
import "./MealList.css";

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

  const handleDeleteClick = (meal) => {
    setMealToDelete(meal);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!mealToDelete) return;

    setIsDeleting(true);
    try {
      const res = await onDeleteMeal(mealToDelete.id);
      if (res?.success) {
        setShowConfirmDelete(false);
        setMealToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (meal) => {
    setTogglingId(meal.id);
    try {
      await onToggleAvailability(meal.id);
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

  const canAddMeal = !!selectedCategory && !isLoading;

  return (
    <div className="meal-list">
      {/* Header (toujours visible) */}
      <div className="meal-list-header">
        <div className="meal-list-title">
          <h3>{t("menu.meals.title")}</h3>
          {selectedCategory?.name ? (
            <span className="meal-category-badge">{selectedCategory.name}</span>
          ) : null}
        </div>

        {/*  Bouton toujours visible */}
        <button
          className="meal-add-btn"
          onClick={onAddMeal}
          disabled={!canAddMeal}
          title={
            canAddMeal ? t("menu.meals.add") : t("menu.meals.selectCategory")
          }
        >
          <RiAddLine />
          <span>{t("menu.meals.add")}</span>
        </button>
      </div>

      {/* Content */}
      <div className="meal-list-content">
        {/* Aucune catégorie sélectionnée */}
        {!selectedCategory ? (
          <div className="meal-list-empty select-category">
            <RiRestaurantLine className="empty-icon" />
            <p>{t("menu.meals.selectCategory")}</p>
            <span>{t("menu.meals.selectCategoryDesc")}</span>
          </div>
        ) : isLoading ? (
          /* Loading skeleton */
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
                      <div
                        className="skeleton-text"
                        style={{ width: "150px" }}
                      ></div>
                      <div
                        className="skeleton-text small"
                        style={{ width: "200px" }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton-text"
                        style={{ width: "60px" }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton-text"
                        style={{ width: "80px" }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton-text"
                        style={{ width: "100px" }}
                      ></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : meals.length === 0 ? (
          /* Empty */
          <div className="meal-list-empty">
            <RiRestaurantLine className="empty-icon" />
            <p>{t("menu.meals.empty")}</p>
            <span>{t("menu.meals.emptyDesc")}</span>
          </div>
        ) : (
          /* Table */
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
                {meals.map((meal) => {
                  const img = meal.image ? getImageUrl(meal.image) : null;

                  return (
                    <tr
                      key={meal.id}
                      className={!meal.isAvailable ? "unavailable" : ""}
                    >
                      <td className="meal-info-cell">
                        <div className="meal-info">
                          {img && (
                            <img
                              src={img}
                              alt={meal.name}
                              className="meal-image"
                            />
                          )}
                          <div className="meal-details">
                            <span className="meal-name">{meal.name}</span>
                            {meal.description && (
                              <span className="meal-description">
                                {meal.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="meal-price-cell">
                        <span className="meal-price">
                          {formatPrice(meal.price)} {t("menu.meals.currency")}
                        </span>
                      </td>

                      <td className="meal-availability-cell">
                        <button
                          className={`availability-toggle ${
                            meal.isAvailable ? "available" : "unavailable"
                          }`}
                          onClick={() => handleToggleAvailability(meal)}
                          disabled={togglingId === meal.id}
                          title={t("menu.actions.toggleAvailability")}
                        >
                          {togglingId === meal.id ? (
                            <span className="toggle-spinner"></span>
                          ) : meal.isAvailable ? (
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
                            onClick={() => onEditMeal(meal)}
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