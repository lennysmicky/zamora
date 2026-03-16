// src/api/dashboard.js
import client from "./client";

// ---------------- config ----------------
const DASH_TIMEOUT = 10000;

// ---------------- utils ----------------
const clean = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

/**
 * unwrap() robuste:
 * - supporte data/result/payload/response (plusieurs couches)
 * - ne casse pas si backend renvoie directement un array
 */
const unwrap = (x) => {
  let v = x;
  for (let i = 0; i < 4; i++) {
    if (v == null) break;
    if (Array.isArray(v)) break;
    if (typeof v !== "object") break;
    v = v.data ?? v.result ?? v.payload ?? v.response ?? v;
  }
  return v;
};

/**
 * arr() robuste:
 * supporte: [] | {items:[]} | {data:[]} | {result:[]} | {payload:[]} | {topSellingItems:[]}
 * + variantes backend fréquentes
 */
const arr = (v) => {
  const x = unwrap(v);
  if (Array.isArray(x)) return x;

  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.result)) return x.result;
  if (Array.isArray(x?.payload)) return x.payload;

  if (Array.isArray(x?.commandes)) return x.commandes;
  if (Array.isArray(x?.orders)) return x.orders;

  if (Array.isArray(x?.topSellingItems)) return x.topSellingItems;
  if (Array.isArray(x?.top_sell)) return x.top_sell;
  if (Array.isArray(x?.topSell)) return x.topSell;

  // resto variants
  if (Array.isArray(x?.meilleurs_ventes)) return x.meilleurs_ventes;

  return [];
};

const num = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const pick = (obj, keys) => {
  const o = unwrap(obj);
  if (!o || typeof o !== "object") return undefined;
  for (const k of keys) if (o[k] != null) return o[k];
  return undefined;
};

//  IMPORTANT: ne JAMAIS fallback sur src.id (souvent user.id)
const resolveRestaurantId = (src = {}) => {
  const s = src ?? {};

  // selector admin peut être {id,_id,name} ou string
  const adminSelected =
    typeof s.restaurant === "object" && s.restaurant
      ? s.restaurant.id ?? s.restaurant._id ?? null
      : typeof s.restaurant === "string"
        ? s.restaurant
        : null;

  return (
    s.restaurantId ??
    s.restaurant_id ??
    s.restaurentId ??
    s.restaurent_id ??
    s.restuarentId ??
    s.restuarent_id ??
    s.idRestaurant ??
    s.id_restaurant ??
    adminSelected ??
    s.restaurant?._id ??
    s.restaurant?.id ??
    null
  );
};

// ---------------- normalizers ----------------
const normalizeRevenus = (raw) => {
  const list = arr(raw);
  return list
    .map((x) => ({
      date: x?.date ?? x?.day ?? x?.jour ?? x?.x ?? x?.label ?? "",
      value: num(
        x?.value ??
        x?.total ??
        x?.amount ??
        x?.revenue ??
        x?.totalRevenue ??
        x?.revenu ??
        x?.revenuTotal ??
        x?.montant_total ??
        x?.chiffreAffaire ??
        x?.y
      ),
    }))
    .filter((p) => p.date !== "");
};

const normalizeStatus = (raw) => {
  const v = unwrap(raw);

  if (Array.isArray(v)) {
    return v.map((x) => ({
      label: x?.label ?? x?.status ?? x?.name ?? "unknown",
      value: num(x?.value ?? x?.count ?? x?.total),
    }));
  }

  if (v && typeof v === "object") {
    return Object.entries(v).map(([label, value]) => ({
      label,
      value: num(value),
    }));
  }

  return [];
};

const mapStatsToKpis = (raw) => {
  const s = unwrap(raw) ?? {};
  return {
    totalOrders: num(
      pick(s, ["totalOrders", "totalCommandes", "ordersTotal", "orders", "total"])
    ),
    growthOrders: num(pick(s, ["growthOrders", "ordersGrowth"])),

    totalRevenue: num(
      pick(s, [
        "totalRevenue",
        "totalRevenu",
        "revenue",
        "revenu",
        "chiffreAffaire",
        "chiffre_affaire",
        "montant_total",
      ])
    ),

    growthRevenue: num(
      pick(s, ["growthRevenue", "revenueGrowth", "croissanceRevenu"])
    ),

    averageOrderValue: num(
      pick(s, [
        "averageOrderValue",
        "avgOrderValue",
        "panierMoyen",
        "averageBasket",
      ])
    ),

    growthBasket: num(pick(s, ["growthBasket", "basketGrowth"])),

    totalCustomers: num(
      pick(s, ["totalCustomers", "customers", "clients", "totalClients"])
    ),

    growthCustomers: num(
      pick(s, ["growthCustomers", "customersGrowth", "croissanceClients"])
    ),
  };
};

const extractStatusPayload = (raw) => {
  const v = unwrap(raw);
  return v?.status ?? v?.ordersStatus ?? v?.byStatus ?? v?.breakdown ?? v ?? null;
};

// ---------------- http helpers ----------------
const toAxiosErrorMessage = (err) => {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    "Request failed";
  return status ? `${status} - ${msg}` : msg;
};

const safeGet = async (url, params, signal) => {
  const res = await client.get(url, { params, timeout: DASH_TIMEOUT, signal });
  return res?.data;
};

const assertNotAllRejected = (results) => {
  if (results.every((r) => r.status === "rejected")) {
    const first = results.find((r) => r.status === "rejected")?.reason;
    throw new Error(toAxiosErrorMessage(first));
  }
};

const readSettled = (r, label) => {
  if (r.status === "fulfilled") return r.value;
  console.warn(`[dashboard] ${label} failed:`, toAxiosErrorMessage(r.reason));
  return null;
};

// ---------------- bases ----------------
const ADMIN_BASE = "/admin/dashboard";

// RESTAURANT: backend actuel en mix
// - stats déplacé sur /order/:id/stats
// - le reste répond encore sur /commande/:id/*
const restoCommandeBase = (id) => `/commande/${encodeURIComponent(id)}`;
const restoOrderBase = (id) => `/order/${encodeURIComponent(id)}`;

const buildAdminParams = (src, restaurantId) =>
  clean({
    restaurantId: restaurantId || undefined,
    restaurentId: restaurantId || undefined,
    restaurant_id: restaurantId || undefined,
    id_restaurant: restaurantId || undefined,
    idRestaurant: restaurantId || undefined,

    from: src.from ?? src.startDate,
    to: src.to ?? src.endDate,
    period: src.period,
  });

const buildRestaurantParams = (src) =>
  clean({
    from: src.from ?? src.startDate,
    to: src.to ?? src.endDate,
    period: src.period,
  });

// ---------------- API ----------------
const dashboardAPI = {
  // ADMIN: global (sans restaurantId) OU filtré (avec restaurantId)
  getAdminDashboard: async (args = {}) => {
    const src = args.filters ?? args;
    const restaurantId = resolveRestaurantId(src);
    const params = buildAdminParams(src, restaurantId);

    const results = await Promise.allSettled([
      safeGet(`${ADMIN_BASE}/statorder`, params, args.signal),
      safeGet(`${ADMIN_BASE}/revenuchart`, params, args.signal),
      safeGet(`${ADMIN_BASE}/recent_order`, params, args.signal),
      safeGet(`${ADMIN_BASE}/top_sell`, params, args.signal),
    ]);

    assertNotAllRejected(results);

    const statorder = unwrap(readSettled(results[0], "admin/statorder"));
    const revenus = readSettled(results[1], "admin/revenuchart");
    const recentOrders = readSettled(results[2], "admin/recent_order");
    const topSell = readSettled(results[3], "admin/top_sell");

    const statusPayload = extractStatusPayload(statorder);

    return {
      kpis: mapStatsToKpis(statorder),
      charts: {
        revenue: normalizeRevenus(revenus),
        ordersStatus: statusPayload ? normalizeStatus(statusPayload) : [],
      },
      topSellingItems: arr(topSell),
      recentOrders: arr(recentOrders),
      topRestaurants: [],
      hourlyOrders: [],
    };
  },

  // RESTAURANT: routes existantes (stats sur /order, reste sur /commande)
  getRestaurantDashboard: async (args = {}) => {
    const src = args.filters ?? args;

    const restaurantId = args.restaurantId ?? args.restaurentId ?? resolveRestaurantId(src);

    if (!restaurantId) {
      return {
        kpis: mapStatsToKpis({}),
        charts: { revenue: [], ordersStatus: [] },
        topSellingItems: [],
        recentOrders: [],
        topRestaurants: [],
        hourlyOrders: [],
      };
    }

    const params = buildRestaurantParams(src);

    const results = await Promise.allSettled([
      safeGet(`${restoOrderBase(restaurantId)}/stats`, params, args.signal), // FIX: /order/:id/stats
      safeGet(`${restoCommandeBase(restaurantId)}/revenus`, params, args.signal),
      safeGet(`${restoCommandeBase(restaurantId)}/status`, params, args.signal),
      safeGet(`${restoCommandeBase(restaurantId)}/meilleurs_ventes`, params, args.signal),
      safeGet(`${restoCommandeBase(restaurantId)}/commandes_recente`, params, args.signal),
    ]);

    assertNotAllRejected(results);

    const stats = unwrap(readSettled(results[0], "resto/stats"));
    const revenus = readSettled(results[1], "resto/revenus");
    const status = readSettled(results[2], "resto/status");
    const topSell = readSettled(results[3], "resto/meilleurs_ventes");
    const recentOrders = readSettled(results[4], "resto/commandes_recente");

    return {
      kpis: mapStatsToKpis(stats),
      charts: {
        revenue: normalizeRevenus(revenus),
        ordersStatus: normalizeStatus(status),
      },
      topSellingItems: arr(topSell),
      recentOrders: arr(recentOrders),
      topRestaurants: [],
      hourlyOrders: [],
    };
  },

  getTopRestaurants: async () => [],
  getHourlyOrders: async () => [],
};

export default dashboardAPI;