// src/hooks/useMenusData.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import menusAPI from "../api/menus";
import useAuthStore from "../stores/authStore";

const idOf = (x) => x?.id ?? x?._id ?? null;
const eqId = (a, b) => String(a ?? "") === String(b ?? "");
const asArray = (v) => (Array.isArray(v) ? v : []);

const readLocal = (...keys) => {
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v != null && v !== "") return v;
    }
  } catch {}
  return null;
};

// ---------------- pickers ----------------
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

// ---------------- normalizers ----------------
const normId = (x) => ({ ...x, id: idOf(x) });

const normMeal = (m) => ({
  ...m,
  id: idOf(m),
  menuId: m?.menuId ?? m?.menu?._id ?? m?.menu?.id ?? m?.menu ?? null,
  categoryId:
    m?.categoryId ??
    m?.categorieId ??
    m?.categorie?._id ??
    m?.categorie?.id ??
    m?.categorie ??
    null,
  isAvailable: m?.isAvailable ?? m?.isAvaible ?? false,
});

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[useMenusData] Missing ${name}`);
  return v;
};

export const useMenusData = ({ menuId = null, restaurantId: restaurantIdProp = null } = {}) => {
  const restaurantIdStore = useAuthStore(
    (s) =>
      s?.restaurantId ??
      s?.restaurentId ??
      s?.user?.restaurantId ??
      s?.user?.restaurentId ??
      null
  );

  const restaurentId =
    restaurantIdProp ??
    restaurantIdStore ??
    readLocal("restaurantId", "restaurentId", "auth_restaurantId");

  // ======================= API (restaurant-only) =======================
  const api = useMemo(() => {
    const rid = String(restaurentId ?? "");
    if (!rid) return null;

    return {
      // menus
      getMenus: () => menusAPI.getMenusForRestaurant(rid),
      createMenu: (payload) => menusAPI.createMenuForRestaurant(rid, payload),
      updateMenu: (id, payload) => menusAPI.updateMenuForRestaurant(rid, id, payload),
      deleteMenu: (id) => menusAPI.deleteMenuForRestaurant(rid, id),

      // categories
      getCategories: () => menusAPI.getCategoriesForRestaurant(rid),
      createCategory: (payload) => menusAPI.createCategoryForRestaurant(rid, payload),
      updateCategory: (id, payload) => menusAPI.updateCategoryForRestaurant(rid, id, payload),
      deleteCategory: (id) => menusAPI.deleteCategoryForRestaurant(rid, id),

      // categories d’un menu
      getMenuCategoriesWithMeals: (mid) => menusAPI.getMenuCategoriesWithMeals(rid, mid),

      // repas
      getMealsByCategory: (categorieId) => menusAPI.getMealsByCategoryForRestaurant(rid, categorieId),
      createMeal: (payload) => menusAPI.createMealForRestaurant(rid, payload),
      updateMeal: (id, payload) => menusAPI.updateMealForRestaurant(rid, id, payload),
      deleteMeal: (id) => menusAPI.deleteMealForRestaurant(rid, id),
    };
  }, [restaurentId]);

  // ======================= State =======================
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mealsByCategoryRef = useRef({});
  const seqCats = useRef(0);
  const seqMeals = useRef(0);
  const seqMenus = useRef(0);

  const loadingCount = useRef(0);
  const refreshingCount = useRef(0);

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

  const setFetchError = (e, fallbackMsg) => setError(e?.message ?? fallbackMsg);

  // ======================= Fetchers =======================
  const fetchCategories = useCallback(async () => {
    if (!api) {
      setError("restaurantId manquant (auth/localStorage)");
      setIsLoading(false);
      return;
    }

    const mode = categoriesRef.current.length === 0 ? "loading" : "refresh";
    startFetch(mode);
    setError(null);

    const mySeq = ++seqCats.current;

    try {
      const payload = menuId
        ? await api.getMenuCategoriesWithMeals(ensureId("menuId", menuId))
        : await api.getCategories();

      if (mySeq !== seqCats.current) return;

      const catsRaw = pickCategories(payload);
      const cats = asArray(catsRaw).map(normId);
      setCategories(cats);

      // si endpoint /categorie/menu retourne déjà les repas dans chaque categorie
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
  }, [api, menuId]);

  const fetchMeals = useCallback(
    async (categorieId) => {
      if (!api || !categorieId) return;

      const cached = mealsByCategoryRef.current?.[categorieId];
      if (menuId && Array.isArray(cached)) {
        setMeals(cached);
        return;
      }

      const mode = mealsRef.current.length === 0 ? "loading" : "refresh";
      startFetch(mode);
      setError(null);

      const mySeq = ++seqMeals.current;

      try {
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
    [api, menuId]
  );

  const fetchMenus = useCallback(async () => {
    if (!api) return;

    const mode = menusRef.current.length === 0 ? "loading" : "refresh";
    startFetch(mode);
    setError(null);

    const mySeq = ++seqMenus.current;

    try {
      const payload = await api.getMenus();
      if (mySeq !== seqMenus.current) return;

      const list = pickMenusList(payload);
      setMenus(asArray(list).map(normId));
    } catch (e) {
      setFetchError(e, "Erreur chargement menus");
      if (menusRef.current.length === 0) setMenus([]);
    } finally {
      endFetch(mode);
    }
  }, [api]);

  // ======================= CRUD Categories =======================
  const addCategory = useCallback(
    async (categoryData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

        const payload = {
          ...categoryData,
          ...(menuId && !categoryData.menu ? { menu: menuId } : {}),
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
    [api, menuId, selectedCategoryId]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

        const res = await api.updateCategory(categoryId, categoryData);
        const updated = normId(res?.category ?? res?.categorie ?? res ?? {});

        setCategories((prev) =>
          prev.map((c) => (eqId(c.id, categoryId) ? { ...c, ...categoryData, ...updated } : c))
        );
        setSelectedCategory((prev) =>
          prev && eqId(idOf(prev), categoryId) ? { ...prev, ...categoryData, ...updated } : prev
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
        if (!api) throw new Error("restaurantId manquant");

        await api.deleteCategory(categoryId);

        setCategories((prev) => {
          const next = prev.filter((c) => !eqId(c.id, categoryId));

          const cache = { ...mealsByCategoryRef.current };
          delete cache[categoryId];
          mealsByCategoryRef.current = cache;

          if (eqId(selectedCategoryId, categoryId)) {
            const nextSelected = next[0] ?? null;
            setSelectedCategory(nextSelected);
            setMeals([]);
          }

          return next;
        });

        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression catégorie" };
      }
    },
    [api, selectedCategoryId]
  );

  // ======================= CRUD Meals =======================
  const addMeal = useCallback(
    async (mealData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

        const payload = {
          ...mealData,
          ...(menuId && !mealData.menu && !mealData.menuId ? { menu: menuId } : {}),
          ...(!mealData.categoryId && !mealData.categorie && selectedCategoryId
            ? { categoryId: selectedCategoryId }
            : {}),
        };

        const res = await api.createMeal(payload);
        const meal = normMeal(res?.meal ?? res?.repas ?? res);

        setMeals((prev) => [...prev, meal]);

        if (selectedCategoryId) {
          const cur = mealsByCategoryRef.current[selectedCategoryId] || [];
          mealsByCategoryRef.current = {
            ...mealsByCategoryRef.current,
            [selectedCategoryId]: [...cur, meal],
          };
        }

        return { success: true, data: meal };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout repas" };
      }
    },
    [api, menuId, selectedCategoryId]
  );

  const updateMeal = useCallback(
    async (mealId, mealData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

        const res = await api.updateMeal(mealId, mealData);
        const updated = normMeal(res?.meal ?? res?.repas ?? res ?? {});

        setMeals((prev) => prev.map((m) => (eqId(m.id, mealId) ? { ...m, ...mealData, ...updated } : m)));

        const next = { ...mealsByCategoryRef.current };
        Object.keys(next).forEach((k) => {
          next[k] = (next[k] || []).map((m) => (eqId(m.id, mealId) ? { ...m, ...mealData, ...updated } : m));
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
        if (!api) throw new Error("restaurantId manquant");

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

  // ======================= CRUD Menus =======================
  const addMenu = useCallback(
    async (menuData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

        const res = await api.createMenu(menuData);
        const menu = normId(res?.menu ?? res?.data ?? res);

        setMenus((prev) => [...prev, menu]);
        return { success: true, data: menu };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout menu" };
      }
    },
    [api]
  );

  const updateMenu = useCallback(
    async (menuIdToUpdate, menuData) => {
      try {
        if (!api) throw new Error("restaurantId manquant");

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
        if (!api) throw new Error("restaurantId manquant");

        await api.deleteMenu(menuIdToDelete);
        setMenus((prev) => prev.filter((m) => !eqId(m.id, menuIdToDelete)));
        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression menu" };
      }
    },
    [api]
  );

  // ======================= Init =======================
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