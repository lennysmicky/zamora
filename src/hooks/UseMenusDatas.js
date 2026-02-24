// src/hooks/useMenusData.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import menusAPI from "../api/menus";
import restaurantsAPI from "../api/restaurants";
import useAuthStore from "../stores/authStore";

const ALL_REST = "__ALL__";

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

const pickRestaurantsList = (payload) => {
  if (Array.isArray(payload?.restaurants)) return payload.restaurants;
  if (Array.isArray(payload?.data?.restaurants)) return payload.data.restaurants;
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
  return String(v);
};

export const useMenusData = ({ menuId = null, restaurantId: restaurantIdProp = null } = {}) => {
  const userTypeStore = useAuthStore((s) => s?.userType ?? null);
  const roleLS = readLocal("user_role");
  const isAdmin = (userTypeStore ?? roleLS) === "admin";

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

  // ======================= API (admin OR restaurant) =======================
  const api = useMemo(() => {
    if (isAdmin) {
      return {
        // menus (admin)
        getMenus: () => menusAPI.getMenusForAdmin(),
        createMenu: (payload) => menusAPI.createMenuForAdmin(payload),
        updateMenu: (id, payload) => menusAPI.updateMenuForAdmin(id, payload),
        deleteMenu: (id) => menusAPI.deleteMenuForAdmin(id),

        // categories (admin)
        getCategories: () => menusAPI.getCategoriesForAdmin(),
        createCategory: (payload) => menusAPI.createCategoryForAdmin(payload),
        updateCategory: (id, payload) => menusAPI.updateCategoryForAdmin(id, payload),
        deleteCategory: (id) => menusAPI.deleteCategoryForAdmin(id),

        // categories d'un menu (admin)
        getMenuCategoriesWithMeals: (mid) => menusAPI.getMenuCategoriesForAdmin(mid),

        // repas (admin)
        getMealsByCategory: (categorieId) => menusAPI.getMealsByCategoryForAdmin(categorieId),
        createMeal: (payload) => menusAPI.createMealForAdmin(payload),
        updateMeal: (id, payload) => menusAPI.updateMealForAdmin(id, payload),
        deleteMeal: (id) => menusAPI.deleteMealForAdmin(id),

        // restaurants (admin)
        getRestaurants: () => restaurantsAPI.getRestaurants(),
      };
    }

    const rid = String(restaurentId ?? "");
    if (!rid) return null;

    return {
      // menus (restaurant)
      getMenus: () => menusAPI.getMenusForRestaurant(rid),
      createMenu: (payload) => menusAPI.createMenuForRestaurant(rid, payload),
      updateMenu: (id, payload) => menusAPI.updateMenuForRestaurant(rid, id, payload),
      deleteMenu: (id) => menusAPI.deleteMenuForRestaurant(rid, id),

      // categories (restaurant)
      getCategories: () => menusAPI.getCategoriesForRestaurant(rid),
      createCategory: (payload) => menusAPI.createCategoryForRestaurant(rid, payload),
      updateCategory: (id, payload) => menusAPI.updateCategoryForRestaurant(rid, id, payload),
      deleteCategory: (id) => menusAPI.deleteCategoryForRestaurant(rid, id),

      // categories d'un menu (restaurant)
      getMenuCategoriesWithMeals: (mid) => menusAPI.getMenuCategoriesWithMeals(rid, mid),

      // repas (restaurant)
      getMealsByCategory: (categorieId) => menusAPI.getMealsByCategoryForRestaurant(rid, categorieId),
      createMeal: (payload) => menusAPI.createMealForRestaurant(rid, payload),
      updateMeal: (id, payload) => menusAPI.updateMealForRestaurant(rid, id, payload),
      deleteMeal: (id) => menusAPI.deleteMealForRestaurant(rid, id),
    };
  }, [isAdmin, restaurentId]);

  // ======================= State =======================
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mealsByCategoryRef = useRef({});
  const seqCats = useRef(0);
  const seqMeals = useRef(0);
  const seqMenus = useRef(0);
  const seqRestaurants = useRef(0);

  const loadingCount = useRef(0);
  const refreshingCount = useRef(0);

  const categoriesRef = useRef([]);
  const mealsRef = useRef([]);
  const menusRef = useRef([]);
  const restaurantsRef = useRef([]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  useEffect(() => {
    mealsRef.current = meals;
  }, [meals]);
  useEffect(() => {
    menusRef.current = menus;
  }, [menus]);
  useEffect(() => {
    restaurantsRef.current = restaurants;
  }, [restaurants]);

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
      setError(isAdmin ? "API admin non initialisée" : "restaurantId manquant (auth/localStorage)");
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
  }, [api, isAdmin, menuId]);

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

  const fetchRestaurants = useCallback(async () => {
    if (!api || !isAdmin) return;

    const mode = restaurantsRef.current.length === 0 ? "loading" : "refresh";
    startFetch(mode);
    setError(null);

    const mySeq = ++seqRestaurants.current;

    try {
      const payload = await api.getRestaurants();
      if (mySeq !== seqRestaurants.current) return;

      const list = pickRestaurantsList(payload);
      setRestaurants(asArray(list).map(normId));
    } catch (e) {
      setFetchError(e, "Erreur chargement restaurants");
      if (restaurantsRef.current.length === 0) setRestaurants([]);
    } finally {
      endFetch(mode);
    }
  }, [api, isAdmin]);

  // ======================= CRUD Categories =======================
  const addCategory = useCallback(
    async (categoryData) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

        // ✅ mode "Tous les restaurants" (admin)
        if (isAdmin && categoryData?.restaurantId === ALL_REST) {
          const restos = asArray(restaurantsRef.current);
          if (restos.length === 0) throw new Error("Aucun restaurant chargé");

          const results = await Promise.allSettled(
            restos.map((r) => {
              const rid = idOf(r);
              if (!rid) return Promise.reject(new Error("Restaurant sans id"));
              const payload = {
                ...categoryData,
                restaurantId: String(rid),
                ...(menuId && !categoryData.menu && !categoryData.menuId ? { menu: menuId } : {}),
              };
              return api.createCategory(payload);
            })
          );

          const created = results
            .filter((x) => x.status === "fulfilled")
            .map((x) => x.value)
            .map((res) => normId(res?.category ?? res?.categorie ?? res));

          if (created.length === 0) {
            const firstErr = results.find((x) => x.status === "rejected")?.reason;
            throw firstErr ?? new Error("Création échouée");
          }

          setCategories((prev) => [...prev, ...created]);
          if (!selectedCategoryId) setSelectedCategory(created[0] ?? null);

          return { success: true, data: created };
        }

        // ✅ normal (1 restaurant)
        const payload = {
          ...categoryData,
          ...(menuId && !categoryData.menu && !categoryData.menuId ? { menu: menuId } : {}),
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
    [api, isAdmin, menuId, selectedCategoryId]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

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
    [api, isAdmin]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

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
    [api, isAdmin, selectedCategoryId]
  );

  // ======================= CRUD Meals =======================
  const addMeal = useCallback(
    async (mealData) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

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
    [api, isAdmin, menuId, selectedCategoryId]
  );

  const updateMeal = useCallback(
    async (mealId, mealData) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

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
    [api, isAdmin]
  );

  const deleteMeal = useCallback(
    async (mealId) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

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
    [api, isAdmin]
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
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

        const res = await api.createMenu(menuData);
        const menu = normId(res?.menu ?? res?.data ?? res);

        setMenus((prev) => [...prev, menu]);
        return { success: true, data: menu };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur ajout menu" };
      }
    },
    [api, isAdmin]
  );

  const updateMenu = useCallback(
    async (menuIdToUpdate, menuData) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

        await api.updateMenu(menuIdToUpdate, menuData);
        setMenus((prev) => prev.map((m) => (eqId(m.id, menuIdToUpdate) ? { ...m, ...menuData } : m)));
        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur modification menu" };
      }
    },
    [api, isAdmin]
  );

  const deleteMenu = useCallback(
    async (menuIdToDelete) => {
      try {
        if (!api) throw new Error(isAdmin ? "API admin non initialisée" : "restaurantId manquant");

        await api.deleteMenu(menuIdToDelete);
        setMenus((prev) => prev.filter((m) => !eqId(m.id, menuIdToDelete)));
        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message ?? "Erreur suppression menu" };
      }
    },
    [api, isAdmin]
  );

  // ======================= Init =======================
  useEffect(() => {
    fetchCategories();
    fetchMenus();
    if (isAdmin) fetchRestaurants();
  }, [fetchCategories, fetchMenus, fetchRestaurants, isAdmin]);

  useEffect(() => {
    if (selectedCategoryId) fetchMeals(selectedCategoryId);
  }, [selectedCategoryId, fetchMeals]);

  return {
    isAdminMode: isAdmin,

    categories,
    meals,
    menus,
    restaurants,

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
    refreshRestaurants: fetchRestaurants,
  };
  
};

export default useMenusData;