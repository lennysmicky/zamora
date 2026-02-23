// src/pages/Menus/MenusPage.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMenusData } from "../../hooks/UseMenusDatas";

// Components
import CategoryList from "../../components/menus/CategoryList";
import CategoryForm from "../../components/menus/CategoryForm";
import MealList from "../../components/menus/MealList";
import MealForm from "../../components/menus/MealForm";
import MenuList from "../../components/menus/MenuList";
import MenuForm from "../../components/menus/MenuForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import "./MenusPage.css";

const MenusPage = () => {
  const { t } = useTranslation();

  const {
    // categories / meals
    categories = [],
    meals = [],
    selectedCategory,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealAvailability,

    // menus
    menus = [],
    addMenu,
    updateMenu,
    deleteMenu,

    // ui
    isLoading,
    isRefreshing,
    //  error volontairement ignoré pour ne rien afficher
    // error,
  } = useMenusData();

  // ---------- Modals Category ----------
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // ---------- Modals Meal ----------
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  // ---------- Modals Menu ----------
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  // UI: on bloque seulement si 1er chargement et absolument rien
  const isInitialEmptyLoading =
    isLoading && categories.length === 0 && meals.length === 0 && menus.length === 0;

  // ========================================
  // Handlers Categories
  // ========================================
  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (data) => {
    setIsCategoryLoading(true);

    const result = categoryToEdit
      ? await updateCategory?.(categoryToEdit.id, data)
      : await addCategory?.(data);

    setIsCategoryLoading(false);

    if (result?.success) {
      setShowCategoryForm(false);
      setCategoryToEdit(null);
    }

    return result;
  };

  const handleDeleteCategory = async (categoryId) => {
    return await deleteCategory?.(categoryId);
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setCategoryToEdit(null);
  };

  // ========================================
  // Handlers Meals
  // ========================================
  const handleAddMeal = () => {
    setMealToEdit(null);
    setShowMealForm(true);
  };

  const handleEditMeal = (meal) => {
    setMealToEdit(meal);
    setShowMealForm(true);
  };

  const handleMealSubmit = async (data) => {
    setIsMealLoading(true);

    const result = mealToEdit
      ? await updateMeal?.(mealToEdit.id, data)
      : await addMeal?.(data);

    setIsMealLoading(false);

    if (result?.success) {
      setShowMealForm(false);
      setMealToEdit(null);
    }

    return result;
  };

  const handleDeleteMeal = async (mealId) => {
    return await deleteMeal?.(mealId);
  };

  const handleToggleMealAvailability = async (mealId) => {
    return await toggleMealAvailability?.(mealId);
  };

  const handleCloseMealForm = () => {
    setShowMealForm(false);
    setMealToEdit(null);
  };

  // ========================================
  // Handlers Menus
  // ========================================
  const handleAddMenu = () => {
    setMenuToEdit(null);
    setShowMenuForm(true);
  };

  const handleEditMenu = (menu) => {
    setMenuToEdit(menu);
    setShowMenuForm(true);
  };

  const handleMenuSubmit = async (data) => {
    setIsMenuLoading(true);

    const id = menuToEdit?.id ?? menuToEdit?._id;
    const result = id ? await updateMenu?.(id, data) : await addMenu?.(data);

    setIsMenuLoading(false);

    if (result?.success) {
      setShowMenuForm(false);
      setMenuToEdit(null);
    }

    return result;
  };

  const handleDeleteMenu = async (menuId) => {
    return await deleteMenu?.(menuId);
  };

  const handleCloseMenuForm = () => {
    setShowMenuForm(false);
    setMenuToEdit(null);
  };

  return (
    <div className="menus-page">
      {/* Indicateur discret de sync en arrière-plan */}
      {!!isRefreshing && !isInitialEmptyLoading && (
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          {t("common.loading")}…
        </div>
      )}

      {/* Chargement initial (si vraiment vide) */}
      {isInitialEmptyLoading ? (
        <div style={{ padding: 24 }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="menus-grid">
            <div className="menus-column categories-column">
              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                isLoading={isLoading && categories.length === 0}
              />
            </div>

            <div className="menus-column meals-column">
              <MealList
                meals={meals}
                selectedCategory={selectedCategory}
                onAddMeal={handleAddMeal}
                onEditMeal={handleEditMeal}
                onDeleteMeal={handleDeleteMeal}
                onToggleAvailability={handleToggleMealAvailability}
                isLoading={isLoading && meals.length === 0}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <MenuList
              menus={menus}
              onAddMenu={handleAddMenu}
              onEditMenu={handleEditMenu}
              onDeleteMenu={handleDeleteMenu}
              isLoading={isLoading && menus.length === 0}
            />
          </div>

          <CategoryForm
            isOpen={showCategoryForm}
            onClose={handleCloseCategoryForm}
            onSubmit={handleCategorySubmit}
            category={categoryToEdit}
            isLoading={isCategoryLoading}
          />

          <MealForm
            isOpen={showMealForm}
            onClose={handleCloseMealForm}
            onSubmit={handleMealSubmit}
            meal={mealToEdit}
            categories={categories}
            selectedCategoryId={selectedCategory?.id}
            isLoading={isMealLoading}
          />

          <MenuForm
            isOpen={showMenuForm}
            onClose={handleCloseMenuForm}
            onSubmit={handleMenuSubmit}
            menu={menuToEdit}
            isLoading={isMenuLoading}
          />
        </>
      )}
    </div>
  );
};

export default MenusPage;