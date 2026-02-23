// src/pages/Restaurant/Menu/RestaurantMenuPage.jsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiRefreshLine, RiLoader4Line } from "react-icons/ri";


import { useMenusData } from "../../../hooks/UseMenusDatas";

import CategoryList from "../../../components/menus/CategoryList";
import CategoryForm from "../../../components/menus/CategoryForm";
import MealList from "../../../components/menus/MealList";
import MealForm from "../../../components/menus/MealForm";

//  AJOUT menus
import MenuList from "../../../components/menus/MenuList";
import MenuForm from "../../../components/menus/MenuForm";

import "../../Menus/MenusPage.css";

const idOf = (x) => x?.id ?? x?._id ?? null;

const RestaurantMenuPage = () => {
  const { t } = useTranslation();

  const {
    // categories / meals
    categories,
    meals,
    selectedCategory,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealAvailability,

    //  menus
    menus,
    addMenu,
    updateMenu: updateMenuFn,
    deleteMenu: deleteMenuFn,

    // ui
    isLoading,
    isRefreshing, // peut être undefined selon ton hook => on gère
    error,

    // refresh
    refreshCategories,
    refreshMeals,
    refreshMenus,
  } = useMenusData();

  //  Toujours des arrays
  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const safeMeals = useMemo(() => (Array.isArray(meals) ? meals : []), [meals]);
  const safeMenus = useMemo(() => (Array.isArray(menus) ? menus : []), [menus]);

  // ----- Modals Category -----
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // ----- Modals Meal -----
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  // ----- Modals Menu -----
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const selectedCategoryId = idOf(selectedCategory);

  // ========================================
  // Refresh (non bloquant)
  // ========================================
  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.allSettled([
        refreshCategories?.(),
        refreshMenus?.(),
      ]);

      if (selectedCategoryId) {
        await refreshMeals?.();
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ========================================
  // Categories
  // ========================================
  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category || null);
    setShowCategoryForm(true);
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setCategoryToEdit(null);
  };

  const handleCategorySubmit = async (data) => {
    setIsCategoryLoading(true);
    try {
      const id = idOf(categoryToEdit);
      const result = id ? await updateCategory?.(id, data) : await addCategory?.(data);

      if (result?.success) handleCloseCategoryForm();
      return result ?? { success: false, error: "No response" };
    } catch (e) {
      console.error("Category submit error:", e);
      return { success: false, error: e?.message || "Category submit failed" };
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      return await deleteCategory?.(categoryId);
    } catch (e) {
      console.error("Delete category error:", e);
      return { success: false, error: e?.message || "Delete category failed" };
    }
  };

  // ========================================
  // Meals
  // ========================================
  const handleAddMeal = () => {
    setMealToEdit(null);
    setShowMealForm(true);
  };

  const handleEditMeal = (meal) => {
    setMealToEdit(meal || null);
    setShowMealForm(true);
  };

  const handleCloseMealForm = () => {
    setShowMealForm(false);
    setMealToEdit(null);
  };

  const handleMealSubmit = async (data) => {
    setIsMealLoading(true);
    try {
      const id = idOf(mealToEdit);
      const result = id ? await updateMeal?.(id, data) : await addMeal?.(data);

      if (result?.success) handleCloseMealForm();
      return result ?? { success: false, error: "No response" };
    } catch (e) {
      console.error("Meal submit error:", e);
      return { success: false, error: e?.message || "Meal submit failed" };
    } finally {
      setIsMealLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      return await deleteMeal?.(mealId);
    } catch (e) {
      console.error("Delete meal error:", e);
      return { success: false, error: e?.message || "Delete meal failed" };
    }
  };

  const handleToggleMealAvailability = async (mealId) => {
    try {
      return await toggleMealAvailability?.(mealId);
    } catch (e) {
      console.error("Toggle availability error:", e);
      return { success: false, error: e?.message || "Toggle failed" };
    }
  };

  // ========================================
  // Menus (liste + create/edit/delete)
  // ========================================
  const handleAddMenu = () => {
    setMenuToEdit(null);
    setShowMenuForm(true);
  };

  const handleEditMenu = (m) => {
    setMenuToEdit(m || null);
    setShowMenuForm(true);
  };

  const handleCloseMenuForm = () => {
    setShowMenuForm(false);
    setMenuToEdit(null);
  };

  const handleMenuSubmit = async (data) => {
    setIsMenuLoading(true);
    try {
      const id = idOf(menuToEdit);
      const result = id ? await updateMenuFn?.(id, data) : await addMenu?.(data);

      if (result?.success) handleCloseMenuForm();
      return result ?? { success: false, error: "No response" };
    } catch (e) {
      console.error("Menu submit error:", e);
      return { success: false, error: e?.message || "Menu submit failed" };
    } finally {
      setIsMenuLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    try {
      return await deleteMenuFn?.(menuId);
    } catch (e) {
      console.error("Delete menu error:", e);
      return { success: false, error: e?.message || "Delete menu failed" };
    }
  };

  const busy = Boolean(isLoading || isRefreshing || refreshing);

  return (
    <div className="menus-page">
      {/*  Erreur NON bloquante */}
      {!!error && (
        <div className="menus-error" style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}>{t("common.error")}: {String(error)}</p>
        </div>
      )}

      <div className="menus-page-header">
        <h1 className="menus-page-title">{t("menu.title")}</h1>
        <button
          className={`menus-refresh-btn ${refreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={refreshing}
          title={t("common.refresh")}
        >
          {refreshing ? <RiLoader4Line className="spin" /> : <RiRefreshLine />}
        </button>
      </div>

      {/*  Grille Catégories / Repas */}
      <div className="menus-grid">
        <div className="menus-column categories-column">
          <CategoryList
            categories={safeCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            isLoading={busy && safeCategories.length === 0}
          />
        </div>

        <div className="menus-column meals-column">
          <MealList
            meals={safeMeals}
            selectedCategory={selectedCategory}
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
            onToggleAvailability={handleToggleMealAvailability}
            isLoading={busy && safeMeals.length === 0}
          />
        </div>
      </div>

      {/*  Section MENUS (comme Admin) */}
      <div style={{ marginTop: 12 }}>
        <MenuList
          menus={safeMenus}
          onAddMenu={handleAddMenu}
          onEditMenu={handleEditMenu}
          onDeleteMenu={handleDeleteMenu}
          isLoading={busy && safeMenus.length === 0}
        />
      </div>

      {/* Modals */}
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
        categories={safeCategories}
        selectedCategoryId={selectedCategoryId}
        isLoading={isMealLoading}
      />

      <MenuForm
        isOpen={showMenuForm}
        onClose={handleCloseMenuForm}
        onSubmit={handleMenuSubmit}
        menu={menuToEdit}
        isLoading={isMenuLoading}
      />
    </div>
  );
};

export default RestaurantMenuPage;