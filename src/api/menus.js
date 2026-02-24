// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[menusAPI] Missing ${name}`);
  return String(v);
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

  if (rid != null) x.restaurent = String(rid);

  delete x.restaurentId;
  delete x.restaurantId;
  delete x.restaurant;
  delete x.restaurant_id;

  return x;
};

const readLocal = (...keys) => {
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v != null && v !== "") return v;
    }
  } catch {
    // ignore
  }
  return null;
};

const getRid = (obj = {}) => mapRestaurant(obj)?.restaurent ?? null;
const getRidFallback = (obj = {}) =>
  getRid(obj) ?? readLocal("restaurantId", "restaurentId", "auth_restaurantId");

// ---------------- FIX: validDays normalization ----------------
const normalizeValidDays = (v) => {
  if (v == null) return v;
  if (Array.isArray(v)) {
    const arr = v.filter((x) => x != null && x !== "").map((x) => String(x));
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    // backend field is String -> send CSV (minimal change)
    return arr.join(",");
  }
  if (typeof v === "string") return v;
  return String(v);
};

// ---------------- FIX: route fallback helpers ----------------
const isNotFoundInvalidId = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message ?? err?.message ?? "";
  return status === 404 && /id invalide|not found/i.test(String(msg));
};

const mapMenuPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj);

  // ✅ fix: backend expects String
  if (Object.prototype.hasOwnProperty.call(x, "validDays")) {
    x.validDays = normalizeValidDays(x.validDays);
  }

  return x;
};

const mapCategoryPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj);

  const mid = x.menu ?? x.menuId;
  if (mid != null) x.menu = String(mid);
  delete x.menuId;

  return x;
};

const mapRepasPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj);

  const mid = x.menu ?? x.menuId;
  if (mid != null) x.menu = String(mid);
  delete x.menuId;

  const cid = x.categorie ?? x.categoryId ?? x.categorieId ?? x.category;
  if (cid != null) x.categorie = String(cid);
  delete x.categoryId;
  delete x.categorieId;
  delete x.category;

  // backend typo: isAvaible
  if (Object.prototype.hasOwnProperty.call(x, "isAvailable")) {
    x.isAvaible = !!x.isAvailable;
    delete x.isAvailable;
  }

  return x;
};

// =======================================================
// ======================= MENUS (RESTO) ==================
//   POST   /menu/:restaurentId
//   GET    /menu/:restaurentId
//   GET    /menu/:restaurentId/:id
//   PUT    /menu/:restaurentId/:id
//   DELETE /menu/:restaurentId/:id
//   (fallback) GET/PUT/DELETE /menu/:id
// =======================================================

export const getMenusForRestaurant = async (restaurentId) => {
  const rid = ensureId("restaurentId", restaurentId);
  return unwrap(await client.get(`/menu/${rid}`));
};

export const createMenuForRestaurant = async (restaurentId, payload) => {
  const rid = ensureId("restaurentId", restaurentId);
  return unwrap(await client.post(`/menu/${rid}`, mapMenuPayload(payload)));
};

export const getMenuByIdForRestaurant = async (restaurentId, id) => {
  const rid = ensureId("restaurentId", restaurentId);
  const mid = ensureId("menuId", id);

  try {
    return unwrap(await client.get(`/menu/${rid}/${mid}`));
  } catch (err) {
    if (isNotFoundInvalidId(err)) {
      return unwrap(await client.get(`/menu/${mid}`));
    }
    throw err;
  }
};

export const updateMenuForRestaurant = async (restaurentId, id, payload) => {
  const rid = ensureId("restaurentId", restaurentId);
  const mid = ensureId("menuId", id);
  const body = mapMenuPayload(payload);

  try {
    return unwrap(await client.put(`/menu/${rid}/${mid}`, body));
  } catch (err) {
    if (isNotFoundInvalidId(err)) {
      return unwrap(await client.put(`/menu/${mid}`, body));
    }
    throw err;
  }
};

export const deleteMenuForRestaurant = async (restaurentId, id) => {
  const rid = ensureId("restaurentId", restaurentId);
  const mid = ensureId("menuId", id);

  try {
    return unwrap(await client.delete(`/menu/${rid}/${mid}`));
  } catch (err) {
    if (isNotFoundInvalidId(err)) {
      return unwrap(await client.delete(`/menu/${mid}`));
    }
    throw err;
  }
};

// =======================================================
// ===================== CATEGORIES (RESTO) ===============
//   GET        /categorie/:restaurentId
//   POST       /categorie/:restaurentId
//   PUT        /categorie/:restaurentId/:id
//   DELETE     /categorie/:restaurentId/:id
//   GET        /categorie/menu/:restaurentId/:menuId
// =======================================================

export const getCategoriesForRestaurant = async (restaurentId) =>
  unwrap(await client.get(`/categorie/${ensureId("restaurentId", restaurentId)}`));

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

// “Les catégories d’un menu”
export const getMenuCategoriesForRestaurant = async (restaurentId, menuId) =>
  unwrap(
    await client.get(
      `/categorie/menu/${ensureId("restaurentId", restaurentId)}/${ensureId("menuId", menuId)}`
    )
  );

// Alias conservé (ton hook l’utilise)
export const getMenuCategoriesWithMeals = async (restaurentId, menuId) =>
  getMenuCategoriesForRestaurant(restaurentId, menuId);

// =======================================================
// ========================= REPAS (RESTO) =================
//   POST       /repas/:restaurentId
//   PUT        /repas/:restaurentId/:id
//   DELETE     /repas/:restaurentId/:id
//   GET        /repas/categorie/:restaurentId/:categorieId
// =======================================================

export const getRepasByCategoryForRestaurant = async (restaurentId, categorieId) =>
  unwrap(
    await client.get(
      `/repas/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId("categorieId", categorieId)}`
    )
  );

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

// Restaurant aliases (UI “meal”)
export const getMealsByCategoryForRestaurant = getRepasByCategoryForRestaurant;
export const createMealForRestaurant = createRepasForRestaurant;
export const updateMealForRestaurant = updateRepasForRestaurant;
export const deleteMealForRestaurant = deleteRepasForRestaurant;

// --------------------------------------------------------
// Compat (signatures proches de ton ancien code)
// --------------------------------------------------------
export const getMenus = async (params = {}) => {
  const p = mapRestaurant(params);
  const rid = getRidFallback(p);
  if (!rid) throw new Error("[menusAPI] Missing restaurentId for getMenus()");
  return getMenusForRestaurant(rid);
};

export const createMenu = async (payload, restaurentId = null) => {
  const body = mapMenuPayload(payload);
  const rid = restaurentId ?? getRidFallback(body);
  if (!rid) throw new Error("[menusAPI] Missing restaurentId for createMenu()");
  return createMenuForRestaurant(rid, body);
};

export const getMenuById = async (id, restaurentId = null) => {
  const rid = restaurentId ?? getRidFallback({});
  if (!rid) throw new Error("[menusAPI] Missing restaurentId for getMenuById()");
  return getMenuByIdForRestaurant(rid, id);
};

export const updateMenu = async (id, payload, restaurentId = null) => {
  const body = mapMenuPayload(payload);
  const rid = restaurentId ?? getRidFallback(body);
  if (!rid) throw new Error("[menusAPI] Missing restaurentId for updateMenu()");
  return updateMenuForRestaurant(rid, id, body);
};

export const deleteMenu = async (id, restaurentId = null) => {
  const rid = restaurentId ?? getRidFallback({});
  if (!rid) throw new Error("[menusAPI] Missing restaurentId for deleteMenu()");
  return deleteMenuForRestaurant(rid, id);
};

export default {
  // menus
  getMenusForRestaurant,
  createMenuForRestaurant,
  getMenuByIdForRestaurant,
  updateMenuForRestaurant,
  deleteMenuForRestaurant,

  // categories
  getCategoriesForRestaurant,
  createCategoryForRestaurant,
  updateCategoryForRestaurant,
  deleteCategoryForRestaurant,
  getMenuCategoriesForRestaurant,
  getMenuCategoriesWithMeals,

  // repas
  getRepasByCategoryForRestaurant,
  createRepasForRestaurant,
  updateRepasForRestaurant,
  deleteRepasForRestaurant,

  // meal aliases
  getMealsByCategoryForRestaurant,
  createMealForRestaurant,
  updateMealForRestaurant,
  deleteMealForRestaurant,

  // compat
  getMenus,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
};