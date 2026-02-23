// src/api/menus.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// ============ CATEGORIES ============
export const getCategories = async (params = {}) =>
  unwrap(await client.get("/categorie", { params }));

export const createCategory = async (payload) =>
  unwrap(await client.post("/categorie", payload));

export const updateCategory = async (id, payload) =>
  unwrap(await client.put(`/categorie/${id}`, payload));

export const deleteCategory = async (id) =>
  unwrap(await client.delete(`/categorie/${id}`));

// Catégories + repas d’un menu
export const getMenuCategoriesWithMeals = async (menuId) =>
  unwrap(await client.get(`/categorie/menu/${menuId}/repas`));

// ============ MEALS (REPAS) ============
export const getMealsByCategory = async (categorieId) =>
  unwrap(await client.get(`/repas/categorie/${categorieId}/repas`));

export const createMeal = async (payload) =>
  unwrap(await client.post("/repas", payload));

export const updateMeal = async (id, payload) =>
  unwrap(await client.put(`/repas/${id}`, payload));

export const deleteMeal = async (id) =>
  unwrap(await client.delete(`/repas/${id}`));

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuCategoriesWithMeals,
  getMealsByCategory,
  createMeal,
  updateMeal,
  deleteMeal,
};