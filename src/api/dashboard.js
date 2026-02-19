// src/api/dashboard.js
import client from "./client";

// utils existants: clean, unwrap, num, arr, pick, etc.

const clean = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

const unwrap = (x) => {
  let v = x;
  for (let i = 0; i < 3; i++) {
    if (!v || typeof v !== "object") break;
    v = v.data ?? v.result ?? v.payload ?? v.response ?? v;
  }
  return v;
};

const arr = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);
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

// ===== Normalizers (tu gardes tes versions si déjà présentes) =====
const normalizeRevenus = (raw) => {
  const v = unwrap(raw);
  return arr(v)
    .map((x) => ({
      date: x?.date ?? x?.day ?? x?.jour ?? x?.x ?? x?.label ?? "",
      value: num(x?.value ?? x?.total ?? x?.amount ?? x?.revenue ?? x?.y),
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
    return Object.entries(v).map(([label, value]) => ({ label, value: num(value) }));
  }
  return [];
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

const extractStatusPayload = (raw) => {
  const v = unwrap(raw);
  return v?.status ?? v?.ordersStatus ?? v?.byStatus ?? v?.breakdown ?? null;
};

const DASH_TIMEOUT = 30000;
const safeGet = async (url, params) => (await client.get(url, { params, timeout: DASH_TIMEOUT })).data;

// ===== Bases =====
const ADMIN_BASE = "/admin/dashboard";
// Si tes routes resto existent déjà ailleurs, garde-les ici (ex: /commande/:id/...)
const restoBase = (id) => `/commande/${encodeURIComponent(id)}`;

// ===== API =====
const dashboardAPI = {
  // ADMIN: global (sans restaurantId) OU filtré (avec restaurantId en query)
  getAdminDashboard: async (args = {}) => {
    const src = args.filters ?? args;

    const params = clean({
      restaurantId: src.restaurantId ?? src.idRestaurant ?? src.restuarentId ?? src.restaurentId ?? undefined,
      from: src.from ?? src.startDate,
      to: src.to ?? src.endDate,
      period: src.period,
    });

    const results = await Promise.allSettled([
      safeGet(`${ADMIN_BASE}/statorder`, params),
      safeGet(`${ADMIN_BASE}/revenuchart`, params),
      safeGet(`${ADMIN_BASE}/recent_order`, params),
      safeGet(`${ADMIN_BASE}/top_sell`, params),
    ]);

    const [statorder, revenus, recentOrders, topSellingItems] = results.map((x) =>
      x.status === "fulfilled" ? x.value : null
    );

    const statusPayload = extractStatusPayload(statorder);

    return {
      kpis: mapStatsToKpis(statorder),
      charts: {
        revenue: normalizeRevenus(revenus),
        ordersStatus: statusPayload ? normalizeStatus(statusPayload) : [],
      },
      topSellingItems: arr(topSellingItems),
      recentOrders: arr(recentOrders),
      topRestaurants: [],
      hourlyOrders: [],
    };
  },

  // RESTAURANT: garde tes routes resto existantes (si c’est déjà en prod)
  getRestaurantDashboard: async (args = {}) => {
    const src = args.filters ?? args;
    const restaurantId =
      src.restaurantId ?? src.restuarentId ?? src.restaurentId ?? src.id;

    if (!restaurantId) return null;

    const params = clean({
      from: src.from ?? src.startDate,
      to: src.to ?? src.endDate,
      period: src.period,
    });

    const results = await Promise.allSettled([
      safeGet(`${restoBase(restaurantId)}/stats`, params),
      safeGet(`${restoBase(restaurantId)}/revenus`, params),
      safeGet(`${restoBase(restaurantId)}/status`, params),
      safeGet(`${restoBase(restaurantId)}/meilleurs_ventes`, params),
      safeGet(`${restoBase(restaurantId)}/commandes_recente`, params),
    ]);

    const [stats, revenus, status, topSellingItems, recentOrders] = results.map((x) =>
      x.status === "fulfilled" ? x.value : null
    );

    return {
      kpis: mapStatsToKpis(stats),
      charts: { revenue: normalizeRevenus(revenus), ordersStatus: normalizeStatus(status) },
      topSellingItems: arr(topSellingItems),
      recentOrders: arr(recentOrders),
      topRestaurants: [],
      hourlyOrders: [],
    };
  },

  // stubs
  getTopRestaurants: async () => [],
  getHourlyOrders: async () => [],
};

export default dashboardAPI;
