// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[menusAPI] Missing ${name}`);
  return v;
};

// ---- mapping (menus module only) ----
const mapRestaurant = (obj = {}) => {
  if (!obj || typeof obj !== "object") return obj;
  const x = { ...obj };

  // backend uses "restaurent" (typo), normalize here
  const rid = x.restaurent ?? x.restaurantId ?? x.restaurentId ?? x.restaurant;
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

// ================= MENUS (ADMIN / GLOBAL) =================
export const getMenus = async (params = {}) =>
  unwrap(await client.get("/menu", { params: mapRestaurant(params) }));

export const createMenu = async (payload) =>
  unwrap(await client.post("/menu", mapMenuPayload(payload)));

export const updateMenu = async (id, payload) =>
  unwrap(await client.put(`/menu/${ensureId("menuId", id)}`, mapMenuPayload(payload)));

export const deleteMenu = async (id) =>
  unwrap(await client.delete(`/menu/${ensureId("menuId", id)}`));

// ================= CATEGORIES (ADMIN / GLOBAL) =================
export const getCategories = async (params = {}) =>
  unwrap(await client.get("/categorie", { params: mapRestaurant(params) }));

export const createCategory = async (payload) =>
  unwrap(await client.post("/categorie", mapCategoryPayload(payload)));

export const updateCategory = async (id, payload) =>
  unwrap(await client.put(`/categorie/${ensureId("categoryId", id)}`, mapCategoryPayload(payload)));

export const deleteCategory = async (id) =>
  unwrap(await client.delete(`/categorie/${ensureId("categoryId", id)}`));

export const getMenuCategoriesWithMeals = async (menuId) =>
  unwrap(await client.get(`/categorie/menu/${ensureId("menuId", menuId)}/repas`));

// ================= REPAS (ADMIN / GLOBAL) =================
// ⚠️ Conservé tel quel pour ne pas casser l’admin (même si ton backend restaurant a d’autres routes)
export const getRepasByCategory = async (categorieId) =>
  unwrap(await client.get(`/repas/categorie/${ensureId("categorieId", categorieId)}/repas`));

export const createRepas = async (payload) =>
  unwrap(await client.post("/repas", mapRepasPayload(payload)));

export const updateRepas = async (id, payload) =>
  unwrap(await client.put(`/repas/${ensureId("repasId", id)}`, mapRepasPayload(payload)));

export const deleteRepas = async (id) =>
  unwrap(await client.delete(`/repas/${ensureId("repasId", id)}`));

// ---- Aliases “Meal” côté front (admin) ----
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
      `/repas/categorie/${ensureId("restaurentId", restaurentId)}/${ensureId(
        "categorieId",
        categorieId
      )}`
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

// ---- Aliases “Meal” côté front (restaurant) ----
export const getMealsByCategoryForRestaurant = getRepasByCategoryForRestaurant;
export const createMealForRestaurant = createRepasForRestaurant;
export const updateMealForRestaurant = updateRepasForRestaurant;
export const deleteMealForRestaurant = deleteRepasForRestaurant;

export default {
  // admin menus
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,

  // admin categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuCategoriesWithMeals,

  // admin repas
  getRepasByCategory,
  createRepas,
  updateRepas,
  deleteRepas,

  // admin aliases
  getMealsByCategory,
  createMeal,
  updateMeal,
  deleteMeal,

  // restaurant scoped
  getRepasByCategoryForRestaurant,
  createRepasForRestaurant,
  updateRepasForRestaurant,
  deleteRepasForRestaurant,

  createCategoryForRestaurant,
  updateCategoryForRestaurant,
  deleteCategoryForRestaurant,

  // restaurant aliases
  getMealsByCategoryForRestaurant,
  createMealForRestaurant,
  updateMealForRestaurant,
  deleteMealForRestaurant,
};