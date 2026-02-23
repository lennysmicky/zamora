// src/pages/Restaurant/Menu/RestaurantMenuPage.jsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiRefreshLine, RiLoader4Line } from "react-icons/ri";
import { useMenusData } from "../../../hooks/UseMenusdata";

import CategoryList from "../../../components/menus/CategoryList";
import CategoryForm from "../../../components/menus/CategoryForm";
import MealList from "../../../components/menus/MealList";
import MealForm from "../../../components/menus/MealForm";

import "../../Menus/MenusPage.css";

const RestaurantMenuPage = () => {
  const { t } = useTranslation();

  const {
    categories,
    meals,
    selectedCategory,
    isLoading,
    error,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealAvailability,
    refreshCategories,
    refreshMeals,
  } = useMenusData();

  // ✅ Toujours des arrays pour éviter crash UI si undefined
  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const safeMeals = useMemo(() => (Array.isArray(meals) ? meals : []), [meals]);

  // modals
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [showMealForm, setShowMealForm] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // ========================================
  // Refresh (non bloquant)
  // ========================================
  const handleRefresh = async () => {
    if (refreshing || isLoading) return;

    setRefreshing(true);
    try {
      await refreshCategories?.();
      if (selectedCategory?.id) {
        await refreshMeals?.();
      }
    } catch (err) {
      // ✅ on ne bloque pas l’UI
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
      const result = categoryToEdit
        ? await updateCategory?.(categoryToEdit.id, data)
        : await addCategory?.(data);

      const ok = Boolean(result?.success);
      if (ok) {
        setShowCategoryForm(false);
        setCategoryToEdit(null);
      }
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
      const result = mealToEdit
        ? await updateMeal?.(mealToEdit.id, data)
        : await addMeal?.(data);

      const ok = Boolean(result?.success);
      if (ok) {
        setShowMealForm(false);
        setMealToEdit(null);
      }
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

  return (
    <div className="menus-page">
      {/* ✅ Message non bloquant si API KO */}
      {!!error && (
        <div className="menus-warning" style={{ marginBottom: 12 }}>
          {/* pas de bouton retry, UI reste visible */}
          <p style={{ margin: 0 }}>
            {t("common.error")}: {String(error)} {/* ex: 500/505 */}
          </p>
        </div>
      )}

      <div className="menus-page-header">
        <h1 className="menus-page-title">{t("menu.title")}</h1>
        <button
          className={`menus-refresh-btn ${refreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          title={t("common.refresh")}
        >
          {refreshing ? <RiLoader4Line className="spin" /> : <RiRefreshLine />}
        </button>
      </div>

      <div className="menus-grid">
        <div className="menus-column categories-column">
          <CategoryList
            categories={safeCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            isLoading={isLoading && !refreshing}
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
            isLoading={isLoading && !refreshing}
          />
        </div>
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
        categories={safeCategories}
        selectedCategoryId={selectedCategory?.id}
        isLoading={isMealLoading}
      />
    </div>
  );
};

export default RestaurantMenuPage;