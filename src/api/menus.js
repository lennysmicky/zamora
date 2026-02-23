// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[menusAPI] Missing ${name}`);
  return v;
};

const getRid = (obj) =>
  obj?.restaurent ?? obj?.restaurantId ?? obj?.restaurentId ?? obj?.restaurant ?? null;

// fallback helper (404/405 -> try next)
const withFallback = async (tries = []) => {
  let lastErr;
  for (const fn of tries) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const st = e?.response?.status;
      if (st === 404 || st === 405) continue;
      throw e;
    }
  }
  throw lastErr;
};

// ---- mapping (menus module only) ----
const mapRestaurant = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = { ...obj };
  const rid = getRid(x);
  if (rid != null) x.restaurent = rid;
  delete x.restaurantId;
  delete x.restaurentId;
  delete x.restaurant;
  return x;
};

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
//
// IMPORTANT:
// - Ton backend en prod ne supporte PAS GET /categorie (404)
// - On préfère GET /categorie/:restaurentId quand on a un restaurantId
//
export const getCategoriesForRestaurant = async (restaurentId) =>
  unwrap(await client.get(`/categorie/${ensureId("restaurentId", restaurentId)}`));

export const getCategories = async (params = {}) => {
  const p = mapRestaurant(params);
  const rid = p?.restaurent;

  if (rid) {
    // 1) try scoped list
    // 2) fallback legacy list with query (si un autre env l’a)
    const res = await withFallback([
      () => client.get(`/categorie/${rid}`),
      () => client.get("/categorie", { params: p }),
    ]);
    return unwrap(res);
  }

  return unwrap(await client.get("/categorie", { params: p }));
};

export const createCategory = async (payload) => {
  const body = mapCategoryPayload(payload);
  const rid = getRid(body);

  // si backend n’a pas POST /categorie, fallback sur /categorie/:rid
  const res = await withFallback([
    () => client.post("/categorie", body),
    ...(rid ? [() => client.post(`/categorie/${rid}`, body)] : []),
  ]);
  return unwrap(res);
};

export const updateCategory = async (id, payload = {}, restaurentId) => {
  const body = mapCategoryPayload(payload);
  const rid = restaurentId ?? getRid(body);

  const res = await withFallback([
    () => client.put(`/categorie/${ensureId("categoryId", id)}`, body),
    ...(rid ? [() => client.put(`/categorie/${rid}/${ensureId("categoryId", id)}`, body)] : []),
  ]);
  return unwrap(res);
};

export const deleteCategory = async (id, restaurentId) => {
  const rid = restaurentId ?? null;

  const res = await withFallback([
    () => client.delete(`/categorie/${ensureId("categoryId", id)}`),
    ...(rid ? [() => client.delete(`/categorie/${rid}/${ensureId("categoryId", id)}`)] : []),
  ]);
  return unwrap(res);
};

export const getMenuCategoriesWithMeals = async (menuId) =>
  unwrap(await client.get(`/categorie/menu/${ensureId("menuId", menuId)}/repas`));

// ================= REPAS =================
//
// Routes restaurant: GET /repas/categorie/:restaurentId/:categorieId
//
export const getRepasByCategoryForRestaurant = async (restaurentId, categorieId) =>
  unwrap(
    await client.get(
      `/repas/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId("categorieId", categorieId)}`
    )
  );

export const getRepasByCategory = async (categorieId, restaurentId) => {
  const cid = ensureId("categorieId", categorieId);

  if (restaurentId) return getRepasByCategoryForRestaurant(restaurentId, cid);

  // legacy fallback (si existe ailleurs)
  const res = await withFallback([() => client.get(`/repas/categorie/${cid}/repas`)]);
  return unwrap(res);
};

export const createRepasForRestaurant = async (restaurentId, payload) =>
  unwrap(
    await client.post(
      `/repas/${ensureId("restaurentId", restaurentId)}`,
      mapRepasPayload(payload)
    )
  );

export const createRepas = async (payload, restaurentId) => {
  const body = mapRepasPayload(payload);
  const rid = restaurentId ?? getRid(body);

  const res = await withFallback([
    () => client.post("/repas", body),
    ...(rid ? [() => client.post(`/repas/${rid}`, body)] : []),
  ]);
  return unwrap(res);
};

export const updateRepasForRestaurant = async (restaurentId, id, payload) =>
  unwrap(
    await client.put(
      `/repas/${ensureId("restaurentId", restaurentId)}/${ensureId("repasId", id)}`,
      mapRepasPayload(payload)
    )
  );

export const updateRepas = async (id, payload, restaurentId) => {
  const body = mapRepasPayload(payload);
  const rid = restaurentId ?? getRid(body);

  const res = await withFallback([
    () => client.put(`/repas/${ensureId("repasId", id)}`, body),
    ...(rid ? [() => client.put(`/repas/${rid}/${ensureId("repasId", id)}`, body)] : []),
  ]);
  return unwrap(res);
};

export const deleteRepasForRestaurant = async (restaurentId, id) =>
  unwrap(
    await client.delete(
      `/repas/${ensureId("restaurentId", restaurentId)}/${ensureId("repasId", id)}`
    )
  );

export const deleteRepas = async (id, restaurentId) => {
  const rid = restaurentId ?? null;

  const res = await withFallback([
    () => client.delete(`/repas/${ensureId("repasId", id)}`),
    ...(rid ? [() => client.delete(`/repas/${rid}/${ensureId("repasId", id)}`)] : []),
  ]);
  return unwrap(res);
};

// ---- Aliases “Meal” côté front ----
export const getMealsByCategory = getRepasByCategory;
export const createMeal = createRepas;
export const updateMeal = updateRepas;
export const deleteMeal = deleteRepas;

// ---- Aliases “Meal” côté front (restaurant) ----
export const getMealsByCategoryForRestaurant = getRepasByCategoryForRestaurant;
export const createMealForRestaurant = createRepasForRestaurant;
export const updateMealForRestaurant = updateRepasForRestaurant;
export const deleteMealForRestaurant = deleteRepasForRestaurant;

export default {
  // menus
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,

  // categories
  getCategories,
  getCategoriesForRestaurant,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuCategoriesWithMeals,

  // repas
  getRepasByCategory,
  getRepasByCategoryForRestaurant,
  createRepas,
  createRepasForRestaurant,
  updateRepas,
  updateRepasForRestaurant,
  deleteRepas,
  deleteRepasForRestaurant,

  // meals alias
  getMealsByCategory,
  createMeal,
  updateMeal,
  deleteMeal,

  // meals alias restaurant
  getMealsByCategoryForRestaurant,
  createMealForRestaurant,
  updateMealForRestaurant,
  deleteMealForRestaurant,
};