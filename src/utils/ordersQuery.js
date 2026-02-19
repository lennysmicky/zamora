// src/utils/ordersQuery.js

const clean = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));

const normalizeStr = (v) => (v == null ? "" : String(v).trim());

const toInt = (v, def) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

/**
 * 1) Helper simple pour "View all" (TopSelling / RecentOrders)
 *    -> retourne "?a=b&c=d"
 *
 * IMPORTANT: on garde une tolérance restaurantId/restaurant
 */
export const buildOrdersQuery = (filters = {}) => {
  const sp = new URLSearchParams();

  const period = normalizeStr(filters.period) || "30days";
  const from = period === "custom" ? normalizeStr(filters.from) : "";
  const to = period === "custom" ? normalizeStr(filters.to) : "";

  const merged = clean({
    period: period !== "30days" ? period : "",
    from,
    to,
    restaurant: normalizeStr(filters.restaurant),       // admin
    restaurantId: normalizeStr(filters.restaurantId),   // tolérance
    search: normalizeStr(filters.search),
    status: normalizeStr(filters.status),
    paymentStatus: normalizeStr(filters.paymentStatus),
    paymentMethod: normalizeStr(filters.paymentMethod),
    source: normalizeStr(filters.source),
    page: filters.page,
    limit: filters.limit,
  });

  Object.entries(merged).forEach(([k, v]) => sp.set(k, String(v)));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

/**
 * 2) Lire l’URL -> état (filters + pagination)
 *    Toute la tolérance/compat ici.
 */
export const readOrdersSearchParams = (searchParams, { defaults, mode } = {}) => {
  const sp =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(String(searchParams || ""));

  const get = (k) => normalizeStr(sp.get(k));

  const page = toInt(get("page"), 1);
  const limit = toInt(get("limit"), 10);

  const period = get("period") || (defaults?.period ?? "30days");
  const from = period === "custom" ? get("from") : "";
  const to = period === "custom" ? get("to") : "";

  // base
  const filters = {
    ...(defaults ?? {}),
    period,
    from,
    to,
    search: get("search"),
    status: get("status"),
    paymentStatus: get("paymentStatus"),
    paymentMethod: get("paymentMethod"),
    source: get("source"),

    // admin
    restaurant: get("restaurant"),

    // tolérance liens
    restaurantId: get("restaurantId"),
  };

  if (mode === "admin") {
    if (!filters.restaurant && filters.restaurantId) filters.restaurant = filters.restaurantId;
  }

  if (mode === "restaurant") {
    // scope géré par store/prop => on ignore filtre admin
    filters.restaurant = "";
  }

  return {
    initialFilters: filters,

    // ✅ on renvoie les 2 formes pour compat
    initialPagination: { page, limit, currentPage: page, itemsPerPage: limit },
  };
};

/**
 * 3) Écrire état -> URL (retourne "a=b&c=d" SANS '?')
 *    Toute la décision "quoi mettre en URL" est ici.
 */
export const writeOrdersSearchParams = ({ filters, pagination, mode, restaurantId } = {}) => {
  const sp = new URLSearchParams();

  const period = normalizeStr(filters?.period) || "30days";
  const from = period === "custom" ? normalizeStr(filters?.from) : "";
  const to = period === "custom" ? normalizeStr(filters?.to) : "";

  const base = clean({
    search: normalizeStr(filters?.search),
    status: normalizeStr(filters?.status),
    paymentStatus: normalizeStr(filters?.paymentStatus),
    paymentMethod: normalizeStr(filters?.paymentMethod),
    source: normalizeStr(filters?.source),

    // URL clean: on omet 30days
    period: period !== "30days" ? period : "",
    from,
    to,
  });

  Object.entries(base).forEach(([k, v]) => sp.set(k, String(v)));

  // pagination (tolère 2 formats)
  const page = toInt(pagination?.page ?? pagination?.currentPage, 1);
  const limit = toInt(pagination?.limit ?? pagination?.itemsPerPage, 10);

  // URL clean: on omet page=1, limit=10
  if (page > 1) sp.set("page", String(page));
  if (limit !== 10) sp.set("limit", String(limit));

  // scope
  if (mode === "admin") {
    const r = normalizeStr(filters?.restaurant);
    if (r) sp.set("restaurant", r);
  }

  if (mode === "restaurant") {
    // optionnel: utile si tu veux partager un lien; sinon tu peux retirer ce bloc
    const rid = normalizeStr(restaurantId);
    if (rid) sp.set("restaurantId", rid);
  }

  return sp.toString();
};
