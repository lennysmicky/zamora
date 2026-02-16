import client from "./client";

// ---------------- utils ----------------
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

const arr = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.commandes)) return v.commandes;
  if (Array.isArray(v?.orders)) return v.orders;
  return [];
};

const num = (v) => {
  if (v == null || v === "") return 0;
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ---------------- mapping UI <-> backend ----------------
const normalizeOrderStatus = (s) => {
  const v = String(s ?? "").toLowerCase();
  if (["en_attente", "pending"].includes(v)) return "PENDING";
  if (["livres", "livré", "delivered"].includes(v)) return "DELIVERED";
  if (["annules", "annulé", "cancelled", "canceled"].includes(v)) return "CANCELLED";
  if (["in_preparation", "en_preparation", "preparing", "préparation"].includes(v)) return "IN_PREPARATION";
  if (["out_for_delivery", "en_livraison", "delivery"].includes(v)) return "OUT_FOR_DELIVERY";
  return "PENDING";
};

const denormalizeOrderStatus = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "PENDING") return "en_attente";
  if (v === "DELIVERED") return "livres";
  if (v === "CANCELLED") return "annules";
  const low = String(s ?? "").toLowerCase();
  if (["en_attente", "livres", "annules"].includes(low)) return low;
  return undefined;
};

const normalizePaymentStatus = (s) => {
  const v = String(s ?? "").toLowerCase();
  if (["paye", "payé", "paid"].includes(v)) return "PAID";
  if (["non_paye", "non_payé", "unpaid", "failed"].includes(v)) return "FAILED";
  if (["en_traitement", "processing"].includes(v)) return "PENDING";
  if (["en_attente", "pending"].includes(v)) return "PENDING";
  if (["refunded", "rembourse", "remboursé"].includes(v)) return "REFUNDED";
  return "PENDING";
};

const denormalizePaymentStatus = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "PAID") return "paye";
  if (v === "FAILED") return "non_paye";
  if (v === "PENDING") return "en_attente";
  const low = String(s ?? "").toLowerCase();
  if (["en_attente", "en_traitement", "paye", "non_paye"].includes(low)) return low;
  return undefined;
};

const normalizePaymentMethod = (m) => {
  const v = String(m ?? "").toLowerCase();
  if (["espece", "espèce", "cash", "cash_on_delivery"].includes(v)) return "CASH_ON_DELIVERY";
  if (["tmoney", "t-money", "t_money", "orange_money", "moov_money", "wave", "mobile_money"].includes(v)) return "MOBILE_MONEY";
  if (["card", "carte", "visa", "mastercard"].includes(v)) return "CARD";
  if (["virement", "transfer", "bank_transfer"].includes(v)) return "OTHER";
  return "OTHER";
};

const denormalizePaymentMethod = (m) => {
  const v = String(m ?? "").toUpperCase();
  if (v === "CASH_ON_DELIVERY") return "espece";
  if (v === "MOBILE_MONEY") return "tmoney";
  if (v === "OTHER") return "virement";
  if (v === "CARD") return undefined; // backend actuel ne gère pas card dans ton modèle
  const low = String(m ?? "").toLowerCase();
  if (["espece", "virement", "tmoney"].includes(low)) return low;
  return undefined;
};

const normalizeSource = (s) => {
  const v = String(s ?? "").toLowerCase();
  if (["application_mobile", "mobile", "app", "android", "ios"].includes(v)) return "MOBILE";
  if (["application_web", "web", "browser"].includes(v)) return "WEB";
  return "OTHER";
};

const denormalizeSource = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "MOBILE") return "application_mobile";
  if (v === "WEB") return "application_web";
  const low = String(s ?? "").toLowerCase();
  if (["application_mobile", "application_web"].includes(low)) return low;
  return undefined;
};

// ---------------- normalize backend -> UI row compatible ----------------
const normalizeOrder = (raw) => {
  const o = raw ?? {};
  const items = Array.isArray(o.items) ? o.items : [];

  const itemsCount =
    items.length > 0
      ? items.reduce((acc, it) => acc + (Number(it?.quantite) || 0), 0) || items.length
      : 0;

  const createdAt = o.createdAt ?? o.created_at ?? null;

  // restaurent peut être string (restaurant mode) OU objet populate (admin)
  const resto = o.restaurent;
  const restaurantId = typeof resto === "object" && resto ? (resto._id ?? resto.id) : (resto ?? o.restaurantId ?? null);
  const restaurantName = typeof resto === "object" && resto ? (resto.name ?? resto.nom ?? "-") : undefined;

  return {
    id: o._id ?? o.id ?? "",
    restaurantId,

    // utilisé partout
    order_number: o.order_number ?? "",
    customer: {
      name: o.customer_name ?? "",
      phone: o.customer_phone ?? "",
    },
    total_amount: num(o.total_amount),

    status: normalizeOrderStatus(o.status),
    payment_status: normalizePaymentStatus(o.payment_status),
    payment_method: normalizePaymentMethod(o.payment_method),
    source: normalizeSource(o.source),

    created_at: createdAt,
    createdAt,

    items,
    itemsCount,
    items_count: itemsCount, // utile pour sorting/colonnes
    tableId: o.table ?? null,

    // pour admin table (si populate)
    restaurant: restaurantName ? { name: restaurantName } : undefined,

    raw: o,
  };
};

const normalizeStats = (statsRaw) => {
  const s = statsRaw ?? {};
  // supporte plusieurs formes possibles
  return {
    total: num(s.total ?? s.count),
    pending: num(s.en_attente ?? s.pending),
    delivered: num(s.livres ?? s.delivered),
    cancelled: num(s.annules ?? s.cancelled),
  };
};

// ---------------- routes ----------------
// Restaurant
const restoListUrl = (rid) => `/commande/${encodeURIComponent(rid)}`;
const restoStatsUrl = (rid) => `/commande/${encodeURIComponent(rid)}/stats`;

// Admin (selon ce que tu as reçu)
const adminListUrl = () => `/admin/commandes`;
const adminStatsUrl = () => `/admin/commandes/stats`;

const TIMEOUT = 10000;

const pickListAndStats = (a, b) => {
  const va = unwrap(a);
  const vb = unwrap(b);

  const aList = arr(va);
  const bList = arr(vb);

  // heuristique : la "liste" est celle qui contient un array non-vide OU qui est array
  const list = aList.length || Array.isArray(va) ? va : bList.length || Array.isArray(vb) ? vb : va;
  const stats = list === va ? vb : va;

  return { list: unwrap(list), stats: unwrap(stats) };
};

export const ordersApi = {
  /**
   * getOrders(params)
   * - mode: "admin" | "restaurant"
   * - restaurantId/restaurentId (requis en restaurant)
   * - admin: peut fonctionner sans rid (liste globale), et accepter filters.restaurant
   */
  getOrders: async (params = {}, options = {}) => {
    const {
      mode = "restaurant",

      restaurantId,
      restaurentId,
      restaurant, // filtre admin (id resto)

      page = 1,
      limit = 10,

      search,
      status,
      paymentStatus,
      paymentMethod,
      source,

      period,
      from,
      to,

      ...rest
    } = params;

    const query = clean({
      ...rest,
      page,
      limit,
      period,
      from,
      to,

      status: status ? denormalizeOrderStatus(status) : undefined,
      payment_status: paymentStatus ? denormalizePaymentStatus(paymentStatus) : undefined,
      payment_method: paymentMethod ? denormalizePaymentMethod(paymentMethod) : undefined,
      source: source ? denormalizeSource(source) : undefined,

      search,
      q: search,
      customer_name: search,

      // filtre resto pour admin (best-effort)
      restaurent: restaurant ?? restaurantId ?? restaurentId ?? undefined,
      restaurentId: restaurant ?? restaurantId ?? restaurentId ?? undefined,
      restaurantId: restaurant ?? restaurantId ?? restaurentId ?? undefined,
    });

    const axiosCfg = { params: query, timeout: TIMEOUT, signal: options.signal };

    // ---------- ADMIN ----------
    if (mode === "admin") {
      const [r1, r2] = await Promise.allSettled([
        client.get(adminListUrl(), axiosCfg),
        client.get(adminStatsUrl(), axiosCfg),
      ]);

      const d1 = r1.status === "fulfilled" ? r1.value?.data : null;
      const d2 = r2.status === "fulfilled" ? r2.value?.data : null;

      // fallback si backend a inversé list/stats
      const { list, stats } = pickListAndStats(d1, d2);

      const listArr = arr(list);
      const orders = listArr.map(normalizeOrder);

      const totalItems =
        num(list?.totalItems ?? list?.total ?? list?.count) || orders.length;
      const totalPages =
        num(list?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

      const normalizedStats = stats ? normalizeStats(stats) : {
        total: totalItems,
        pending: orders.filter((o) => o.status === "PENDING").length,
        delivered: orders.filter((o) => o.status === "DELIVERED").length,
        cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      };

      return { data: orders, totalPages, totalItems, stats: normalizedStats };
    }

    // ---------- RESTAURANT ----------
    const rid = restaurentId ?? restaurantId ?? restaurant ?? null;
    if (!rid) {
      return { data: [], totalPages: 1, totalItems: 0, stats: { total: 0, pending: 0, delivered: 0, cancelled: 0 } };
    }

    const [listRes, statsRes] = await Promise.allSettled([
      client.get(restoListUrl(rid), axiosCfg),
      client.get(restoStatsUrl(rid), { timeout: TIMEOUT, signal: options.signal }),
    ]);

    const listData = listRes.status === "fulfilled" ? unwrap(listRes.value?.data) : [];
    const statsData = statsRes.status === "fulfilled" ? unwrap(statsRes.value?.data) : null;

    const listArr = arr(listData);
    const orders = listArr.map(normalizeOrder);

    const totalItems =
      num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;
    const totalPages =
      num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

    const normalizedStats = statsData ? normalizeStats(statsData) : {
      total: totalItems,
      pending: orders.filter((o) => o.status === "PENDING").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };

    return { data: orders, totalPages, totalItems, stats: normalizedStats };
  },

  // endpoints à confirmer côté backend
  updateStatus: async (orderId, status) => {
    const payload = { status: denormalizeOrderStatus(status) };
    const res = await client.patch(`/commande/${encodeURIComponent(orderId)}/status`, payload, { timeout: TIMEOUT });
    return unwrap(res.data);
  },

  updatePaymentStatus: async (orderId, payment_status) => {
    const payload = { payment_status: denormalizePaymentStatus(payment_status) };
    const res = await client.patch(`/commande/${encodeURIComponent(orderId)}/payment`, payload, { timeout: TIMEOUT });
    return unwrap(res.data);
  },
};

export default ordersApi;
