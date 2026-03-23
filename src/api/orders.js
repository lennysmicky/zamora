// src/api/orders.js
import client from "./client";

// ---------------- utils ----------------
const TIMEOUT = 10000;

const clean = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

const enc = (v) => encodeURIComponent(String(v ?? ""));

const axiosCfg = (options = {}, extra = {}) => ({
  timeout: TIMEOUT,
  signal: options.signal,
  ...extra,
});

const toAxiosErrorMessage = (err) => {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    "Request failed";
  return status ? `${status} - ${msg}` : msg;
};

const unwrap = (x) => {
  let v = x;
  for (let i = 0; i < 4; i++) {
    if (v == null) break;
    if (Array.isArray(v)) break;
    if (typeof v !== "object") break;

    const next = v.data ?? v.result ?? v.payload ?? v.response;
    if (!next || next === v) break;
    v = next;
  }
  return v;
};

const unwrapTables = (x) => {
  let v = x;
  for (let i = 0; i < 4; i++) {
    if (v == null) break;
    if (Array.isArray(v)) break;
    if (typeof v !== "object") break;

    const next = v.data ?? v.result ?? v.tables ?? v.table ?? v.payload ?? v.response;
    if (!next || next === v) break;
    v = next;
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

const arrTables = (v) => {
  const x = unwrapTables(v);
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.tables)) return x.tables;
  if (Array.isArray(x?.data?.tables)) return x.data.tables;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.results)) return x.results;
  if (Array.isArray(x?.items)) return x.items;
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
  for (const k of keys) {
    if (x[k] != null) return x[k];
  }
  return undefined;
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

const normalizeSource = (s) => {
  const raw = String(s ?? "").trim();
  const v = raw.toLowerCase();
  if (["sur_place", "on_site", "onsite"].includes(v)) return "ON_SITE";
  if (["a_emporter", "a-emporter", "takeaway", "take_away"].includes(v)) return "TAKEAWAY";
  if (["livraison", "delivery"].includes(v)) return "DELIVERY";
  if (["web", "application_web", "browser"].includes(v)) return "WEB";
  if (v === "qrcode" || v === "qr_code" || raw === "qrCode") return "QRCODE";
  if (["mobile", "app", "application"].includes(v)) return "MOBILE";
  return "OTHER";
};

const denormalizeSource = (s) => {
  const v = String(s ?? "").toUpperCase();
  if (v === "ON_SITE") return "sur_place";
  if (v === "TAKEAWAY") return "a_emporter";
  if (v === "DELIVERY") return "livraison";
  if (v === "WEB") return "web";
  if (v === "QRCODE") return "qrCode";
  if (v === "MOBILE") return "mobile";

  const low = String(s ?? "").toLowerCase();
  if (["sur_place", "a_emporter", "livraison", "web", "mobile"].includes(low)) return low;
  if (low === "qrcode" || low === "qr_code") return "qrCode";
  if (low === "application_web") return "web";
  return undefined;
};

// ---------------- table helpers ----------------
const normalizeTableRef = (tableRaw) => {
  if (!tableRaw) {
    return {
      tableId: null,
      tableNumber: null,
      tableName: "",
      tableLabel: "-",
    };
  }

  const tableObj = typeof tableRaw === "object" ? tableRaw : null;

  const tableId = tableObj?._id ?? tableObj?.id ?? (typeof tableRaw === "string" ? tableRaw : null) ?? null;

  const tableNumber =
    tableObj?.numero_table ??
    tableObj?.numeroTable ??
    tableObj?.numero ??
    tableObj?.tableNumber ??
    tableObj?.table_number ??
    tableObj?.number ??
    tableObj?.num ??
    null;

  const tableName =
    tableObj?.nom_table ??
    tableObj?.table_name ??
    tableObj?.tableName ??
    tableObj?.nom ??
    tableObj?.name ??
    "";

  let tableLabel = "-";

  if (tableNumber != null && String(tableNumber).trim() !== "") {
    tableLabel = `Table ${tableNumber}`;
  } else if (tableName && String(tableName).trim() !== "") {
    tableLabel = String(tableName).trim();
  }

  return {
    tableId: tableId ? String(tableId) : null,
    tableNumber: tableNumber ?? null,
    tableName: tableName ? String(tableName).trim() : "",
    tableLabel,
  };
};

// ---------------- normalize backend -> UI ----------------
const normalizeOrder = (raw) => {
  const o = unwrap(raw) ?? {};

  const resto = o.restaurent ?? o.restaurant ?? o.resto ?? o.restaurantRef ?? null;
  const restaurantId =
    typeof resto === "object" && resto
      ? resto._id ?? resto.id ?? resto.restaurantId ?? resto.restaurentId
      : resto ?? o.restaurantId ?? o.restaurentId ?? null;

  const restaurantName =
    typeof resto === "object" && resto
      ? resto.name ?? resto.nom ?? o.restaurantName ?? "-"
      : o.restaurantName ?? undefined;

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

  const createdAt =
    o.createdAt ?? o.created_at ?? o.date ?? o.dateCreation ?? o.created ?? null;

  const updatedAt =
    o.updatedAt ?? o.updated_at ?? o.dateModification ?? o.modified ?? null;

  const orderNumber =
    pick(o, [
      "order_number",
      "orderNumber",
      "numero_commande",
      "numeroCommande",
      "numero",
      "reference",
    ]) ?? "";

  const customerName =
    pick(o, ["customer_name", "customerName", "client_name", "clientName"]) ??
    o.customer?.name ??
    o.customer?.nom ??
    o.client?.name ??
    o.client?.nom ??
    "";

  const customerPhone =
    pick(o, [
      "customer_phone",
      "customerPhone",
      "client_phone",
      "clientPhone",
      "telephone",
    ]) ??
    o.customer?.phone ??
    o.customer?.telephone ??
    o.client?.phone ??
    o.client?.telephone ??
    "";

  const totalAmount = num(
    pick(o, [
      "total_amount",
      "totalAmount",
      "total",
      "montant_total",
      "montant",
      "amount",
      "prix_total",
    ])
  );

  const status = normalizeOrderStatus(
    pick(o, ["status", "etat", "state", "order_status", "orderStatus"]));

  const payment_status = normalizePaymentStatus(
    pick(o, ["payment_status", "paymentStatus", "statut_paiement", "payment_state"]));

  const payment_method = normalizePaymentMethod(
    pick(o, ["payment_method", "paymentMethod", "mode_paiement", "payment_mode"]));

  const source = normalizeSource(
    pick(o, ["source", "origine", "platform", "canal", "order_source"]));

  const id = pick(o, ["_id", "id", "orderId", "commandeId", "commande_id"]) ?? "";

  const tableCandidate =
    o.table ??
    o.tableId ??
    o.table_id ??
    o.tableRef ??
    o.tableCommande ??
    o.numeroTable ??
    o.numero_table ??
    o.tableNumber ??
    o.table_number ??
    o.numTable ??
    o.raw?.table ??
    o.raw?.tableId ??
    null;

  const tableData = normalizeTableRef(tableCandidate);

  return {
    id,
    _id: id,

    restaurantId: restaurantId ? String(restaurantId) : null,
    restaurantName,

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
    updated_at: updatedAt,
    updatedAt,

    items,
    itemsCount,
    items_count: itemsCount,

    tableId: tableData.tableId,
    tableNumber: tableData.tableNumber,
    tableName: tableData.tableName,
    tableLabel: tableData.tableLabel,

    restaurant: restaurantName ? { name: restaurantName } : undefined,
    raw: o,
  };
};

const normalizeStats = (statsRaw) => {
  const s = unwrap(statsRaw) ?? {};
  return {
    total: num(
      pick(s, [
        "total",
        "count",
        "totalOrders",
        "totalCommandes",
        "orders",
        "commandes",
        "totalItems",
      ])
    ),
    pending: num(pick(s, ["en_attente", "pending", "PENDING"])),
    delivered: num(pick(s, ["livres", "delivered", "DELIVERED"])),
    cancelled: num(pick(s, ["annules", "cancelled", "canceled", "CANCELLED"])),
  };
};

const normalizeMeal = (m) => ({
  _id: m?._id ?? m?.id ?? null,
  id: m?._id ?? m?.id ?? null,
  nom: m?.nom ?? m?.name ?? "",
  name: m?.nom ?? m?.name ?? "",
  prix: num(m?.prix ?? m?.price ?? 0),
  price: num(m?.prix ?? m?.price ?? 0),
});

const normalizeTable = (raw) => {
  const base = raw?.table && typeof raw.table === "object" ? raw.table : raw;
  const id = String(base?._id ?? base?.id ?? "").trim();

  const numero_table =
    base?.numero_table ??
    base?.numeroTable ??
    base?.numero ??
    base?.tableNumber ??
    base?.table_number ??
    base?.number ??
    base?.num ??
    null;

  const nom =
    base?.nom_table ??
    base?.table_name ??
    base?.tableName ??
    base?.nom ??
    base?.name ??
    "";

  const hasUseful =
    (numero_table != null && String(numero_table) !== "") ||
    String(nom).trim() !== "";

  if (!hasUseful) return null;

  return {
    ...(base || {}),
    _id: id,
    id,
    numero_table,
    numero: numero_table,
    nom: String(nom || "").trim(),
    name: String(nom || "").trim(),
    status: base?.status ?? base?.etat ?? "libre",
  };
};

// ---------------- routes ----------------
const urlListOrders = (rid) => `/order/${enc(rid)}`;
const urlStats = (rid) => `/order/${enc(rid)}/stats`;
const urlCreateCommande = (rid) => `/commande/${enc(rid)}`;
const urlCommandeDetail = (rid, id) => `/commande/${enc(rid)}/${enc(id)}`;
const urlCommandeDelete = (id) => `/commande/${enc(id)}`;

export const ordersApi = {
  // ====== LISTE DES COMMANDES ======
  getOrders: async (params = {}, options = {}) => {
    const {
      restaurantId,
      restaurentId,
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
      sort,
      ...rest
    } = params;

    const rid = restaurentId ?? restaurantId ?? null;

    if (!rid) {
      return {
        data: [],
        totalPages: 1,
        totalItems: 0,
        stats: normalizeStats({ total: 0 }),
      };
    }

    const listQuery = clean({
      ...rest,
      page,
      limit,
      period,
      from,
      to,
      sort: sort ?? '-createdAt',
      status: status ? denormalizeOrderStatus(status) : undefined,
      payment_status: paymentStatus ? denormalizePaymentStatus(paymentStatus) : undefined,
      payment_method: paymentMethod ? denormalizePaymentMethod(paymentMethod) : undefined,
      source: source ? denormalizeSource(source) : undefined,
      search,
      q: search,
      customer_name: search,
    });

    const statsQuery = clean({ period, from, to });

    try {
      const listCfg = axiosCfg(options, { params: listQuery });
      const statsCfg = axiosCfg(options, { params: statsQuery });

      const [listRes, statsRes] = await Promise.allSettled([
        client.get(urlListOrders(rid), listCfg),
        client.get(urlStats(rid), statsCfg),
      ]);

      if (listRes.status === "rejected") throw listRes.reason;

      const listData = unwrap(listRes.value?.data);
      const orders = arr(listData).map(normalizeOrder);

      const totalItems =
        num(listData?.totalItems ?? listData?.total ?? listData?.count) || orders.length;

      const totalPages =
        num(listData?.totalPages) || Math.max(1, Math.ceil(totalItems / (Number(limit) || 10)));

      const statsData =
        statsRes.status === "fulfilled" ? unwrap(statsRes.value?.data) : null;

      return {
        data: orders,
        totalPages,
        totalItems,
        stats: statsData
          ? normalizeStats(statsData)
          : normalizeStats({ total: totalItems }),
      };
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  // ====== 🆕 COMMANDES RÉCENTES (POUR POLLING) ======
  getRecentOrders: async (restaurantId, options = {}) => {
    const {
      sinceTimestamp,
      limit = 20,
      signal,
    } = options;

    if (!restaurantId) {
      return { orders: [], lastCheck: Date.now() };
    }

    try {
      const params = clean({
        limit,
        sort: '-createdAt',
        // Si le backend supporte le filtre par date
        createdAfter: sinceTimestamp ? new Date(sinceTimestamp).toISOString() : undefined,
        from: sinceTimestamp ? new Date(sinceTimestamp).toISOString() : undefined,
      });

      const res = await client.get(urlListOrders(restaurantId), {
        params,
        timeout: 5000, // Timeout court pour le polling
        signal,
      });

      const listData = unwrap(res?.data);
      const orders = arr(listData).map(normalizeOrder);

      return {
        orders,
        lastCheck: Date.now(),
      };
    } catch (e) {
      // Ne pas throw pour le polling, juste retourner vide
      console.warn('Polling orders failed:', e.message);
      return { orders: [], lastCheck: Date.now() };
    }
  },

  // ====== DÉTAIL D'UNE COMMANDE ======
  getOrderById: async (restaurentId, orderId, options = {}) => {
    if (!restaurentId) throw new Error("Missing restaurentId");
    if (!orderId) throw new Error("Missing orderId");

    try {
      const res = await client.get(
        urlCommandeDetail(restaurentId, orderId),
        axiosCfg(options)
      );
      return normalizeOrder(unwrap(res?.data));
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  // ====== CRÉER UNE COMMANDE ======
  createOrder: async (payload, options = {}) => {
    const rid =
      payload?.restaurent ??
      payload?.restaurentId ??
      payload?.restaurantId ??
      options?.restaurentId ??
      options?.restaurantId ??
      null;

    if (!rid) throw new Error("Missing restaurentId for createOrder()");

    const items = Array.isArray(payload?.items) ? payload.items : [];

    const mappedItems = items
      .map((it) => {
        const repas = it?.repas ?? it?.mealId ?? it?.id ?? it?._id;
        const quantite = Number(it?.quantite ?? it?.quantity ?? it?.qty ?? it?.qte ?? 0);
        if (!repas || !Number.isFinite(quantite) || quantite <= 0) return null;
        return { repas: String(repas), quantite };
      })
      .filter(Boolean);

    const body = clean({
      customer_name: payload?.customer_name ?? payload?.customer?.name,
      customer_phone: payload?.customer_phone ?? payload?.customer?.phone,
      payment_method: payload?.payment_method
        ? denormalizePaymentMethod(payload.payment_method)
        : undefined,
      source: payload?.source ? denormalizeSource(payload.source) : undefined,
      table: payload?.table ?? payload?.tableId ?? undefined,
      items: mappedItems,
    });

    try {
      const res = await client.post(urlCreateCommande(rid), body, axiosCfg(options));
      return unwrap(res?.data);
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  createCommande: async (restaurentId, body, options = {}) =>
    ordersApi.createOrder({ ...body, restaurent: restaurentId }, options),

  // ====== METTRE À JOUR UNE COMMANDE ======
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

    try {
      const res = await client.put(
        urlCommandeDetail(restaurentId, orderId),
        payload,
        axiosCfg(options)
      );
      return unwrap(res?.data);
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  updateStatus: async (orderId, status, options = {}) => {
    const rid = options?.restaurentId ?? options?.restaurantId ?? null;
    if (!rid) throw new Error("Missing restaurentId for updateStatus()");
    return ordersApi.updateOrder(rid, orderId, { status }, options);
  },

  updatePaymentStatus: async (orderId, payment_status, options = {}) => {
    const rid = options?.restaurentId ?? options?.restaurantId ?? null;
    if (!rid) throw new Error("Missing restaurentId for updatePaymentStatus()");
    return ordersApi.updateOrder(rid, orderId, { payment_status }, options);
  },

  // ====== SUPPRIMER UNE COMMANDE ======
  deleteOrder: async (restaurentId, orderId, options = {}) => {
    if (!orderId) throw new Error("Missing orderId");

    try {
      const res = await client.delete(
        urlCommandeDelete(orderId),
        axiosCfg(options)
      );
      return unwrap(res?.data);
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  // ====== TABLES ======
  getTables: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];

    try {
      const res = await client.get(`/table/${enc(restaurentId)}`, axiosCfg(options));
      const list = arrTables(res?.data);
      const out = (Array.isArray(list) ? list : [])
        .map(normalizeTable)
        .filter(Boolean);

      out.sort((a, b) => Number(a.numero_table ?? 0) - Number(b.numero_table ?? 0));
      return out;
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  // ====== CATÉGORIES ======
  getCategories: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];
    try {
      const res = await client.get(`/categorie/${enc(restaurentId)}`, axiosCfg(options));
      return arr(res?.data);
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },

  // ====== REPAS ======
  getRepas: async (restaurentId, options = {}) => {
    if (!restaurentId) return [];
    try {
      const res = await client.get(`/repas/${enc(restaurentId)}`, axiosCfg(options));
      return arr(res?.data).map(normalizeMeal).filter((m) => m?.id);
    } catch (e) {
      throw new Error(toAxiosErrorMessage(e));
    }
  },
};

// Export des fonctions de normalisation pour usage externe
export const orderUtils = {
  normalizeOrder,
  normalizeOrderStatus,
  normalizePaymentStatus,
  normalizeSource,
  denormalizeOrderStatus,
  denormalizePaymentStatus,
  denormalizeSource,
};

export default ordersApi;