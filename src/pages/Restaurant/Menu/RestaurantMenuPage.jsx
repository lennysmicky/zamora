// src/pages/Restaurant/Menu/RestaurantMenuPage.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiRefreshLine, RiLoader4Line } from 'react-icons/ri';
import { useMenusData } from '../../../hooks/UseMenusdata';

// Components partagés
import CategoryList from '../../../components/menus/CategoryList';
import CategoryForm from '../../../components/menus/CategoryForm';
import MealList from '../../../components/menus/MealList';
import MealForm from '../../../components/menus/MealForm';

// CSS partagé avec Admin
import '../../Menus/MenusPage.css';

const RestaurantMenuPage = () => {
  const { t } = useTranslation();
  
  // Hook data (filtre auto par restaurantId via authStore)
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
    refreshMeals
  } = useMenusData();

  // States pour les modals
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [showMealForm, setShowMealForm] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // ========================================
  // Handlers Refresh
  // ========================================
  const handleRefresh = async () => {
    if (refreshing || isLoading) return;
    
    setRefreshing(true);
    try {
      await refreshCategories();
      if (selectedCategory) {
        await refreshMeals();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

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
    
    let result;
    if (categoryToEdit) {
      result = await updateCategory(categoryToEdit.id, data);
    } else {
      result = await addCategory(data);
    }
    
    setIsCategoryLoading(false);
    
    if (result.success) {
      setShowCategoryForm(false);
      setCategoryToEdit(null);
    }
    
    return result;
  };

  const handleDeleteCategory = async (categoryId) => {
    return await deleteCategory(categoryId);
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
    
    let result;
    if (mealToEdit) {
      result = await updateMeal(mealToEdit.id, data);
    } else {
      result = await addMeal(data);
    }
    
    setIsMealLoading(false);
    
    if (result.success) {
      setShowMealForm(false);
      setMealToEdit(null);
    }
    
    return result;
  };

  const handleDeleteMeal = async (mealId) => {
    return await deleteMeal(mealId);
  };

  const handleToggleMealAvailability = async (mealId) => {
    return await toggleMealAvailability(mealId);
  };

  const handleCloseMealForm = () => {
    setShowMealForm(false);
    setMealToEdit(null);
  };

  // Error state
  if (error) {
    return (
      <div className="menus-page">
        <div className="menus-error">
          <p>{t('common.error')}: {error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menus-page">
      {/* Header avec refresh */}
      <div className="menus-page-header">
        <h1 className="menus-page-title">{t('menu.title')}</h1>
        <button
          className={`menus-refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          title={t('common.refresh')}
        >
          {refreshing ? (
            <RiLoader4Line className="spin" />
          ) : (
            <RiRefreshLine />
          )}
        </button>
      </div>

      {/* Layout 2 colonnes */}
      <div className="menus-grid">
        {/* Colonne gauche - Catégories */}
        <div className="menus-column categories-column">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            isLoading={isLoading && !refreshing}
          />
        </div>

        {/* Colonne droite - Plats */}
        <div className="menus-column meals-column">
          <MealList
            meals={meals}
            selectedCategory={selectedCategory}
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
            onToggleAvailability={handleToggleMealAvailability}
            isLoading={isLoading && !refreshing}
          />
        </div>
      </div>

      {/* Modal Catégorie */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={handleCloseCategoryForm}
        onSubmit={handleCategorySubmit}
        category={categoryToEdit}
        isLoading={isCategoryLoading}
      />

      {/* Modal Plat */}
      <MealForm
        isOpen={showMealForm}
        onClose={handleCloseMealForm}
        onSubmit={handleMealSubmit}
        meal={mealToEdit}
        categories={categories}
        selectedCategoryId={selectedCategory?.id}
        isLoading={isMealLoading}
      />
    </div>
  );
};

export default RestaurantMenuPage;