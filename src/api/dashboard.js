// src/api/dashboard.js
import client from "./client";

// ---------------- Utils ----------------
const clean = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

const pickId = (args = {}) =>
  args.restuarentId ?? args.restaurentId ?? args.restaurantId ?? args.id;

const stripIds = (args = {}) => {
  const { restuarentId, restaurentId, restaurantId, id, ...rest } = args;
  return rest;
};

// ✅ ton baseURL = .../api/ donc ici PAS de /api
const base = (restuarentId) => `/commande/${encodeURIComponent(restuarentId)}`;

const unwrap = (x) => {
  let v = x;
  for (let i = 0; i < 3; i++) {
    if (!v || typeof v !== "object") break;
    v = v.data ?? v.result ?? v.payload ?? v.response ?? v;
  }
  return v;
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
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) if (obj[k] != null) return obj[k];
  return undefined;
};

const arr = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);

// ---------------- Normalizers ----------------
const normalizeStatus = (raw) => {
  const v = unwrap(raw);
  if (Array.isArray(v)) {
    return v.map((x) => ({
      label: x?.label ?? x?.status ?? x?.name ?? "unknown",
      value: num(x?.value ?? x?.count ?? x?.total),
    }));
  }
  if (v && typeof v === "object") {
    return Object.entries(v).map(([label, value]) => ({ label, value: num(value) }));
  }
  return [];
};

const normalizeRevenus = (raw) => {
  const v = unwrap(raw);
  const a = arr(v);
  return a
    .map((x) => ({
      date: x?.date ?? x?.day ?? x?.jour ?? x?.x ?? x?.label ?? "",
      value: num(x?.value ?? x?.total ?? x?.amount ?? x?.revenue ?? x?.y),
    }))
    .filter((p) => p.date !== "");
};

const mapStatsToKpis = (raw) => {
  const s = unwrap(raw) ?? {};
  return {
    totalOrders: num(pick(s, ["totalOrders", "totalCommandes", "ordersTotal", "orders"])),
    growthOrders: num(pick(s, ["growthOrders", "ordersGrowth"])),
    totalRevenue: num(pick(s, ["totalRevenue", "totalRevenu", "revenue", "revenu"])),
    growthRevenue: num(pick(s, ["growthRevenue", "revenueGrowth"])),
    averageOrderValue: num(pick(s, ["averageOrderValue", "avgOrderValue", "panierMoyen", "averageBasket"])),
    growthBasket: num(pick(s, ["growthBasket", "basketGrowth"])),
    totalCustomers: num(pick(s, ["totalCustomers", "customers", "clients"])),
    growthCustomers: num(pick(s, ["growthCustomers", "customersGrowth"])),
  };
};

const normalizeDashboard = (maybeDashboard, parts) => {
  const d = unwrap(maybeDashboard);

  if (d?.kpis || d?.charts) {
    return {
      kpis: mapStatsToKpis(d.kpis ?? d.stats ?? {}),
      charts: {
        revenue: normalizeRevenus(d.charts?.revenue ?? d.revenus ?? []),
        ordersStatus: normalizeStatus(d.charts?.ordersStatus ?? d.status ?? []),
      },
      topSellingItems: arr(d.topSellingItems ?? d.top ?? []),
      recentOrders: arr(d.recentOrders ?? d.recent ?? []),
      topRestaurants: arr(d.topRestaurants ?? []),
      hourlyOrders: arr(d.hourlyOrders ?? []),
    };
  }

  const { stats, revenus, status, topSellingItems, recentOrders } = parts;
  return {
    kpis: mapStatsToKpis(stats),
    charts: { revenue: normalizeRevenus(revenus), ordersStatus: normalizeStatus(status) },
    topSellingItems: arr(topSellingItems),
    recentOrders: arr(recentOrders),
    topRestaurants: [],
    hourlyOrders: [],
  };
};

// ---------------- De-dupe / cache ----------------
const INFLIGHT = new Map();
const CACHE = new Map();
const TTL_MS = 8000; // suffit pour éviter les rafales React/StrictMode

const keyOf = (rid, params) => `${rid}:${JSON.stringify(params ?? {})}`;

// ---------------- API ----------------
const dashboardAPI = {
  getAdminDashboard: async (args = {}) => {
    const restuarentId = pickId(args);
    if (!restuarentId) throw new Error("restuarentId requis");

    const src = args.filters ?? args;
    const params = clean({
      ...stripIds(src),
      from: src.from ?? src.startDate,
      to: src.to ?? src.endDate,
      period: src.period,
    });

    const key = keyOf(restuarentId, params);

    const cached = CACHE.get(key);
    if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;

    const existing = INFLIGHT.get(key);
    if (existing) return existing;

    const p = (async () => {
      const settled = await Promise.allSettled([
        client.get(`${base(restuarentId)}/stats`, { params, timeout: 25000 }).then((r) => r.data),
        client.get(`${base(restuarentId)}/revenus`, { params, timeout: 25000 }).then((r) => r.data),
        client.get(`${base(restuarentId)}/status`, { params, timeout: 25000 }).then((r) => r.data),
        client.get(`${base(restuarentId)}/meilleurs_ventes`, { params, timeout: 25000 }).then((r) => r.data),
        client.get(`${base(restuarentId)}/commandes_recente`, { params, timeout: 25000 }).then((r) => r.data),
      ]);

      const [stats, revenus, status, topSellingItems, recentOrders] = settled.map((s) =>
        s.status === "fulfilled" ? s.value : null
      );

      const data = normalizeDashboard(null, { stats, revenus, status, topSellingItems, recentOrders });
      CACHE.set(key, { ts: Date.now(), data });
      return data;
    })().finally(() => INFLIGHT.delete(key));

    INFLIGHT.set(key, p);
    return p;
  },

  getRestaurantDashboard: (args = {}) => dashboardAPI.getAdminDashboard(args),

  // unitaires (inchangé)
  getStats: (restuarentId, params = {}) =>
    client.get(`${base(restuarentId)}/stats`, { params: clean(params) }).then((r) => r.data),
  getRevenus: (restuarentId, params = {}) =>
    client.get(`${base(restuarentId)}/revenus`, { params: clean(params) }).then((r) => r.data),
  getStatus: (restuarentId, params = {}) =>
    client.get(`${base(restuarentId)}/status`, { params: clean(params) }).then((r) => r.data),
  getTopSellingItems: (restuarentId, params = {}) =>
    client.get(`${base(restuarentId)}/meilleurs_ventes`, { params: clean(params) }).then((r) => r.data),
  getRecentOrders: (restuarentId, params = {}) =>
    client.get(`${base(restuarentId)}/commandes_recente`, { params: clean(params) }).then((r) => r.data),
  getTopRestaurants: async () => [],
  getHourlyOrders: async () => [],
};

export default dashboardAPI;
