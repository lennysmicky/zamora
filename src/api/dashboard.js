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

// Ton client a déjà baseURL = .../api/  => ici PAS de "/api" au début
const restoBase = (id) => `/commande/${encodeURIComponent(id)}`;
const adminBase = () => `/commande/admin`;

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
    averageOrderValue: num(
      pick(s, ["averageOrderValue", "avgOrderValue", "panierMoyen", "averageBasket"])
    ),
    growthBasket: num(pick(s, ["growthBasket", "basketGrowth"])),
    totalCustomers: num(pick(s, ["totalCustomers", "customers", "clients"])),
    growthCustomers: num(pick(s, ["growthCustomers", "customersGrowth"])),
  };
};

// Admin n’a pas de route /status => on dérive depuis listcommande/recent_order
const statusFromOrders = (orders = []) => {
  const m = new Map();
  for (const o of orders) {
    const s = o?.status ?? o?.etat ?? o?.state ?? "unknown";
    m.set(s, (m.get(s) ?? 0) + 1);
  }
  return Array.from(m.entries()).map(([label, value]) => ({ label, value }));
};

const normalizeDashboard = (maybeDashboard, parts) => {
  const d = unwrap(maybeDashboard);

  // Si le backend renvoie déjà {kpis, charts, ...}
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

  // Sinon on construit depuis les endpoints
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

// helper: tolerant fetch + timeout dashboard
const DASH_TIMEOUT = 30000;
const safeGet = async (url, params) => {
  const r = await client.get(url, { params, timeout: DASH_TIMEOUT });
  return r.data;
};

// ---------------- API ----------------
const dashboardAPI = {
  /**
   * ADMIN:
   * - si restaurantId fourni => dashboard du resto (routes /commande/:id/*)
   * - sinon => dashboard global (routes /commande/admin/*)
   */
  getAdminDashboard: async (args = {}) => {
    const src = args.filters ?? args;

    const params = clean({
      ...stripIds(src),
      from: src.from ?? src.startDate,
      to: src.to ?? src.endDate,
      period: src.period,
    });

    const restuarentId = pickId(args); // optionnel en admin

    // ===== Admin par restaurant (si un resto est sélectionné) =====
    if (restuarentId) {
      const results = await Promise.allSettled([
        safeGet(`${restoBase(restuarentId)}/stats`, params),
        safeGet(`${restoBase(restuarentId)}/revenus`, params),
        safeGet(`${restoBase(restuarentId)}/status`, params),
        safeGet(`${restoBase(restuarentId)}/meilleurs_ventes`, params),
        safeGet(`${restoBase(restuarentId)}/commandes_recente`, params),
      ]);

      const [stats, revenus, status, topSellingItems, recentOrders] = results.map((x) =>
        x.status === "fulfilled" ? x.value : null
      );

      return normalizeDashboard(null, { stats, revenus, status, topSellingItems, recentOrders });
    }

    // ===== Admin global =====
    const results = await Promise.allSettled([
      safeGet(`${adminBase()}/statorder`, params),
      safeGet(`${adminBase()}/revenuchart`, params),
      safeGet(`${adminBase()}/recent_order`, params),
      safeGet(`${adminBase()}/top_sell`, params),
      safeGet(`${adminBase()}/listcommande`, params),
    ]);

    const [stats, revenus, recentOrders, topSellingItems, ordersList] = results.map((x) =>
      x.status === "fulfilled" ? x.value : null
    );

    const ordersForStatus = arr(ordersList).length ? arr(ordersList) : arr(recentOrders);

    return {
      kpis: mapStatsToKpis(stats),
      charts: {
        revenue: normalizeRevenus(revenus),
        ordersStatus: statusFromOrders(ordersForStatus),
      },
      topSellingItems: arr(topSellingItems),
      recentOrders: arr(recentOrders).length ? arr(recentOrders) : arr(ordersList),
      topRestaurants: [],
      hourlyOrders: [],
    };
  },

  getRestaurantDashboard: (args = {}) => dashboardAPI.getAdminDashboard(args),

  // ----- unitaires resto (inchangé) -----
  getStats: (restuarentId, params = {}) =>
    client.get(`${restoBase(restuarentId)}/stats`, { params: clean(params) }).then((r) => r.data),

  getRevenus: (restuarentId, params = {}) =>
    client.get(`${restoBase(restuarentId)}/revenus`, { params: clean(params) }).then((r) => r.data),

  getStatus: (restuarentId, params = {}) =>
    client.get(`${restoBase(restuarentId)}/status`, { params: clean(params) }).then((r) => r.data),

  getTopSellingItems: (restuarentId, params = {}) =>
    client.get(`${restoBase(restuarentId)}/meilleurs_ventes`, { params: clean(params) }).then((r) => r.data),

  getRecentOrders: (restuarentId, params = {}) =>
    client.get(`${restoBase(restuarentId)}/commandes_recente`, { params: clean(params) }).then((r) => r.data),

  // ----- stubs pour éviter crash si appelés par le hook -----
  getTopRestaurants: async () => [],
  getHourlyOrders: async () => [],
};

export default dashboardAPI;
