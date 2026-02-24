// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[menusAPI] Missing ${name}`);
  return v;
};

const statusOf = (e) => Number(e?.response?.status ?? 0);
const isSkippableRouteError = (e) => {
  const s = statusOf(e);
  return s === 404 || s === 405; // 404 Not Found / 405 Method Not Allowed
};

const tryRoutes = async (calls = []) => {
  let lastErr = null;
  for (const fn of calls) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isSkippableRouteError(e)) throw e; // erreurs "réelles" => stop
      // sinon on tente la route suivante
    }
  }
  throw lastErr ?? new Error("[menusAPI] All route candidates failed");
};

// ---- mapping (menus module only) ----
const mapRestaurant = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = { ...obj };

  const rid =
    x.restaurent ??
    x.restaurentId ??
    x.restaurantId ??
    x.restaurant ??
    x.restaurant_id;

  if (rid != null) x.restaurent = rid;

  delete x.restaurentId;
  delete x.restaurantId;
  delete x.restaurant;
  delete x.restaurant_id;

  return x;
};

const getRid = (obj = {}) => mapRestaurant(obj)?.restaurent ?? null;

const mapMenuPayload = (obj = {}) => mapRestaurant(obj);

const mapCategoryPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj);

  const mid = x.menu ?? x.menuId;
  if (mid != null) x.menu = mid;
  delete x.menuId;

  return x;
};

const mapRepasPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj);

  const mid = x.menu ?? x.menuId;
  if (mid != null) x.menu = mid;
  delete x.menuId;

  const cid = x.categorie ?? x.categoryId ?? x.categorieId ?? x.category;
  if (cid != null) x.categorie = cid;
  delete x.categoryId;
  delete x.categorieId;
  delete x.category;

  // backend typo: isAvaible
  if (Object.prototype.hasOwnProperty.call(x, "isAvailable")) {
    x.isAvaible = x.isAvailable;
    delete x.isAvailable;
  }

  return x;
};

// ================= MENUS =================
export const getMenus = async (params = {}) =>
  unwrap(await client.get("/menu", { params: mapRestaurant(params) }));

export const createMenu = async (payload) =>
  unwrap(await client.post("/menu", mapMenuPayload(payload)));

export const updateMenu = async (id, payload) =>
  unwrap(await client.put(`/menu/${ensureId("menuId", id)}`, mapMenuPayload(payload)));

export const deleteMenu = async (id) =>
  unwrap(await client.delete(`/menu/${ensureId("menuId", id)}`));

// ================= CATEGORIES =================

// GET: privilégie /categorie/:rid si rid existe (car ton backend l’a)
export const getCategories = async (params = {}) => {
  const p = mapRestaurant(params);
  const rid = getRid(p);

  return tryRoutes([
    // restaurant route
    ...(rid
      ? [() => unwrap(client.get(`/categorie/${ensureId("restaurentId", rid)}`))]
      : []),

    // global route (si supportée)
    () => unwrap(client.get("/categorie", { params: p })),
  ]);
};

// POST: privilégie /categorie/:rid si rid existe
export const createCategory = async (payload) => {
  const body = mapCategoryPayload(payload);
  const rid = getRid(body);

  return tryRoutes([
    ...(rid
      ? [
          () =>
            unwrap(
              client.post(`/categorie/${ensureId("restaurentId", rid)}`, body)
            ),
        ]
      : []),

    () => unwrap(client.post("/categorie", body)),
  ]);
};

// PUT: privilégie /categorie/:rid/:id si rid existe
export const updateCategory = async (id, payload) => {
  const body = mapCategoryPayload(payload);
  const rid = getRid(body);

  return tryRoutes([
    ...(rid
      ? [
          () =>
            unwrap(
              client.put(
                `/categorie/${ensureId("restaurentId", rid)}/${ensureId("categoryId", id)}`,
                body
              )
            ),
        ]
      : []),

    () => unwrap(client.put(`/categorie/${ensureId("categoryId", id)}`, body)),
  ]);
};

// DELETE: privilégie /categorie/:rid/:id si rid existe
export const deleteCategory = async (id, restaurentId = null) => {
  const rid = restaurentId ?? null;

  return tryRoutes([
    ...(rid
      ? [
          () =>
            unwrap(
              client.delete(
                `/categorie/${ensureId("restaurentId", rid)}/${ensureId("categoryId", id)}`
              )
            ),
        ]
      : []),

    () => unwrap(client.delete(`/categorie/${ensureId("categoryId", id)}`)),
  ]);
};

export const getMenuCategoriesWithMeals = async (menuId) =>
  unwrap(await client.get(`/categorie/menu/${ensureId("menuId", menuId)}/repas`));

// ================= REPAS =================
export const getRepasByCategory = async (categorieId) =>
  unwrap(await client.get(`/repas/categorie/${ensureId("categorieId", categorieId)}/repas`));

export const createRepas = async (payload) =>
  unwrap(await client.post("/repas", mapRepasPayload(payload)));

export const updateRepas = async (id, payload) =>
  unwrap(await client.put(`/repas/${ensureId("repasId", id)}`, mapRepasPayload(payload)));

export const deleteRepas = async (id) =>
  unwrap(await client.delete(`/repas/${ensureId("repasId", id)}`));

// aliases admin
export const getMealsByCategory = getRepasByCategory;
export const createMeal = createRepas;
export const updateMeal = updateRepas;
export const deleteMeal = deleteRepas;

// ---------------- REPAS (RESTAURANT) ----------------
export const createRepasForRestaurant = async (restaurentId, payload) =>
  unwrap(
    await client.post(
      `/repas/${ensureId("restaurentId", restaurentId)}`,
      mapRepasPayload(payload)
    )
  );

export const updateRepasForRestaurant = async (restaurentId, id, payload) =>
  unwrap(
    await client.put(
      `/repas/${ensureId("restaurentId", restaurentId)}/${ensureId("repasId", id)}`,
      mapRepasPayload(payload)
    )
  );

export const deleteRepasForRestaurant = async (restaurentId, id) =>
  unwrap(
    await client.delete(
      `/repas/${ensureId("restaurentId", restaurentId)}/${ensureId("repasId", id)}`
    )
  );

export const getRepasByCategoryForRestaurant = async (restaurentId, categorieId) =>
  unwrap(
    await client.get(
      `/repas/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId("categorieId", categorieId)}`
    )
  );

// ---------------- CATEGORIES (RESTAURANT) ----------------
export const createCategoryForRestaurant = async (restaurentId, payload) =>
  unwrap(
    await client.post(
      `/categorie/${ensureId("restaurentId", restaurentId)}`,
      mapCategoryPayload(payload)
    )
  );

export const updateCategoryForRestaurant = async (restaurentId, id, payload) =>
  unwrap(
    await client.put(
      `/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId("categoryId", id)}`,
      mapCategoryPayload(payload)
    )
  );

export const deleteCategoryForRestaurant = async (restaurentId, id) =>
  unwrap(
    await client.delete(
      `/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId("categoryId", id)}`
    )
  );

// restaurant aliases
export const getMealsByCategoryForRestaurant = getRepasByCategoryForRestaurant;
export const createMealForRestaurant = createRepasForRestaurant;
export const updateMealForRestaurant = updateRepasForRestaurant;
export const deleteMealForRestaurant = deleteRepasForRestaurant;

export default {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuCategoriesWithMeals,

  getRepasByCategory,
  createRepas,
  updateRepas,
  deleteRepas,

  getMealsByCategory,
  createMeal,
  updateMeal,
  deleteMeal,

  getRepasByCategoryForRestaurant,
  createRepasForRestaurant,
  updateRepasForRestaurant,
  deleteRepasForRestaurant,

  createCategoryForRestaurant,
  updateCategoryForRestaurant,
  deleteCategoryForRestaurant,

  getMealsByCategoryForRestaurant,
  createMealForRestaurant,
  updateMealForRestaurant,
  deleteMealForRestaurant,
};