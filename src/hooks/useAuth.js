// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  user: null,
  token: null,
  userType: null, // "admin" | "restaurant" | null
  restaurantId: null,
  restaurantName: null,
  isAuthenticated: false,
  isLoading: false,

  // ✅ important: persist hydrate async
  hasHydrated: false,
};

const norm = (v) => String(v ?? "").trim().toLowerCase();

const normType = (u) => norm(u?.role ?? u?.userType ?? u?.type ?? "");

// -------- JWT decode (sans lib) --------
const base64UrlToJson = (base64Url) => {
  try {
    const b64 = String(base64Url).replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);

    const bin = atob(b64 + pad);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const jsonStr =
      typeof TextDecoder !== "undefined"
        ? new TextDecoder("utf-8").decode(bytes)
        : bin;

    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  return base64UrlToJson(parts[1]);
};

const pickRestaurantIdFromUser = (u) =>
  u?.restaurantId ??
  u?.restaurant_id ??
  u?.restaurentId ??
  u?.restaurent_id ??
  u?.restuarentId ??
  u?.restuarent_id ??
  u?.restaurant?._id ??
  u?.restaurant?.id ??
  null;

const pickRestaurantIdFromToken = (token) => {
  const p = decodeJwtPayload(token);
  return (
    p?.restaurantId ??
    p?.restaurant_id ??
    p?.restaurentId ?? // ✅ ton backend (JWT)
    p?.restaurent_id ??
    p?.restuarentId ??
    p?.restuarent_id ??
    p?.idRestaurant ??
    p?.id_restaurant ??
    null
  );
};

const pickRoleFromToken = (token) => {
  const p = decodeJwtPayload(token);
  return norm(p?.role ?? p?.userType ?? p?.type ?? "");
};

const pickRestaurantName = (u) =>
  u?.restaurantName ??
  u?.restaurant_name ??
  u?.restaurentName ??
  u?.restaurent_name ??
  u?.restaurant?.name ??
  u?.name ??
  "";

const resolveRestaurantId = ({ user, token, currentRid }) => {
  const uid = user?.id ?? user?._id ?? null;
  const fromUser = pickRestaurantIdFromUser(user);
  const fromToken = pickRestaurantIdFromToken(token);

  let rid = currentRid ?? fromUser ?? fromToken ?? null;

  // ✅ self-heal: si rid == uid mais token contient un vrai restaurentId différent
  if (
    uid &&
    rid &&
    String(rid) === String(uid) &&
    fromToken &&
    String(fromToken) !== String(uid)
  ) {
    rid = fromToken;
  }

  return rid ?? null;
};

const resolveUserType = ({ user, token, currentType }) => {
  const t = norm(currentType) || normType(user) || pickRoleFromToken(token);
  if (t === "admin") return "admin";
  if (t === "restaurant") return "restaurant";
  return null;
};

/**
 * migrate / self-heal persisted state
 * - corrige restaurantId invalide (uid) ou manquant
 * - corrige userType manquant si token/user indique "restaurant" ou "admin"
 */
const healPersisted = (s) => {
  if (!s) return s;

  const userType = resolveUserType({ user: s.user, token: s.token, currentType: s.userType });

  // si pas authentifié mais token existe, on peut reconstruire isAuthenticated
  const isAuthenticated = Boolean(s.isAuthenticated || (s.token && s.user));

  let next = { ...s, userType, isAuthenticated };

  if (userType === "restaurant") {
    const rid = resolveRestaurantId({
      user: next.user,
      token: next.token,
      currentRid: next.restaurantId,
    });
    if (rid && String(rid) !== String(next.restaurantId ?? "")) {
      next.restaurantId = rid;
    }
  } else {
    // admin => pas de scope resto
    next.restaurantId = null;
    next.restaurantName = next.restaurantName ?? null;
  }

  return next;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ✅ internal
      setHydrated: (v) => set({ hasHydrated: Boolean(v) }),

      loginAdmin: ({ user, token }) => {
        if (!token || !user) return;
        const uid = user.id ?? user._id ?? null;

        set({
          user: {
            id: uid,
            name: user.name ?? "",
            email: user.email ?? "",
            avatar: user.avatar || null,
            role: normType(user) || "admin",
          },
          token,
          userType: "admin",
          restaurantId: null,
          restaurantName: null,
          isAuthenticated: true,
        });
      },

      loginRestaurant: ({ user, token }) => {
        if (!token || !user) return;

        const uid = user.id ?? user._id ?? null;
        const rid = resolveRestaurantId({ user, token, currentRid: null });
        const rname = pickRestaurantName(user);

        set({
          user: {
            id: uid,
            name: user.name ?? user.restaurantName ?? rname ?? "",
            email: user.email ?? "",
            avatar: user.avatar || null,
            role: normType(user) || "restaurant",
          },
          token,
          userType: "restaurant",
          restaurantId: rid,
          restaurantName: rname,
          isAuthenticated: true,
        });
      },

      setUser: (userData) =>
        set((s) => {
          const nextUser = s.user ? { ...s.user, ...userData } : userData;

          const nextType = resolveUserType({
            user: nextUser,
            token: s.token,
            currentType: s.userType,
          });

          if (nextType !== "restaurant") return { user: nextUser, userType: nextType };

          const rid = resolveRestaurantId({
            user: nextUser,
            token: s.token,
            currentRid: s.restaurantId,
          });

          return { user: nextUser, userType: "restaurant", restaurantId: rid };
        }),

      setToken: (token) => {
        if (!token) return;
        set((s) => {
          const nextType = resolveUserType({
            user: s.user,
            token,
            currentType: s.userType,
          });

          if (nextType !== "restaurant") return { token, userType: nextType };

          const rid = resolveRestaurantId({
            user: s.user,
            token,
            currentRid: s.restaurantId,
          });

          return { token, userType: "restaurant", restaurantId: rid };
        });
      },

      updateUser: (userData) =>
        set((s) => {
          const nextUser = { ...(s.user ?? {}), ...userData };

          const nextType = resolveUserType({
            user: nextUser,
            token: s.token,
            currentType: s.userType,
          });

          if (nextType !== "restaurant") return { user: nextUser, userType: nextType };

          const rid = resolveRestaurantId({
            user: nextUser,
            token: s.token,
            currentRid: s.restaurantId,
          });

          return { user: nextUser, userType: "restaurant", restaurantId: rid };
        }),

      setLoading: (v) => set({ isLoading: Boolean(v) }),

      clear: () => set({ ...initialState, hasHydrated: true }),
      logout: () => set({ ...initialState, hasHydrated: true }),

      // getters
      isAdmin: () => get().userType === "admin",
      isRestaurant: () => get().userType === "restaurant",
      getToken: () => get().token,
      getUser: () => get().user,
      getUserType: () => get().userType,
      getRestaurantId: () => get().restaurantId,
    }),
    {
      name: "zamora-auth",
      version: 4, // ✅ bump pour forcer migrate
      migrate: (persisted) => healPersisted(persisted),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        userType: s.userType,
        restaurantId: s.restaurantId,
        restaurantName: s.restaurantName,
        isAuthenticated: s.isAuthenticated,
      }),
      // ✅ marque l’hydration + self-heal post-hydrate
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // évite un blocage UI si storage corrompu
          state?.setHydrated?.(true);
          return;
        }
        // après rehydrate, corrige si besoin
        const s = state;
        if (s?.userType === "restaurant") {
          const fixedRid = resolveRestaurantId({
            user: s.user,
            token: s.token,
            currentRid: s.restaurantId,
          });
          if (fixedRid && String(fixedRid) !== String(s.restaurantId ?? "")) {
            // set via store API
            useAuthStore.setState({ restaurantId: fixedRid });
          }
        }
        state?.setHydrated?.(true);
      },
    }
  )
);

export default useAuthStore;
