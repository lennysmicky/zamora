// src/api/restaurants.js
import client from "./client";

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const isNotFound = (err) => {
  const s = err?.response?.status;
  const msg = String(err?.response?.data?.message ?? err?.message ?? "");
  return s === 404 || /not found/i.test(msg);
};

const ensureId = (name, v) => {
  if (v == null || v === "") throw new Error(`[restaurantsAPI] Missing ${name}`);
  return String(v);
};

// Normalisation pour <select>
export const normRestaurant = (r = {}) => {
  const id = r?.id ?? r?._id ?? null;
  return {
    ...r,
    id,
    name: r?.name ?? r?.nom ?? r?.title ?? r?.restaurantName ?? "",
  };
};

export const restaurantsAPI = {
  // ========== Public/Admin (selon droits token) ==========
  getAll: async (params = {}) => unwrap(await client.get("/restaurent", { params })),
  getById: async (id) => unwrap(await client.get(`/restaurent/${ensureId("id", id)}`)),
  create: async (data) => unwrap(await client.post("/restaurent", data)),
  update: async (id, data) => unwrap(await client.put(`/restaurent/${ensureId("id", id)}`, data)),
  delete: async (id) => unwrap(await client.delete(`/restaurent/${ensureId("id", id)}`)),

  toggleStatus: async (id, status) =>
    unwrap(await client.patch(`/restaurent/${ensureId("id", id)}/status`, { status })),

  uploadLogo: async (id, formData) =>
    unwrap(
      await client.post(`/restaurent/${ensureId("id", id)}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  // ========== ADMIN SAFE ==========
  // Certains backends exposent /admin/restaurent, d'autres non.
  // On essaie /admin/restaurent puis fallback /restaurent.
  getAllAdmin: async (params = {}) => {
    try {
      return unwrap(await client.get("/admin/restaurent", { params }));
    } catch (e) {
      if (!isNotFound(e)) throw e;
      return unwrap(await client.get("/restaurent", { params }));
    }
  },

  // Prêt pour remplir un select
  listForSelect: async () => {
    const payload = await restaurantsAPI.getAllAdmin();
    const list =
      Array.isArray(payload?.restaurants) ? payload.restaurants :
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload) ? payload :
      [];
    return list.map(normRestaurant);
  },
  getRestaurants: async () => restaurantsAPI.listForSelect(),
};

export default restaurantsAPI;