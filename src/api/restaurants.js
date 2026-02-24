// src/api/restaurants.js
import client from "./client";

const ensureId = (id) => {
  if (id == null || id === "") throw new Error("[restaurantsAPI] Missing id");
  return String(id);
};

const statusOf = (e) => e?.response?.status;
const msgOf = (e) => String(e?.response?.data?.message ?? e?.message ?? "");

const isFallbackable = (e) => {
  const s = statusOf(e);
  const m = msgOf(e);
  // si /admin/* renvoie 401/403, on tente /restaurent (souvent autorisé)
  return (
    s === 404 ||
    s === 405 ||
    s === 401 ||
    s === 403 ||
    /not found|cannot|unauthorized|forbidden/i.test(m)
  );
};

const BASES = [
  "/admin/register",
  "/restaurent",

];

let cachedBase = null;

const withBase = async (callPerBase) => {
  const bases = cachedBase
    ? [cachedBase, ...BASES.filter((b) => b !== cachedBase)]
    : BASES;

  let lastErr = null;
  for (const base of bases) {
    try {
      const res = await callPerBase(base);
      cachedBase = base;
      return res; // IMPORTANT: on retourne AxiosResponse (comme avant)
    } catch (e) {
      lastErr = e;
      if (!isFallbackable(e)) throw e; // 500 etc.
    }
  }
  throw lastErr;
};

export const restaurantsAPI = {
  getAll: (params = {}) => withBase((base) => client.get(base, { params })),
  getById: (id) => withBase((base) => client.get(`${base}/${ensureId(id)}`)),
  create: (data) => withBase((base) => client.post(base, data)),
  update: (id, data) => withBase((base) => client.put(`${base}/${ensureId(id)}`, data)),
  delete: (id) => withBase((base) => client.delete(`${base}/${ensureId(id)}`)),
  toggleStatus: (id, status) =>
    withBase((base) => client.patch(`${base}/${ensureId(id)}/status`, { status })),
  uploadLogo: (id, formData) =>
    withBase((base) =>
      client.post(`${base}/${ensureId(id)}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
};

export default restaurantsAPI;