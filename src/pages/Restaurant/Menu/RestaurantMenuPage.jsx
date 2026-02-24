import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiRefreshLine,
  RiLoader4Line,
  RiRestaurantLine,
  RiFileList2Line,
} from "react-icons/ri";

import { useMenusData } from "../../../hooks/UseMenusDatas";

import CategoryList from "../../../components/menus/CategoryList";
import CategoryForm from "../../../components/menus/CategoryForm";
import MealList from "../../../components/menus/MealList";
import MealForm from "../../../components/menus/MealForm";

import MenuList from "../../../components/menus/MenuList";
import MenuForm from "../../../components/menus/MenuForm";

import "../../Menus/MenusPage.css";
import "./RestaurantMenuPage.css";

const TAB_MEALS = "meals";
const TAB_MENUS = "menus";

const RestaurantMenuPage = () => {
  const { t } = useTranslation();

  const {
    // categories / meals
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

    // menus
    menus,
    addMenu,
    updateMenu,
    deleteMenu,
    refreshMenus,
  } = useMenusData();

  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const safeMeals = useMemo(() => (Array.isArray(meals) ? meals : []), [meals]);
  const safeMenus = useMemo(() => (Array.isArray(menus) ? menus : []), [menus]);

  // tabs
  const [activeTab, setActiveTab] = useState(TAB_MEALS);

  // modals category
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // modals meal
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  // modals menu
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // quand on change d’onglet, on ferme les modals ouverts (évite états bizarres)
  useEffect(() => {
    setShowCategoryForm(false);
    setCategoryToEdit(null);
    setShowMealForm(false);
    setMealToEdit(null);
    setShowMenuForm(false);
    setMenuToEdit(null);
  }, [activeTab]);

  // ========================================
  // Refresh (non bloquant)
  // ========================================
  const handleRefresh = async () => {
    if (refreshing || isLoading) return;

    setRefreshing(true);
    try {
      if (activeTab === TAB_MEALS) {
        await refreshCategories?.();
        if (selectedCategory?.id) await refreshMeals?.();
      } else {
        await refreshMenus?.();
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
      const result = categoryToEdit
        ? await updateCategory?.(categoryToEdit.id, data)
        : await addCategory?.(data);

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
      const result = mealToEdit
        ? await updateMeal?.(mealToEdit.id, data)
        : await addMeal?.(data);

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
  // Menus
  // ========================================
  const handleAddMenu = () => {
    setMenuToEdit(null);
    setShowMenuForm(true);
  };

  const handleEditMenu = (menu) => {
    setMenuToEdit(menu || null);
    setShowMenuForm(true);
  };

  const handleCloseMenuForm = () => {
    setShowMenuForm(false);
    setMenuToEdit(null);
  };

  const handleMenuSubmit = async (data) => {
    setIsMenuLoading(true);
    try {
      const id = menuToEdit?.id ?? menuToEdit?._id;
      const result = id ? await updateMenu?.(id, data) : await addMenu?.(data);

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
      return await deleteMenu?.(menuId);
    } catch (e) {
      console.error("Delete menu error:", e);
      return { success: false, error: e?.message || "Delete menu failed" };
    }
  };

  return (
    <div className="menus-page restaurant-menu-page">
      {!!error && (
        <div className="menus-warning" style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}>
            {t("common.error")}: {String(error)}
          </p>
        </div>
      )}

      {/* HEADER: Tabs + Refresh */}
      <div className="menus-page-header restaurant-tabs-header">
        <div className="rm-tabs" role="tablist" aria-label="Menus tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_MEALS}
            className={`rm-tab ${activeTab === TAB_MEALS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_MEALS)}
          >
            <RiRestaurantLine className="rm-tab-icon" />
            <span>{t("menu.tabs.meals", { defaultValue: "Meals" })}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_MENUS}
            className={`rm-tab ${activeTab === TAB_MENUS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_MENUS)}
          >
            <RiFileList2Line className="rm-tab-icon" />
            <span>{t("menu.tabs.menus", { defaultValue: "Menus" })}</span>
          </button>
        </div>

        <button
          className={`menus-refresh-btn ${refreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          title={t("common.refresh")}
        >
          {refreshing ? <RiLoader4Line className="spin" /> : <RiRefreshLine />}
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === TAB_MEALS ? (
        <>
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
            menus={safeMenus}
            selectedCategoryId={selectedCategory?.id}
            isLoading={isMealLoading}
          />
        </>
      ) : (
        <>
          <div style={{ marginTop: 4 }}>
            <MenuList
              menus={safeMenus}
              onAddMenu={handleAddMenu}
              onEditMenu={handleEditMenu}
              onDeleteMenu={handleDeleteMenu}
              isLoading={isLoading && !refreshing}
            />
          </div>

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

export default RestaurantMenuPage;