// src/api/orders.js
import client from "./client";

// ---------------- utils ----------------
const clean = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

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

const arr = (v) => {
  const x = unwrap(v);
  if (Array.isArray(x)) return x;

  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.rows)) return x.rows;
  if (Array.isArray(x?.docs)) return x.docs;
  if (Array.isArray(x?.results)) return x.results;

  if (Array.isArray(x?.commandes)) return x.commandes;
  if (Array.isArray(x?.orders)) return x.orders;

  return [];
};

const num = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pick = (o, keys) => {
  const x = unwrap(o);
  if (!x || typeof x !== "object") return undefined;
  for (const k of keys) if (x[k] != null) return x[k];
  return undefined;
};

// ---------------- mapping UI <-> backend ----------------
const normalizeOrderStatus = (s) => {
  const v = String(s ?? "").trim().toLowerCase();

  // pending
  if (
    ["en_attente", "pending", "attente", "wait", "waiting", "en attente"].includes(v) ||
    v === "en_attente"
  )
    return "PENDING";

  // delivered
  if (
    ["livres", "livré", "livree", "delivered", "livre", "livrée", "livré"].includes(v) ||
    v === "livre"
  )
    return "DELIVERED";

  // cancelled
  if (
    ["annules", "annulé", "annule", "cancelled", "canceled", "annulee", "annulée"].includes(v) ||
    v === "annule"
  )
    return "CANCELLED";

  // in preparation
  if (
    ["in_preparation", "en_preparation", "preparing", "préparation", "preparation"].includes(v) ||
    v === "en_preparation"
  )
    return "IN_PREPARATION";

  // out for delivery
  if (
    ["out_for_delivery", "en_livraison", "delivery", "livraison", "en livraison"].includes(v) ||
    v === "en_livraison"
  )
    return "OUT_FOR_DELIVERY";

  return "PENDING";
};

const denormalizeOrderStatus = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "PENDING") return "en_attente";
  if (v === "DELIVERED") return "livres";
  if (v === "CANCELLED") return "annules";
  if (v === "IN_PREPARATION") return "en_preparation";
  if (v === "OUT_FOR_DELIVERY") return "en_livraison";

  const low = String(s ?? "").toLowerCase();
  if (["en_attente", "livres", "annules", "en_preparation", "en_livraison"].includes(low))
    return low;

  return undefined;
};

const normalizePaymentStatus = (s) => {
  const v = String(s ?? "").trim().toLowerCase();
  if (["paye", "payé", "paid", "ok", "success"].includes(v)) return "PAID";
  if (["non_paye", "non_payé", "unpaid", "failed", "echec", "échec"].includes(v)) return "FAILED";
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
  if (v === "REFUNDED") return "refunded";

  const low = String(s ?? "").toLowerCase();
  if (["en_attente", "en_traitement", "paye", "non_paye", "refunded"].includes(low)) return low;

  return undefined;
};

const normalizePaymentMethod = (m) => {
  const v = String(m ?? "").trim().toLowerCase();
  if (["espece", "espèce", "cash", "cash_on_delivery"].includes(v)) return "CASH_ON_DELIVERY";
  if (
    ["tmoney", "t-money", "t_money", "orange_money", "moov_money", "wave", "mobile_money"].includes(
      v
    )
  )
    return "MOBILE_MONEY";
  if (["card", "carte", "visa", "mastercard"].includes(v)) return "CARD";
  if (["virement", "transfer", "bank_transfer"].includes(v)) return "OTHER";
  return "OTHER";
};

const denormalizePaymentMethod = (m) => {
  const v = String(m ?? "").toUpperCase();
  if (v === "CASH_ON_DELIVERY") return "espece";
  if (v === "MOBILE_MONEY") return "tmoney";
  if (v === "OTHER") return "virement";
  if (v === "CARD") return "card";

  const low = String(m ?? "").toLowerCase();
  if (["espece", "virement", "tmoney", "card"].includes(low)) return low;

  return undefined;
};

const normalizeSource = (s) => {
  const v = String(s ?? "").trim().toLowerCase();
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
  const o = unwrap(raw) ?? {};

  // restaurant (string or populated object)
  const resto = o.restaurent ?? o.restaurant ?? o.resto ?? o.restaurantRef ?? null;
  const restaurantId =
    typeof resto === "object" && resto
      ? resto._id ?? resto.id ?? resto.restaurantId ?? resto.restaurentId
      : resto ?? o.restaurantId ?? o.restaurentId ?? null;

  const restaurantName =
    typeof resto === "object" && resto ? resto.name ?? resto.nom ?? o.restaurantName ?? "-" : undefined;

  // items variations
  const items =
    (Array.isArray(o.items) && o.items) ||
    (Array.isArray(o.produits) && o.produits) ||
    (Array.isArray(o.articles) && o.articles) ||
    (Array.isArray(o.panier) && o.panier) ||
    [];

  const qtyOf = (it) =>
    Number(it?.quantite ?? it?.quantity ?? it?.qty ?? it?.qte ?? it?.count ?? 0) || 0;

  const itemsCount =
    items.length > 0 ? items.reduce((acc, it) => acc + qtyOf(it), 0) || items.length : 0;

  const createdAt = o.createdAt ?? o.created_at ?? o.date ?? o.dateCreation ?? o.created ?? null;

  const orderNumber =
    pick(o, ["order_number", "orderNumber", "numero_commande", "numeroCommande", "numero", "reference"]) ?? "";

  const customerName =
    pick(o, ["customer_name", "customerName", "client_name", "clientName"]) ??
    o.customer?.name ??
    o.customer?.nom ??
    o.client?.name ??
    o.client?.nom ??
    "";

  const customerPhone =
    pick(o, ["customer_phone", "customerPhone", "client_phone", "clientPhone", "telephone"]) ??
    o.customer?.phone ??
    o.customer?.telephone ??
    o.client?.phone ??
    o.client?.telephone ??
    "";

  const totalAmount = num(
    pick(o, ["total_amount", "totalAmount", "total", "montant_total", "montant", "amount", "prix_total"])
  );

  const statusRaw = pick(o, ["status", "etat", "state", "order_status", "orderStatus"]);
  const paymentStatusRaw = pick(o, ["payment_status", "paymentStatus", "statut_paiement", "payment_state"]);
  const paymentMethodRaw = pick(o, ["payment_method", "paymentMethod", "mode_paiement", "payment_mode"]);
  const sourceRaw = pick(o, ["source", "origine", "platform"]);

  const status = normalizeOrderStatus(statusRaw);
  const payment_status = normalizePaymentStatus(paymentStatusRaw);
  const payment_method = normalizePaymentMethod(paymentMethodRaw);
  const source = normalizeSource(sourceRaw);

  const id =
    pick(o, ["_id", "id", "orderId", "commandeId", "commande_id"]) ?? "";

  // IMPORTANT: on expose flat + nested pour compat maximale avec OrdersTable
  return {
    id,
    _id: id,

    restaurantId,

    order_number: orderNumber,
    orderNumber,

    customer_name: customerName,
    customer_phone: customerPhone,
    customer: { name: customerName, phone: customerPhone },

    total_amount: totalAmount,
    totalAmount,

    status,
    payment_status,
    payment_method,
    source,

    created_at: createdAt,
    createdAt,

    items,
    itemsCount,
    items_count: itemsCount,

    tableId: o.table ?? o.tableId ?? null,

    restaurant: restaurantName ? { name: restaurantName } : undefined,
    raw: o,
  };
};

const normalizeStats = (statsRaw) => {
  const s = unwrap(statsRaw) ?? {};
  return {
    total: num(
      pick(s, ["total", "count", "totalOrders", "totalCommandes", "orders", "commandes", "totalItems"])
    ),
    pending: num(pick(s, ["en_attente", "pending", "PENDING"])),
    delivered: num(pick(s, ["livres", "delivered", "DELIVERED"])),
    cancelled: num(pick(s, ["annules", "cancelled", "canceled", "CANCELLED"])),
  };
};

// ---------------- routes ----------------
// Restaurant
const restoListUrl = (rid) => `/order/${encodeURIComponent(rid)}`;
const restoStatsUrl = (rid) => `/order/${encodeURIComponent(rid)}/stats`;

// Admin
const adminListUrl = () => `/admin/commandes`;
const adminStatsUrl = () => `/admin/commandes/stats`;

const TIMEOUT = 10000;

const toAxiosErrorMessage = (err) => {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    "Request failed";
  return status ? `${status} - ${msg}` : msg;
};

export const ordersApi = {
  getOrders: async (params = {}, options = {}) => {
    const {
      mode = "restaurant",

      restaurantId,
      restaurentId,
      restaurant, // filtre admin

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

    const baseQuery = clean({
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
    });

    // ---------- ADMIN ----------
    if (mode === "admin") {
      const adminQuery = clean({
        ...baseQuery,
        restaurent: restaurant ?? restaurentId ?? restaurantId ?? undefined,
        restaurentId: restaurant ?? restaurentId ?? restaurantId ?? undefined,
      });

      const axiosCfg = { params: adminQuery, timeout: TIMEOUT, signal: options.signal };

      const [r1, r2] = await Promise.allSettled([
        client.get(adminListUrl(), axiosCfg),
        client.get(adminStatsUrl(), axiosCfg),
      ]);

      if (r1.status === "rejected" && r2.status === "rejected") {
        throw new Error(toAxiosErrorMessage(r1.reason) || toAxiosErrorMessage(r2.reason));
      }
      if (r1.status === "rejected") {
        throw new Error(toAxiosErrorMessage(r1.reason));
      }

      const listData = unwrap(r1.value?.data);
      const statsData = r2.status === "fulfilled" ? unwrap(r2.value?.data) : null;

      const listArr = arr(listData);
      const orders = listArr.map(normalizeOrder);

      const totalItems = num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;
      const totalPages =
        num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

      const normalizedStats = statsData ? normalizeStats(statsData) : normalizeStats({ total: totalItems });

      return { data: orders, totalPages, totalItems, stats: normalizedStats };
    }

    // ---------- RESTAURANT ----------
    const rid = restaurentId ?? restaurantId ?? null;

    if (!rid) {
      return {
        data: [],
        totalPages: 1,
        totalItems: 0,
        stats: { total: 0, pending: 0, delivered: 0, cancelled: 0 },
      };
    }

    const axiosCfg = { params: baseQuery, timeout: TIMEOUT, signal: options.signal };

    const [listRes, statsRes] = await Promise.allSettled([
      client.get(restoListUrl(rid), axiosCfg),
      client.get(restoStatsUrl(rid), axiosCfg),
    ]);

    if (listRes.status === "rejected") {
      throw new Error(toAxiosErrorMessage(listRes.reason));
    }

    const listData = unwrap(listRes.value?.data);
    const statsData = statsRes.status === "fulfilled" ? unwrap(statsRes.value?.data) : null;

    const listArr = arr(listData);
    const orders = listArr.map(normalizeOrder);

    const totalItems = num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;
    const totalPages =
      num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

    const normalizedStats = statsData ? normalizeStats(statsData) : normalizeStats({ total: totalItems });

    return { data: orders, totalPages, totalItems, stats: normalizedStats };
  },

  updateStatus: async (orderId, status) => {
    const payload = { status: denormalizeOrderStatus(status) };
    const res = await client.patch(`/order/${encodeURIComponent(orderId)}/status`, payload, {
      timeout: TIMEOUT,
    });
    return unwrap(res.data);
  },

  updatePaymentStatus: async (orderId, payment_status) => {
    const payload = { payment_status: denormalizePaymentStatus(payment_status) };
    const res = await client.patch(`/order/${encodeURIComponent(orderId)}/payment`, payload, {
      timeout: TIMEOUT,
    });
    return unwrap(res.data);
  },
};

export default ordersApi;