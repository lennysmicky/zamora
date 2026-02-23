// src/hooks/useMenusData.js
import { useCallback, useEffect, useMemo, useState } from "react";
import menusAPI from "../api/menus";

const normId = (x) => ({ ...x, id: x?.id ?? x?._id });
const normMeal = (m) => ({
  ...m,
  id: m?.id ?? m?._id,
  categoryId: m?.categoryId ?? m?.categorieId ?? m?.categorie?._id ?? m?.categorie?.id,
});

export const useMenusData = ({ menuId = null } = {}) => {
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategoryId = useMemo(
    () => selectedCategory?.id ?? selectedCategory?._id ?? null,
    [selectedCategory]
  );

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = menuId
        ? await menusAPI.getMenuCategoriesWithMeals(menuId)
        : await menusAPI.getCategories();

      const catsRaw =
        payload?.categories ?? payload?.categorie ?? payload?.data ?? payload ?? [];

      const cats = (Array.isArray(catsRaw) ? catsRaw : []).map(normId);
      setCategories(cats);

      setSelectedCategory((prev) => {
        const prevId = prev?.id ?? prev?._id;
        if (prevId && cats.some((c) => c.id === prevId)) return prev;
        return cats[0] ?? null;
      });

      // Si l’endpoint menu renvoie déjà les repas
      const mealsRaw = payload?.meals ?? payload?.repas ?? null;
      if (menuId && Array.isArray(mealsRaw)) {
        setMeals(mealsRaw.map(normMeal));
      }
    } catch (e) {
      setError(e?.message ?? "Erreur chargement catégories");
    } finally {
      setIsLoading(false);
    }
  }, [menuId]);

  const fetchMeals = useCallback(async (categorieId) => {
    if (!categorieId) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await menusAPI.getMealsByCategory(categorieId);
      const list = payload?.meals ?? payload?.repas ?? payload?.data ?? payload ?? [];
      setMeals((Array.isArray(list) ? list : []).map(normMeal));
    } catch (e) {
      setError(e?.message ?? "Erreur chargement repas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // CRUD Categories
  const addCategory = useCallback(async (categoryData) => {
    try {
      const payload = await menusAPI.createCategory(categoryData);
      const cat = normId(payload?.category ?? payload?.categorie ?? payload);
      setCategories((prev) => [...prev, cat]);
      if (!selectedCategoryId) setSelectedCategory(cat);
      return { success: true, data: cat };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur ajout catégorie" };
    }
  }, [selectedCategoryId]);

  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      await menusAPI.updateCategory(categoryId, categoryData);
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...categoryData } : c)));
      setSelectedCategory((prev) => (prev?.id === categoryId ? { ...prev, ...categoryData } : prev));
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur modification catégorie" };
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await menusAPI.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        setSelectedCategory(null);
        setMeals([]);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur suppression catégorie" };
    }
  }, [selectedCategoryId]);

  // CRUD Meals
  const addMeal = useCallback(async (mealData) => {
    try {
      const payload = await menusAPI.createMeal(mealData);
      const meal = normMeal(payload?.meal ?? payload?.repas ?? payload);
      setMeals((prev) => [...prev, meal]);
      return { success: true, data: meal };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur ajout repas" };
    }
  }, []);

  const updateMeal = useCallback(async (mealId, mealData) => {
    try {
      await menusAPI.updateMeal(mealId, mealData);
      setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, ...mealData } : m)));
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur modification repas" };
    }
  }, []);

  const deleteMeal = useCallback(async (mealId) => {
    try {
      await menusAPI.deleteMeal(mealId);
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur suppression repas" };
    }
  }, []);

  const toggleMealAvailability = useCallback(async (mealId) => {
    const meal = meals.find((m) => m.id === mealId);
    if (!meal) return { success: false, error: "Plat non trouvé" };
    return updateMeal(mealId, { isAvailable: !meal.isAvailable });
  }, [meals, updateMeal]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Si menuId est fourni ET l’endpoint renvoie déjà les repas, tu peux éviter ce fetch.
  useEffect(() => {
    if (!menuId && selectedCategoryId) fetchMeals(selectedCategoryId);
  }, [menuId, selectedCategoryId, fetchMeals]);

  return {
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

    refreshCategories: fetchCategories,
    refreshMeals: () => fetchMeals(selectedCategoryId),
  };
};

export default useMenusData;