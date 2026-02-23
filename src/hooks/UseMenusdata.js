// src/hooks/useMenusData.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import menusAPI from "../api/menus";
import useAuthStore from "../stores/authStore";

const idOf = (x) => x?.id ?? x?._id ?? null;
const eqId = (a, b) => String(a ?? "") === String(b ?? "");
const asArray = (v) => (Array.isArray(v) ? v : []);

const pickCategories = (payload) => {
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.categorie)) return payload.categorie;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  if (Array.isArray(payload?.data?.categorie)) return payload.data.categorie;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const pickMealsList = (payload) => {
  if (Array.isArray(payload?.meals)) return payload.meals;
  if (Array.isArray(payload?.repas)) return payload.repas;
  if (Array.isArray(payload?.data?.meals)) return payload.data.meals;
  if (Array.isArray(payload?.data?.repas)) return payload.data.repas;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const pickMenusList = (payload) => {
  if (Array.isArray(payload?.menus)) return payload.menus;
  if (Array.isArray(payload?.data?.menus)) return payload.data.menus;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normId = (x) => ({ ...x, id: idOf(x) });

const normMeal = (m) => ({
  ...m,
  id: idOf(m),
  categoryId:
    m?.categoryId ??
    m?.categorieId ??
    m?.categorie?._id ??
    m?.categorie?.id ??
    m?.categorie ??
    null,
  // tolère typo backend
  isAvailable: m?.isAvailable ?? m?.isAvaible ?? false,
});

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[useMenusData] Missing ${name}`);
  return v;
};

// Base API (admin/global)
const baseApi = {
  // categories
  getCategories: menusAPI.getCategories,
  getMenuCategoriesWithMeals: menusAPI.getMenuCategoriesWithMeals,
  createCategory: menusAPI.createCategory,
  updateCategory: menusAPI.updateCategory,
  deleteCategory: menusAPI.deleteCategory,

  // meals/repas
  getMealsByCategory: menusAPI.getMealsByCategory ?? menusAPI.getRepasByCategory,
  createMeal: menusAPI.createMeal ?? menusAPI.createRepas,
  updateMeal: menusAPI.updateMeal ?? menusAPI.updateRepas,
  deleteMeal: menusAPI.deleteMeal ?? menusAPI.deleteRepas,

  // menus
  getMenus: menusAPI.getMenus,
  createMenu: menusAPI.createMenu,
  updateMenu: menusAPI.updateMenu,
  deleteMenu: menusAPI.deleteMenu,
};

export const useMenusData = ({ menuId = null, restaurantId: restaurantIdProp = null } = {}) => {
  const restaurantIdStore = useAuthStore((s) => s.restaurantId ?? s.restaurentId);
  const userTypeStore = useAuthStore((s) => s.userType);
  const userType = userTypeStore ?? localStorage.getItem("user_role"); // fallback
  const restaurantId = restaurantIdProp || restaurantIdStore;

  // ✅ scope restaurant : uniquement si user restaurant + restaurantId + pas de menuId
  const isRestaurantScope = userType === "restaurant" && !!restaurantId && !menuId;

  // ✅ en mode restaurant : on masque les erreurs de fetch (505/500 etc.)
  const silentFetchErrors = isRestaurantScope;

  // ✅ API “effective” selon scope
  const api = useMemo(() => {
    if (!isRestaurantScope) return baseApi;

    // wrap signatures pour matcher l’usage existant du hook
    return {
      ...baseApi,

      // meals list : GET /repas/categorie/:restaurentId/:categorieId
      getMealsByCategory: menusAPI.getMealsByCategoryForRestaurant
        ? (categorieId) => menusAPI.getMealsByCategoryForRestaurant(restaurantId, categorieId)
        : baseApi.getMealsByCategory,

      // create/update/delete meals : /repas/:restaurentId(/:id)
      createMeal: menusAPI.createMealForRestaurant
        ? (payload) => menusAPI.createMealForRestaurant(restaurantId, payload)
        : baseApi.createMeal,

      updateMeal: menusAPI.updateMealForRestaurant
        ? (id, payload) => menusAPI.updateMealForRestaurant(restaurantId, id, payload)
        : baseApi.updateMeal,

      deleteMeal: menusAPI.deleteMealForRestaurant
        ? (id) => menusAPI.deleteMealForRestaurant(restaurantId, id)
        : baseApi.deleteMeal,

      // categories : /categorie/:restaurentId(/:id)
      createCategory: menusAPI.createCategoryForRestaurant
        ? (payload) => menusAPI.createCategoryForRestaurant(restaurantId, payload)
        : baseApi.createCategory,

      updateCategory: menusAPI.updateCategoryForRestaurant
        ? (id, payload) => menusAPI.updateCategoryForRestaurant(restaurantId, id, payload)
        : baseApi.updateCategory,

      deleteCategory: menusAPI.deleteCategoryForRestaurant
        ? (id) => menusAPI.deleteCategoryForRestaurant(restaurantId, id)
        : baseApi.deleteCategory,
    };
  }, [isRestaurantScope, restaurantId]);

  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // cache repas par catégorie
  const mealsByCategoryRef = useRef({});

  // anti-race
  const seqCats = useRef(0);
  const seqMeals = useRef(0);
  const seqMenus = useRef(0);

  // compteurs fetch (parallèle safe)
  const loadingCount = useRef(0);
  const refreshingCount = useRef(0);

  // refs pour éviter deps loops
  const categoriesRef = useRef([]);
  const mealsRef = useRef([]);
  const menusRef = useRef([]);
  useEffect(() => void (categoriesRef.current = categories), [categories]);
  useEffect(() => void (mealsRef.current = meals), [meals]);
  useEffect(() => void (menusRef.current = menus), [menus]);

  const selectedCategoryId = useMemo(() => idOf(selectedCategory), [selectedCategory]);

  const startFetch = (mode) => {
    if (mode === "loading") {
      loadingCount.current += 1;
      setIsLoading(true);
    } else {
      refreshingCount.current += 1;
      setIsRefreshing(true);
    }
  };

  const endFetch = (mode) => {
    if (mode === "loading") {
      loadingCount.current = Math.max(0, loadingCount.current - 1);
      if (loadingCount.current === 0) setIsLoading(false);
    } else {
      refreshingCount.current = Math.max(0, refreshingCount.current - 1);
      if (refreshingCount.current === 0) setIsRefreshing(false);
    }
  };

  const setFetchError = (e, fallbackMsg) => {
    if (silentFetchErrors) {
      console.error("[menus fetch]", e);
      return;
    }
    setError(e?.message ?? fallbackMsg);
  };

  const fetchCategories = useCallback(async () => {
    const mode = categoriesRef.current.length === 0 ? "loading" : "refresh";
    startFetch(mode);
    if (!silentFetchErrors) setError(null);

    const mySeq = ++seqCats.current;

    try {
      const payload = menuId
        ? await api.getMenuCategoriesWithMeals(ensureId("menuId", menuId))
        : await api.getCategories?.(restaurantId ? { restaurantId } : {});

      if (mySeq !== seqCats.current) return;

      const catsRaw = pickCategories(payload);
      const cats = asArray(catsRaw).map(normId);
      setCategories(cats);

      if (menuId) {
        const map = {};
        for (const c of asArray(catsRaw)) {
          const cid = idOf(c);
          const r = c?.repas ?? c?.meals ?? c?.items;
          if (cid && Array.isArray(r)) map[cid] = r.map(normMeal);
        }
        mealsByCategoryRef.current = map;
      } else {
        mealsByCategoryRef.current = {};
      }

      setSelectedCategory((prev) => {
        const prevId = idOf(prev);
        if (prevId && cats.some((c) => eqId(c.id, prevId))) return prev;
        return cats[0] ?? null;
      });
    } catch (e) {
      setFetchError(e, "Erreur chargement catégories");
      if (categoriesRef.current.length === 0) {
        setCategories([]);
        setSelectedCategory(null);
        setMeals([]);
        mealsByCategoryRef.current = {};
      }
    } finally {
      endFetch(mode);
    }
  }, [api, menuId, restaurantId, silentFetchErrors]);

  const fetchMeals = useCallback(
    async (categorieId) => {
      if (!categorieId) return;

      const cached = mealsByCategoryRef.current?.[categorieId];
      if (menuId && Array.isArray(cached)) {
        setMeals(cached);
        return;
      }

      const mode = mealsRef.current.length === 0 ? "loading" : "refresh";
      startFetch(mode);
      if (!silentFetchErrors) setError(null);

      const mySeq = ++seqMeals.current;

      try {
        if (!api.getMealsByCategory) throw new Error("API getMealsByCategory manquante");

        const payload = await api.getMealsByCategory(categorieId);
        if (mySeq !== seqMeals.current) return;

        const list = pickMealsList(payload);
        const normalized = asArray(list).map(normMeal);

        setMeals(normalized);

        if (menuId) {
          mealsByCategoryRef.current = { ...mealsByCategoryRef.current, [categorieId]: normalized };
        }
      } catch (e) {
        setFetchError(e, "Erreur chargement repas");
        if (mealsRef.current.length === 0) setMeals([]);
      } finally {
        endFetch(mode);
      }
    },
    [api, menuId, silentFetchErrors]
  );

  const fetchMenus = useCallback(async () => {
    if (!api.getMenus) return;

    const mode = menusRef.current.length === 0 ? "loading" : "refresh";
    startFetch(mode);
    if (!silentFetchErrors) setError(null);

    const mySeq = ++seqMenus.current;

    try {
      const payload = await api.getMenus(restaurantId ? { restaurantId } : {});
      if (mySeq !== seqMenus.current) return;

      const list = pickMenusList(payload);
      setMenus(asArray(list).map(normId));
    } catch (e) {
      setFetchError(e, "Erreur chargement menus");
      if (menusRef.current.length === 0) setMenus([]);
    } finally {
      endFetch(mode);
    }
  }, [api, restaurantId, silentFetchErrors]);

  // ---------- CRUD Categories ----------
  const addCategory = useCallback(
    async (categoryData) => {
      try {
        if (!api.createCategory) throw new Error("API createCategory manquante");

        // ✅ restaurant scope: restaurantId dans l’URL => on n’envoie pas restaurantId dans payload
        const payload = {
          ...categoryData,
          ...(menuId && !categoryData.menu ? { menu: menuId } : {}),
          ...(!isRestaurantScope &&
          restaurantId &&
          !categoryData.restaurantId &&
          !categoryData.restaurent
            ? { restaurantId }
            : {}),
        };

        const res = await api.createCategory(payload);
        const cat = normId(res?.category ?? res?.categorie ?? res);

        setCategories((prev) => [...prev, cat]);
        if (!selectedCategoryId) setSelectedCategory(cat);

        return { success: true, data: cat };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout catégorie" };
      }
    },
    [api, menuId, restaurantId, selectedCategoryId, isRestaurantScope]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      try {
        if (!api.updateCategory) throw new Error("API updateCategory manquante");

        await api.updateCategory(categoryId, categoryData);

        setCategories((prev) =>
          prev.map((c) => (eqId(c.id, categoryId) ? { ...c, ...categoryData } : c))
        );
        setSelectedCategory((prev) =>
          prev && eqId(idOf(prev), categoryId) ? { ...prev, ...categoryData } : prev
        );

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur modification catégorie" };
      }
    },
    [api]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      try {
        if (!api.deleteCategory) throw new Error("API deleteCategory manquante");

        await api.deleteCategory(categoryId);

        setCategories((prev) => prev.filter((c) => !eqId(c.id, categoryId)));

        const next = { ...mealsByCategoryRef.current };
        delete next[categoryId];
        mealsByCategoryRef.current = next;

        if (eqId(selectedCategoryId, categoryId)) {
          setSelectedCategory(null);
          setMeals([]);
        }

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression catégorie" };
      }
    },
    [api, selectedCategoryId]
  );

  // ---------- CRUD Meals ----------
  const addMeal = useCallback(
    async (mealData) => {
      try {
        if (!api.createMeal) throw new Error("API createMeal manquante");

        const payload = {
          ...mealData,
          ...(menuId && !mealData.menu ? { menu: menuId } : {}),
          // ✅ restaurant scope: restaurantId dans l’URL => pas dans payload
          ...(!isRestaurantScope &&
          restaurantId &&
          !mealData.restaurantId &&
          !mealData.restaurent
            ? { restaurantId }
            : {}),
          ...(!mealData.categoryId && !mealData.categorie && selectedCategoryId
            ? { categoryId: selectedCategoryId }
            : {}),
        };

        const res = await api.createMeal(payload);
        const meal = normMeal(res?.meal ?? res?.repas ?? res);

        setMeals((prev) => [...prev, meal]);

        if (selectedCategoryId) {
          const cur = mealsByCategoryRef.current[selectedCategoryId] || [];
          mealsByCategoryRef.current = { ...mealsByCategoryRef.current, [selectedCategoryId]: [...cur, meal] };
        }

        return { success: true, data: meal };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout repas" };
      }
    },
    [api, menuId, restaurantId, selectedCategoryId, isRestaurantScope]
  );

  const updateMeal = useCallback(
    async (mealId, mealData) => {
      try {
        if (!api.updateMeal) throw new Error("API updateMeal manquante");

        await api.updateMeal(mealId, mealData);

        setMeals((prev) => prev.map((m) => (eqId(m.id, mealId) ? { ...m, ...mealData } : m)));

        const next = { ...mealsByCategoryRef.current };
        Object.keys(next).forEach((k) => {
          next[k] = (next[k] || []).map((m) => (eqId(m.id, mealId) ? { ...m, ...mealData } : m));
        });
        mealsByCategoryRef.current = next;

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur modification repas" };
      }
    },
    [api]
  );

  const deleteMeal = useCallback(
    async (mealId) => {
      try {
        if (!api.deleteMeal) throw new Error("API deleteMeal manquante");

        await api.deleteMeal(mealId);
        setMeals((prev) => prev.filter((m) => !eqId(m.id, mealId)));

        const next = { ...mealsByCategoryRef.current };
        Object.keys(next).forEach((k) => {
          next[k] = (next[k] || []).filter((m) => !eqId(m.id, mealId));
        });
        mealsByCategoryRef.current = next;

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression repas" };
      }
    },
    [api]
  );

  const toggleMealAvailability = useCallback(
    async (mealId) => {
      const meal = mealsRef.current.find((m) => eqId(m.id, mealId));
      if (!meal) return { success: false, error: "Plat non trouvé" };
      return updateMeal(mealId, { isAvailable: !meal.isAvailable });
    },
    [updateMeal]
  );

  // ---------- CRUD Menus (inchangé) ----------
  const addMenu = useCallback(
    async (menuData) => {
      try {
        if (!api.createMenu) throw new Error("API createMenu manquante");

        const payload = {
          ...menuData,
          ...(restaurantId && !menuData.restaurantId && !menuData.restaurent ? { restaurantId } : {}),
        };

        const res = await api.createMenu(payload);
        const menu = normId(res?.menu ?? res?.data ?? res);

        setMenus((prev) => [...prev, menu]);
        return { success: true, data: menu };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout menu" };
      }
    },
    [api, restaurantId]
  );

  const updateMenu = useCallback(
    async (menuIdToUpdate, menuData) => {
      try {
        if (!api.updateMenu) throw new Error("API updateMenu manquante");

        await api.updateMenu(menuIdToUpdate, menuData);
        setMenus((prev) => prev.map((m) => (eqId(m.id, menuIdToUpdate) ? { ...m, ...menuData } : m)));

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur modification menu" };
      }
    },
    [api]
  );

  const deleteMenu = useCallback(
    async (menuIdToDelete) => {
      try {
        if (!api.deleteMenu) throw new Error("API deleteMenu manquante");

        await api.deleteMenu(menuIdToDelete);
        setMenus((prev) => prev.filter((m) => !eqId(m.id, menuIdToDelete)));

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression menu" };
      }
    },
    [api]
  );

  // init
  useEffect(() => {
    fetchCategories();
    fetchMenus();
  }, [fetchCategories, fetchMenus]);

  useEffect(() => {
    if (selectedCategoryId) fetchMeals(selectedCategoryId);
  }, [selectedCategoryId, fetchMeals]);

  return {
    categories,
    meals,
    menus,

    selectedCategory,
    setSelectedCategory,

    isLoading,
    isRefreshing,
    // ✅ en mode restaurant, error restera null sur fetch (donc pas de “fetch 505” à l’écran)
    error,

    addCategory,
    updateCategory,
    deleteCategory,

    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealAvailability,

    addMenu,
    updateMenu,
    deleteMenu,

    refreshCategories: fetchCategories,
    refreshMeals: () => fetchMeals(selectedCategoryId),
    refreshMenus: fetchMenus,
  };
};

export default useMenusData;