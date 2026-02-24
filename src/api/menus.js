// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[menusAPI] Missing ${name}`);
  return String(v);
};

// ---- localStorage helpers ----
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

// ---- restaurant id resolution (backend uses `restaurent`) ----
const resolveRid = (obj = {}, { allowFallback = true } = {}) => {
  const x = obj && typeof obj === "object" ? obj : {};

  const rid =
    x.restaurent ??
    x.restaurentId ??
    x.restaurantId ??
    x.restaurant ??
    x.restaurant_id ??
    x?.restaurent?._id ??
    x?.restaurant?._id;

  if (rid != null && rid !== "") return String(rid);

  if (!allowFallback) return null;
  return (
    readLocal("restaurantId", "restaurentId", "auth_restaurantId", "admin_restaurentId") ?? null
  );
};

const mapRestaurant = (obj = {}, opts = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = { ...obj };

  const rid = resolveRid(x, opts);
  if (rid != null) x.restaurent = String(rid);

  // cleanup aliases
  delete x.restaurentId;
  delete x.restaurantId;
  delete x.restaurant;
  delete x.restaurant_id;

  return x;
};

const getRid = (obj = {}) => mapRestaurant(obj, { allowFallback: false })?.restaurent ?? null;
const getRidFallback = (obj = {}) => resolveRid(obj, { allowFallback: true });

// ---------------- validDays normalization ----------------
const normalizeValidDays = (v) => {
  if (v == null) return v;
  if (Array.isArray(v)) {
    const arr = v.filter((x) => x != null && x !== "").map((x) => String(x));
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    // backend field is String -> send CSV
    return arr.join(",");
  }
  if (typeof v === "string") return v;
  return String(v);
};

// ---------------- route fallback helpers ----------------
const isNotFoundInvalidId = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message ?? err?.message ?? "";
  return status === 404 && /id invalide|not found/i.test(String(msg));
};

// ---------------- payload mappers ----------------
const mapMenuPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj, { allowFallback: true });

  if (Object.prototype.hasOwnProperty.call(x, "validDays")) {
    x.validDays = normalizeValidDays(x.validDays);
  }

  return x;
};

const mapCategoryPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj, { allowFallback: true });

  // if UI sends menuId, backend wants menu
  const mid = x.menu ?? x.menuId;
  if (mid != null && mid !== "") x.menu = String(mid);
  delete x.menuId;

  return x;
};

const mapRepasPayload = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = mapRestaurant(obj, { allowFallback: true });

  const mid = x.menu ?? x.menuId;
  if (mid != null && mid !== "") x.menu = String(mid);
  delete x.menuId;

  const cid = x.categorie ?? x.categoryId ?? x.categorieId ?? x.category;
  if (cid != null && cid !== "") x.categorie = String(cid);
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

export const getMenuCategoriesForRestaurant = async (restaurentId, menuId) =>
  unwrap(
    await client.get(
      `/categorie/menu/${ensureId("restaurentId", restaurentId)}/${ensureId("menuId", menuId)}`
    )
  );

// Alias conservé (ton hook l'utilise)
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

// Restaurant aliases (UI "meal")
export const getMealsByCategoryForRestaurant = getRepasByCategoryForRestaurant;
export const createMealForRestaurant = createRepasForRestaurant;
export const updateMealForRestaurant = updateRepasForRestaurant;
export const deleteMealForRestaurant = deleteRepasForRestaurant;

// =======================================================
// ======================= MENUS (ADMIN) ==================
//   POST   /admin/menu
//   GET    /admin/menu
//   GET    /admin/menu/:id
//   PUT    /admin/menu/:id
//   DELETE /admin/menu/:id
// =======================================================

export const getMenusForAdmin = async () => unwrap(await client.get(`/admin/menu`));

export const createMenuForAdmin = async (payload) =>
  unwrap(await client.post(`/admin/menu`, mapMenuPayload(payload)));

export const getMenuByIdForAdmin = async (id) =>
  unwrap(await client.get(`/admin/menu/${ensureId("menuId", id)}`));

export const updateMenuForAdmin = async (id, payload) =>
  unwrap(await client.put(`/admin/menu/${ensureId("menuId", id)}`, mapMenuPayload(payload)));

export const deleteMenuForAdmin = async (id) =>
  unwrap(await client.delete(`/admin/menu/${ensureId("menuId", id)}`));

// =======================================================
// ===================== CATEGORIES (ADMIN) ===============
//   GET    /admin/categorie
//   POST   /admin/categorie
//   GET    /admin/categorie/menu/:menuId
//   PUT    /admin/categorie/:id
//   DELETE /admin/categorie/:id
// =======================================================

// ✅ optional filter: getCategoriesForAdmin(restaurentId)
export const getCategoriesForAdmin = async (restaurentId = null) => {
  const rid = restaurentId ? String(restaurentId) : null;

  // si backend supporte le filtrage
  if (rid) {
    try {
      return unwrap(
        await client.get(`/admin/categorie`, {
          params: { restaurent: rid, restaurentId: rid, restaurantId: rid },
        })
      );
    } catch (e) {
      // fallback to no params if backend doesn't accept params
      if (e?.response?.status === 400 || e?.response?.status === 404) {
        return unwrap(await client.get(`/admin/categorie`));
      }
      throw e;
    }
  }

  return unwrap(await client.get(`/admin/categorie`));
};

export const createCategoryForAdmin = async (payload) => {
  // ✅ backend requires `restaurent`, mapping ensures it + fallback localStorage
  const body = mapCategoryPayload(payload);
  const rid = body?.restaurent ?? getRidFallback(payload);
  if (rid) body.restaurent = String(rid);
  return unwrap(await client.post(`/admin/categorie`, body));
};

export const getMenuCategoriesForAdmin = async (menuId) =>
  unwrap(await client.get(`/admin/categorie/menu/${ensureId("menuId", menuId)}`));

export const updateCategoryForAdmin = async (id, payload) => {
  const cid = ensureId("categoryId", id);
  const body = mapCategoryPayload(payload);
  const rid = body?.restaurent ?? getRidFallback(payload);
  if (rid) body.restaurent = String(rid);

  // ✅ FIX route
  return unwrap(await client.put(`/admin/categorie/${cid}`, body));
};

export const deleteCategoryForAdmin = async (id) => {
  const cid = ensureId("categoryId", id);
  // ✅ FIX route
  return unwrap(await client.delete(`/admin/categorie/${cid}`));
};

// =======================================================
// ========================= REPAS (ADMIN) ================
//   POST   /admin/repas
//   GET    /admin/repas
//   GET    /admin/repas/categorie/:categorieId
//   PUT    /admin/repas/:id
//   DELETE /admin/repas/:id
// =======================================================

export const getRepasForAdmin = async () => unwrap(await client.get(`/admin/repas`));

export const createRepasForAdmin = async (payload) => {
  const body = mapRepasPayload(payload);
  const rid = body?.restaurent ?? getRidFallback(payload);
  if (rid) body.restaurent = String(rid);
  return unwrap(await client.post(`/admin/repas`, body));
};

export const getRepasByCategoryForAdmin = async (categorieId) =>
  unwrap(await client.get(`/admin/repas/categorie/${ensureId("categorieId", categorieId)}`));

export const updateRepasForAdmin = async (id, payload) => {
  const body = mapRepasPayload(payload);
  const rid = body?.restaurent ?? getRidFallback(payload);
  if (rid) body.restaurent = String(rid);

  return unwrap(await client.put(`/admin/repas/${ensureId("repasId", id)}`, body));
};

export const deleteRepasForAdmin = async (id) =>
  unwrap(await client.delete(`/admin/repas/${ensureId("repasId", id)}`));

// Admin aliases (UI "meal")
export const getMealsByCategoryForAdmin = getRepasByCategoryForAdmin;
export const createMealForAdmin = createRepasForAdmin;
export const updateMealForAdmin = updateRepasForAdmin;
export const deleteMealForAdmin = deleteRepasForAdmin;

// --------------------------------------------------------
// Compat (signatures proches de ton ancien code - RESTO)
// --------------------------------------------------------

export const getMenus = async (params = {}) => {
  const p = mapRestaurant(params, { allowFallback: true });
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
  // menus resto
  getMenusForRestaurant,
  createMenuForRestaurant,
  getMenuByIdForRestaurant,
  updateMenuForRestaurant,
  deleteMenuForRestaurant,

  // categories resto
  getCategoriesForRestaurant,
  createCategoryForRestaurant,
  updateCategoryForRestaurant,
  deleteCategoryForRestaurant,
  getMenuCategoriesForRestaurant,
  getMenuCategoriesWithMeals,

  // repas resto
  getRepasByCategoryForRestaurant,
  createRepasForRestaurant,
  updateRepasForRestaurant,
  deleteRepasForRestaurant,

  // meal aliases resto
  getMealsByCategoryForRestaurant,
  createMealForRestaurant,
  updateMealForRestaurant,
  deleteMealForRestaurant,

  // menus admin
  getMenusForAdmin,
  createMenuForAdmin,
  getMenuByIdForAdmin,
  updateMenuForAdmin,
  deleteMenuForAdmin,

  // categories admin
  getCategoriesForAdmin,
  createCategoryForAdmin,
  updateCategoryForAdmin,
  deleteCategoryForAdmin,
  getMenuCategoriesForAdmin,

  // repas admin
  getRepasForAdmin,
  createRepasForAdmin,
  updateRepasForAdmin,
  deleteRepasForAdmin,
  getRepasByCategoryForAdmin,

  // meal aliases admin
  getMealsByCategoryForAdmin,
  createMealForAdmin,
  updateMealForAdmin,
  deleteMealForAdmin,

  // compat resto
  getMenus,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
};