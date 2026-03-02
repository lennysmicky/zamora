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

  if (Array.isArray(x?.repas)) return x.repas;
  if (Array.isArray(x?.plats)) return x.plats;
  if (Array.isArray(x?.categories)) return x.categories;
  if (Array.isArray(x?.categorie)) return x.categorie;

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

const isFallbackable = (err) => {
  const s = err?.response?.status;
  const m = String(err?.response?.data?.message ?? err?.message ?? "");
  return s === 404 || s === 405 || /not found|cannot|unknown|route|endpoint/i.test(m);
};

const requestWithFallback = async (calls) => {
  let lastErr = null;
  for (const fn of calls) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isFallbackable(e)) break;
    }
  }
  throw lastErr ?? new Error("Request failed");
};

// ---------------- mapping UI <-> backend ----------------
const normalizeOrderStatus = (s) => {
  const v = String(s ?? "").trim().toLowerCase();
  if (["en_attente", "pending", "attente", "en attente"].includes(v)) return "PENDING";
  if (["livres", "livré", "livree", "delivered", "livre", "livrée"].includes(v)) return "DELIVERED";
  if (["annules", "annulé", "annule", "cancelled", "canceled", "annulée"].includes(v)) return "CANCELLED";
  if (["en_preparation", "in_preparation", "preparing"].includes(v)) return "IN_PREPARATION";
  if (["en_livraison", "out_for_delivery"].includes(v)) return "OUT_FOR_DELIVERY";
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
  if (["en_attente", "livres", "annules", "en_preparation", "en_livraison"].includes(low)) return low;
  return undefined;
};

const normalizePaymentStatus = (s) => {
  const v = String(s ?? "").trim().toLowerCase();
  if (["paye", "payé", "paid", "ok", "success"].includes(v)) return "PAID";
  if (["non_paye", "non_payé", "unpaid", "failed", "echec", "échec"].includes(v)) return "FAILED";
  if (["en_traitement", "processing"].includes(v)) return "PROCESSING";
  if (["en_attente", "pending"].includes(v)) return "PENDING";
  if (["refunded", "rembourse", "remboursé"].includes(v)) return "REFUNDED";
  return "PENDING";
};

const denormalizePaymentStatus = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "PAID") return "paye";
  if (v === "FAILED") return "non_paye";
  if (v === "PROCESSING") return "en_traitement";
  if (v === "PENDING") return "en_attente";
  if (v === "REFUNDED") return "refunded";

  const low = String(s ?? "").toLowerCase();
  if (["en_attente", "en_traitement", "paye", "non_paye", "refunded"].includes(low)) return low;
  return undefined;
};

// backend enum: espece | virement | tmoney | flooz
const normalizePaymentMethod = (m) => {
  const v = String(m ?? "").trim().toLowerCase();
  if (["espece", "espèce", "cash", "cod", "cash_on_delivery"].includes(v)) return "CASH";
  if (["virement", "transfer", "bank_transfer"].includes(v)) return "TRANSFER";
  if (["tmoney", "t-money", "t_money"].includes(v)) return "TMONEY";
  if (["flooz"].includes(v)) return "FLOOZ";
  if (["card", "carte", "visa", "mastercard"].includes(v)) return "CARD";
  return "OTHER";
};

const denormalizePaymentMethod = (m) => {
  const v = String(m ?? "").toUpperCase();
  if (v === "CASH") return "espece";
  if (v === "TRANSFER") return "virement";
  if (v === "TMONEY") return "tmoney";
  if (v === "FLOOZ") return "flooz";
  if (v === "CARD") return "card";
  const low = String(m ?? "").toLowerCase();
  if (["espece", "virement", "tmoney", "flooz", "card"].includes(low)) return low;
  return undefined;
};

// backend enum: sur_place | a_emporter | livraison | web | qrCode
const normalizeSource = (s) => {
  const raw = String(s ?? "").trim();
  const v = raw.toLowerCase();
  if (["sur_place", "on_site", "onsite"].includes(v)) return "ON_SITE";
  if (["a_emporter", "a-emporter", "takeaway", "take_away"].includes(v)) return "TAKEAWAY";
  if (["livraison", "delivery"].includes(v)) return "DELIVERY";
  if (["web", "application_web", "browser"].includes(v)) return "WEB";
  if (v === "qrcode" || v === "qr_code" || raw === "qrCode") return "QRCODE";
  return "OTHER";
};

const denormalizeSource = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "ON_SITE") return "sur_place";
  if (v === "TAKEAWAY") return "a_emporter";
  if (v === "DELIVERY") return "livraison";
  if (v === "WEB") return "web";
  if (v === "QRCODE") return "qrCode";

  const low = String(s ?? "").toLowerCase();
  if (["sur_place", "a_emporter", "livraison", "web"].includes(low)) return low;
  if (low === "qrcode" || low === "qr_code") return "qrCode";
  if (low === "application_web") return "web";
  return undefined;
};

// ---------------- normalize backend -> UI row compatible ----------------
const normalizeOrder = (raw) => {
  const o = unwrap(raw) ?? {};

  const resto = o.restaurent ?? o.restaurant ?? o.resto ?? o.restaurantRef ?? null;
  const restaurantId =
    typeof resto === "object" && resto
      ? resto._id ?? resto.id ?? resto.restaurantId ?? resto.restaurentId
      : resto ?? o.restaurantId ?? o.restaurentId ?? null;

  const restaurantName =
    typeof resto === "object" && resto ? resto.name ?? resto.nom ?? o.restaurantName ?? "-" : undefined;

  const items =
    (Array.isArray(o.items) && o.items) ||
    (Array.isArray(o.produits) && o.produits) ||
    (Array.isArray(o.articles) && o.articles) ||
    (Array.isArray(o.panier) && o.panier) ||
    [];

  const qtyOf = (it) => Number(it?.quantite ?? it?.quantity ?? it?.qty ?? it?.qte ?? it?.count ?? 0) || 0;
  const itemsCount = items.length > 0 ? items.reduce((acc, it) => acc + qtyOf(it), 0) || items.length : 0;

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

  const id = pick(o, ["_id", "id", "orderId", "commandeId", "commande_id"]) ?? "";

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
    total: num(pick(s, ["total", "count", "totalOrders", "totalCommandes", "orders", "commandes", "totalItems"])),
    pending: num(pick(s, ["en_attente", "pending", "PENDING"])),
    delivered: num(pick(s, ["livres", "delivered", "DELIVERED"])),
    cancelled: num(pick(s, ["annules", "cancelled", "canceled", "CANCELLED"])),
  };
};

// ---------------- menu normalization ----------------
const normalizeMeal = (m) => ({
  _id: m?._id ?? m?.id ?? null,
  id: m?._id ?? m?.id ?? null,
  nom: m?.nom ?? m?.name ?? "",
  name: m?.nom ?? m?.name ?? "",
  prix: num(m?.prix ?? m?.price ?? 0),
  price: num(m?.prix ?? m?.price ?? 0),
});

// ---------------- routes ----------------
// NOUVELLES ROUTES RESTAURANT (Order API)
const restoOrdersUrl = (rid) => `/order/${encodeURIComponent(rid)}`; // GET list / POST create
const restoOrderDetailUrl = (rid, id) =>
  `/order/${encodeURIComponent(rid)}/${encodeURIComponent(id)}`; // GET detail / PATCH/PUT update / DELETE delete
const restoStatsUrl = (rid) => `/order/stats/${encodeURIComponent(rid)}`; // GET stats global

// Admin (on laisse inchangé)
const adminListUrl = () => `/admin/commandes`;
const adminStatsUrl = () => `/admin/commandes/stats`;

export const ordersApi = {
  // ========================
  // LIST + STATS
  // ========================
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
      if (r1.status === "rejected") throw new Error(toAxiosErrorMessage(r1.reason));

      const listData = unwrap(r1.value?.data);
      const statsData = r2.status === "fulfilled" ? unwrap(r2.value?.data) : null;

      const orders = arr(listData).map(normalizeOrder);

      const totalItems = num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;
      const totalPages = num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

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
      client.get(restoOrdersUrl(rid), axiosCfg),
      client.get(restoStatsUrl(rid), axiosCfg),
    ]);

    if (listRes.status === "rejected") {
      throw new Error(toAxiosErrorMessage(listRes.reason));
    }

    const listData = unwrap(listRes.value?.data);
    const statsData = statsRes.status === "fulfilled" ? unwrap(statsRes.value?.data) : null;

    const orders = arr(listData).map(normalizeOrder);

    const totalItems = num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;
    const totalPages = num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

    const normalizedStats = statsData ? normalizeStats(statsData) : normalizeStats({ total: totalItems });

    return { data: orders, totalPages, totalItems, stats: normalizedStats };
  },

  // ========================
  // DETAIL
  // GET /api/order/:restaurentId/:id
  // ========================
  getOrderById: async (restaurentId, orderId, options = {}) => {
    if (!restaurentId) throw new Error("Missing restaurentId");
    if (!orderId) throw new Error("Missing orderId");

    const res = await client.get(restoOrderDetailUrl(restaurentId, orderId), {
      timeout: TIMEOUT,
      signal: options.signal,
    });

    return normalizeOrder(unwrap(res?.data));
  },

  // ========================
  // CREATE
  // POST /api/order/:restaurentId
  // ========================
  createOrder: async (payload, options = {}) => {
    const rid =
      payload?.restaurent ??
      payload?.restaurentId ??
      payload?.restaurantId ??
      options?.restaurentId ??
      options?.restaurantId ??
      null;

    if (!rid) throw new Error("Missing restaurentId for createOrder()");

    const body = clean({
      customer_name: payload?.customer_name,
      customer_phone: payload?.customer_phone,
      payment_method: payload?.payment_method, // espece|virement|tmoney|flooz
      source: payload?.source, // sur_place|a_emporter|livraison|web|qrCode
      table: payload?.table || undefined,
      items: (payload?.items || []).map((it) => ({
        repas: String(it.repas),
        quantite: Number(it.quantite),
      })),
    });

    const res = await client.post(restoOrdersUrl(rid), body, {
      timeout: TIMEOUT,
      signal: options.signal,
    });

    return unwrap(res?.data);
  },

  // alias compat (ancien nom)
  createCommande: async (restaurentId, body, options = {}) =>
    ordersApi.createOrder({ ...body, restaurent: restaurentId }, options),

  // ========================
  // UPDATE
  // PATCH/PUT /api/order/:restaurentId/:id
  // ========================
  updateOrder: async (restaurentId, orderId, patch, options = {}) => {
    if (!restaurentId) throw new Error("Missing restaurentId");
    if (!orderId) throw new Error("Missing orderId");

    const payload = clean({
      ...patch,
      status: patch?.status ? denormalizeOrderStatus(patch.status) : patch?.status,
      payment_status: patch?.payment_status
        ? denormalizePaymentStatus(patch.payment_status)
        : patch?.payment_status,
      payment_method: patch?.payment_method
        ? denormalizePaymentMethod(patch.payment_method)
        : patch?.payment_method,
      source: patch?.source ? denormalizeSource(patch.source) : patch?.source,
    });

    // PATCH préféré, fallback PUT si backend n'accepte pas PATCH
    const doPatch = () =>
      client.patch(restoOrderDetailUrl(restaurentId, orderId), payload, {
        timeout: TIMEOUT,
        signal: options.signal,
      });

    const doPut = () =>
      client.put(restoOrderDetailUrl(restaurentId, orderId), payload, {
        timeout: TIMEOUT,
        signal: options.signal,
      });

    const res = await requestWithFallback([doPatch, doPut]);
    return unwrap(res?.data);
  },

  // wrappers (pour ne pas casser ton code existant)
  updateStatus: async (orderId, status, options = {}) => {
    const rid = options?.restaurentId ?? options?.restaurantId ?? null;

    // nouveau contrat (recommandé)
    if (rid) return ordersApi.updateOrder(rid, orderId, { status }, options);

    // 🔁 fallback ancien endpoint si certains écrans l'utilisent encore
    const payload = { status: denormalizeOrderStatus(status) };
    const res = await client.patch(`/order/${encodeURIComponent(orderId)}/status`, payload, {
      timeout: TIMEOUT,
      signal: options.signal,
    });
    return unwrap(res?.data);
  },

  updatePaymentStatus: async (orderId, payment_status, options = {}) => {
    const rid = options?.restaurentId ?? options?.restaurantId ?? null;

    // nouveau contrat (recommandé)
    if (rid) return ordersApi.updateOrder(rid, orderId, { payment_status }, options);

    // 🔁 fallback ancien endpoint
    const payload = { payment_status: denormalizePaymentStatus(payment_status) };
    const res = await client.patch(`/order/${encodeURIComponent(orderId)}/payment`, payload, {
      timeout: TIMEOUT,
      signal: options.signal,
    });
    return unwrap(res?.data);
  },

  // ========================
  // DELETE
  // DELETE /api/order/:restaurentId/:id
  // ========================
  deleteOrder: async (restaurentId, orderId, options = {}) => {
    if (!restaurentId) throw new Error("Missing restaurentId");
    if (!orderId) throw new Error("Missing orderId");

    const res = await client.delete(restoOrderDetailUrl(restaurentId, orderId), {
      timeout: TIMEOUT,
      signal: options.signal,
    });

    return unwrap(res?.data);
  },

  // ========================
  // MENU: TABLES / REPAS (inchangé)
  // ========================
  getTables: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];
    const axiosCfg = { timeout: TIMEOUT, signal: options.signal };

    const res = await requestWithFallback([
      () => client.get(`/table/restaurent/${encodeURIComponent(restaurentId)}`, axiosCfg),
      () => client.get(`/tables/restaurent/${encodeURIComponent(restaurentId)}`, axiosCfg),
      () => client.get(`/restaurent/${encodeURIComponent(restaurentId)}/tables`, axiosCfg),
      () => client.get(`/table/${encodeURIComponent(restaurentId)}`, axiosCfg),
      () => client.get(`/tables/${encodeURIComponent(restaurentId)}`, axiosCfg),
    ]);

    return arr(res?.data);
  },

  getCategories: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];
    const res = await client.get(`/categorie/${encodeURIComponent(restaurentId)}`, {
      timeout: TIMEOUT,
      signal: options.signal,
    });
    return arr(res?.data);
  },

  getRepas: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];
    const axiosCfg = { timeout: TIMEOUT, signal: options.signal };

    // 1) si GET /repas/:restaurentId existe
    const listAllMeals = async () => {
      const res = await client.get(`/repas/${encodeURIComponent(restaurentId)}`, axiosCfg);
      return arr(res?.data)
        .map(normalizeMeal)
        .filter((m) => m?.id);
    };

    // 2) fallback: repas/categorie/:restaurentId/:categorieId
    const listMealsByCategories = async () => {
      const catsRes = await client.get(`/categorie/${encodeURIComponent(restaurentId)}`, axiosCfg);
      const cats = arr(catsRes?.data);

      const chunks = await Promise.allSettled(
        cats.map((c) => {
          const cid = String(c?._id ?? c?.id ?? "");
          if (!cid) return Promise.resolve([]);
          return client
            .get(`/repas/categorie/${encodeURIComponent(restaurentId)}/${encodeURIComponent(cid)}`, axiosCfg)
            .then((r) => arr(r?.data).map(normalizeMeal));
        })
      );

      const flat = chunks.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      const map = new Map();
      for (const m of flat) if (m?.id) map.set(String(m.id), m);
      return [...map.values()];
    };

    const meals = await requestWithFallback([listAllMeals, listMealsByCategories]);
    const out = Array.isArray(meals) ? meals : [];
    out.sort((a, b) => String(a?.nom ?? "").localeCompare(String(b?.nom ?? ""), "fr"));
    return out;
  },
};

export default ordersApi;