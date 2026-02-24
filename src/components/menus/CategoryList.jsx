// src/components/menus/CategoryList.jsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiFolderLine } from "react-icons/ri";
import ConfirmDialog from "../common/ConfirmDialog";
import "./CategoryList.css";

const idOf = (x) => x?.id ?? x?._id ?? null;
const eqId = (a, b) => String(a ?? "") === String(b ?? "");

const CategoryList = ({
  categories = [],
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

  const selectedId = useMemo(() => idOf(selectedCategory), [selectedCategory]);

  const handleDeleteClick = (e, category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const cid = idOf(categoryToDelete);
    if (!cid) return;

    setIsDeleting(true);
    try {
      const res = await onDeleteCategory?.(String(cid));
      if (res?.success) {
        setShowConfirmDelete(false);
        setCategoryToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e, category) => {
    e.stopPropagation();
    onEditCategory?.(category);
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
              <div className="skeleton-icon" />
              <div className="skeleton-text">
                <div className="skeleton-title" />
                <div className="skeleton-subtitle" />
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
        <button
          type="button"
          className="category-add-btn"
          onClick={onAddCategory}
          title={t("menu.categories.add")}
        >
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
          categories.map((category, idx) => {
            const cid = idOf(category);
            const key = cid != null ? String(cid) : `cat-${idx}`;
            const isActive = eqId(selectedId, cid);
            const isActiveFlag = category?.isActive ?? true;

            return (
              <div
                key={key}
                className={`category-item ${isActive ? "active" : ""} ${!isActiveFlag ? "inactive" : ""}`}
                onClick={() => onSelectCategory?.(category)}
              >
                <div className="category-item-info">
                  <div className="category-item-name">
                    {category?.name ?? category?.nom ?? ""}
                    {!isActiveFlag && (
                      <span className="category-status-badge inactive">
                        {t("menu.categories.inactive")}
                      </span>
                    )}
                  </div>

                  {category?.description ? (
                    <div className="category-item-description">{category.description}</div>
                  ) : null}
                </div>

                <div className="category-item-actions">
                  <button
                    type="button"
                    className="category-action-btn edit"
                    onClick={(e) => handleEditClick(e, category)}
                    title={t("menu.actions.edit")}
                  >
                    <RiEditLine />
                  </button>
                  <button
                    type="button"
                    className="category-action-btn delete"
                    onClick={(e) => handleDeleteClick(e, category)}
                    title={t("menu.actions.delete")}
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            );
          })
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