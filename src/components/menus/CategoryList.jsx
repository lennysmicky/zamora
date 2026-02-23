// src/components/menus/CategoryList.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiFolderLine } from "react-icons/ri";
import ConfirmDialog from "../common/ConfirmDialog";
import "./CategoryList.css";

const CategoryList = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading,
}) => {
  const { t } = useTranslation();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e, category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    const res = await onDeleteCategory(categoryToDelete.id);
    setIsDeleting(false);

    if (res?.success) {
      setShowConfirmDelete(false);
      setCategoryToDelete(null);
    }
  };

  const handleEditClick = (e, category) => {
    e.stopPropagation();
    onEditCategory(category);
  };

  if (isLoading) {
    return (
      <div className="category-list">
        <div className="category-list-header">
          <h3>{t("menu.categories.title")}</h3>
        </div>
        <div className="category-list-content">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="category-item skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-text">
                <div className="skeleton-title"></div>
                <div className="skeleton-subtitle"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="category-list">
      <div className="category-list-header">
        <h3>{t("menu.categories.title")}</h3>
        <button className="category-add-btn" onClick={onAddCategory} title={t("menu.categories.add")}>
          <RiAddLine />
        </button>
      </div>

      <div className="category-list-content">
        {categories.length === 0 ? (
          <div className="category-list-empty">
            <RiFolderLine className="empty-icon" />
            <p>{t("menu.categories.empty")}</p>
            <span>{t("menu.categories.emptyDesc")}</span>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`category-item ${selectedCategory?.id === category.id ? "active" : ""} ${
                !category.isActive ? "inactive" : ""
              }`}
              onClick={() => onSelectCategory(category)}
            >
              <div className="category-item-info">
                <div className="category-item-name">
                  {category.name}
                  {!category.isActive && (
                    <span className="category-status-badge inactive">{t("menu.categories.inactive")}</span>
                  )}
                </div>
                {category.description && <div className="category-item-description">{category.description}</div>}
              </div>

              <div className="category-item-actions">
                <button
                  className="category-action-btn edit"
                  onClick={(e) => handleEditClick(e, category)}
                  title={t("menu.actions.edit")}
                >
                  <RiEditLine />
                </button>
                <button
                  className="category-action-btn delete"
                  onClick={(e) => handleDeleteClick(e, category)}
                  title={t("menu.actions.delete")}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title={t("menu.categories.confirmDelete")}
        message={t("menu.categories.confirmDeleteMessage")}
        type="danger"
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryList;