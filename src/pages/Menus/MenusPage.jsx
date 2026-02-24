// src/pages/Menus/MenusPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiRefreshLine,
  RiLoader4Line,
  RiRestaurantLine,
  RiFileList2Line,
} from "react-icons/ri";
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
import "./AdminMenusPage.css";

const TAB_MEALS = "meals";
const TAB_MENUS = "menus";

const idOf = (x) => x?.id ?? x?._id ?? null;

const MenusPage = () => {
  const { t } = useTranslation();

  const {
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

    menus = [],
    restaurants = [], // ⬅️ AJOUTÉ
    addMenu,
    updateMenu,
    deleteMenu,

    isLoading,
    isRefreshing,

    refreshCategories,
    refreshMeals,
    refreshMenus,
  } = useMenusData();

  const [activeTab, setActiveTab] = useState(TAB_MEALS);

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

  const selectedCategoryId = useMemo(() => idOf(selectedCategory), [selectedCategory]);

  const isInitialEmptyLoading =
    isLoading && categories.length === 0 && meals.length === 0 && menus.length === 0;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing || isLoading) return;

    setRefreshing(true);
    try {
      if (activeTab === TAB_MEALS) {
        await refreshCategories?.();
        if (selectedCategoryId) await refreshMeals?.();
      } else {
        await refreshMenus?.();
      }
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setShowCategoryForm(false);
    setCategoryToEdit(null);

    setShowMealForm(false);
    setMealToEdit(null);

    setShowMenuForm(false);
    setMenuToEdit(null);
  }, [activeTab]);

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

    const cid = idOf(categoryToEdit);
    const result = cid ? await updateCategory?.(String(cid), data) : await addCategory?.(data);

    setIsCategoryLoading(false);

    if (result?.success) {
      setShowCategoryForm(false);
      setCategoryToEdit(null);
    }

    return result;
  };

  const handleDeleteCategory = async (categoryId) => {
    return await deleteCategory?.(String(categoryId));
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
    console.log("CLICK ADD MEAL", { selectedCategory, showMealForm });
  };

  const handleEditMeal = (meal) => {
    setMealToEdit(meal);
    setShowMealForm(true);
  };

  const handleMealSubmit = async (data) => {
    setIsMealLoading(true);

    const mid = idOf(mealToEdit);
    const result = mid ? await updateMeal?.(String(mid), data) : await addMeal?.(data);

    setIsMealLoading(false);

    if (result?.success) {
      setShowMealForm(false);
      setMealToEdit(null);
    }

    return result;
  };

  const handleDeleteMeal = async (mealId) => {
    return await deleteMeal?.(String(mealId));
  };

  const handleToggleMealAvailability = async (mealId) => {
    return await toggleMealAvailability?.(String(mealId));
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

    const id = idOf(menuToEdit);
    const result = id ? await updateMenu?.(String(id), data) : await addMenu?.(data);

    setIsMenuLoading(false);

    if (result?.success) {
      setShowMenuForm(false);
      setMenuToEdit(null);
    }

    return result;
  };

  const handleDeleteMenu = async (menuId) => {
    return await deleteMenu?.(String(menuId));
  };

  const handleCloseMenuForm = () => {
    setShowMenuForm(false);
    setMenuToEdit(null);
  };

  return (
    <div className="menus-page admin-menus-page">
      <div className="menus-page-header admin-tabs-header" style={{ marginBottom: 12 }}>
        <div className="am-tabs" role="tablist" aria-label="Menus tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_MEALS}
            className={`am-tab ${activeTab === TAB_MEALS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_MEALS)}
          >
            <RiRestaurantLine className="am-tab-icon" />
            <span>{t("menu.tabs.meals", { defaultValue: "Meals" })}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_MENUS}
            className={`am-tab ${activeTab === TAB_MENUS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_MENUS)}
          >
            <RiFileList2Line className="am-tab-icon" />
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

      {!!isRefreshing && !isInitialEmptyLoading && (
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          {t("common.loading")}…
        </div>
      )}

      {isInitialEmptyLoading ? (
        <div style={{ padding: 24 }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {activeTab === TAB_MEALS ? (
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

              <CategoryForm
                isOpen={showCategoryForm}
                onClose={handleCloseCategoryForm}
                onSubmit={handleCategorySubmit}
                category={categoryToEdit}
                restaurants={restaurants} // ⬅️ AJOUTÉ
                isLoading={isCategoryLoading}
              />

              <MealForm
                isOpen={showMealForm}
                onClose={handleCloseMealForm}
                onSubmit={handleMealSubmit}
                meal={mealToEdit}
                categories={categories}
                menus={menus}
                restaurants={restaurants}
                selectedCategoryId={selectedCategoryId} 
                isLoading={isMealLoading}
              />
            </>
          ) : (
            <>
              <div style={{ marginTop: 4 }}>
                <MenuList
                  menus={menus}
                  onAddMenu={handleAddMenu}
                  onEditMenu={handleEditMenu}
                  onDeleteMenu={handleDeleteMenu}
                  isLoading={isLoading && menus.length === 0}
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
        </>
      )}
    </div>
  );
};

export default MenusPage;