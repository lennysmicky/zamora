// src/api/tables.js
import client from "./client";

const unwrap = (res) => {
  let v = res?.data;
  for (let i = 0; i < 3; i++) {
    if (!v || typeof v !== "object") break;
    v = v.data ?? v.result ?? v.tables ?? v.table ?? v;
  }
  return v;
};

const unwrapCreateTable = (res) => {
  const raw = res?.data ?? {};
  const nested = raw?.data ?? raw?.result ?? raw;

  const table = nested?.table ?? raw?.table ?? unwrap(res);
  const qrLink = nested?.qrLink ?? raw?.qrLink ?? null;
  const message = nested?.message ?? raw?.message ?? null;

  return {
    ...(table || {}),
    qrLink,
    message,
  };
};

const normalizeTablePayload = (data = {}) => {
  const d = { ...(data || {}) };

  const numero =
    d.numero_table ??
    d.numeroTable ??
    d.numero ??
    d.tableNumber ??
    d.number ??
    d.num;

  if (numero != null && numero !== "") {
    const n = Number(numero);
    d.numero_table = Number.isFinite(n) ? n : numero;
  }

  delete d.numeroTable;
  delete d.tableNumber;
  delete d.number;
  delete d.num;

  return d;
};

export const tablesApi = {
  getTables: async (restaurantId) => {
    if (!restaurantId) return [];
    const res = await client.get(`/table/${restaurantId}`);
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  getTable: async (restaurantId, id) => {
    if (!restaurantId || !id) return null;
    const res = await client.get(`/table/${restaurantId}/${id}`);
    return unwrap(res);
  },

  createTable: async (restaurantId, data) => {
    if (!restaurantId) throw new Error("[tablesApi] Missing restaurantId");

    const payload = normalizeTablePayload(data);

    if (payload.numero_table == null || payload.numero_table === "") {
      throw new Error("[tablesApi] Missing numero_table");
    }

    if (payload.status && !payload.statut) {
      payload.statut = payload.status;
    }

    const res = await client.post(`/table/${restaurantId}`, payload);
    return unwrapCreateTable(res);
  },

  updateTable: async (restaurantId, id, data) => {
    if (!restaurantId || !id) throw new Error("[tablesApi] Missing id");

    const payload = normalizeTablePayload(data);

    if (payload.status && !payload.statut) {
      payload.statut = payload.status;
    }

    const res = await client.put(`/table/${restaurantId}/${id}`, payload);
    return unwrap(res);
  },

  deleteTable: async (restaurantId, id) => {
    if (!restaurantId || !id) throw new Error("[tablesApi] Missing id");
    const res = await client.delete(`/table/${restaurantId}/${id}`);
    return unwrap(res);
  },

  getStats: async (restaurantId) => {
    const empty = { total: 0, libre: 0, occupee: 0, reservee: 0 };
    if (!restaurantId) return empty;

    try {
      const res = await client.get(`/table/stats/${restaurantId}`);
      return unwrap(res) || empty;
    } catch {
      return empty;
    }
  },

  searchTables: async (restaurantId, params = {}) => {
    if (!restaurantId) return [];
    const res = await client.get(`/table/search/${restaurantId}`, { params });
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  getMenuUrl: (restaurantId, tableId, tableNumber, backendQrLink) => {
    if (backendQrLink) return backendQrLink;

    const baseUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
    return `${baseUrl}/menu/${restaurantId}?table=${tableId}&numero=${tableNumber}`;
  },
};

export default tablesApi;