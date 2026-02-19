import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  user: null,
  token: null,
  userType: null,
  restaurantId: null,
  restaurantName: null,
  isAuthenticated: false,
  isLoading: false,
};

const normType = (u) => String(u?.role ?? u?.userType ?? u?.type ?? "").toLowerCase();

const parseJwt = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    // atob -> unicode safe
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const pickRestaurantIdFromUser = (u) =>
  u?.restaurantId ??
  u?.restaurant_id ??
  u?.restaurentId ??
  u?.restaurent_id ??
  u?.restaurant?._id ??
  u?.restaurant?.id ??
  null;

const pickRestaurantName = (u) =>
  u?.restaurantName ??
  u?.restaurant_name ??
  u?.restaurentName ??
  u?.restaurent_name ??
  u?.restaurant?.name ??
  u?.name ??
  "";

const computeRestaurantId = ({ user, token }) => {
  // 1) user payload si présent
  const fromUser = pickRestaurantIdFromUser(user);
  if (fromUser) return fromUser;

  // 2) sinon token payload (chez toi c’est la source fiable)
  const jwt = parseJwt(token);
  return jwt?.restaurentId ?? jwt?.restaurantId ?? null;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

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
        const rid = computeRestaurantId({ user, token }); // ✅ NO uid fallback
        const rname = pickRestaurantName(user);

        set({
          user: {
            id: uid,
            name: user.name ?? rname ?? "",
            email: user.email ?? "",
            avatar: user.avatar || null,
            role: normType(user) || "restaurant",
          },
          token,
          userType: "restaurant",
          restaurantId: rid, // ✅ doit être 6989992008a1b331bb61f960 chez toi
          restaurantName: rname,
          isAuthenticated: true,
        });
      },

      setUser: (userData) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...userData } : userData,
        })),

      // IMPORTANT: quand refresh token arrive, on recalcule restaurantId si besoin
      setToken: (token) => {
        if (!token) return;
        set((s) => {
          if (s.userType !== "restaurant") return { token };
          const rid = s.restaurantId || computeRestaurantId({ user: s.user, token });
          return { token, restaurantId: rid };
        });
      },

      updateUser: (userData) => set((s) => ({ user: { ...s.user, ...userData } })),
      setLoading: (v) => set({ isLoading: v }),

      clear: () => set({ ...initialState }),
      logout: () => set({ ...initialState }),

      isAdmin: () => get().userType === "admin",
      isRestaurant: () => get().userType === "restaurant",
      getToken: () => get().token,
      getUser: () => get().user,
      getUserType: () => get().userType,
      getRestaurantId: () => get().restaurantId,
    }),
    {
      name: "zamora-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        userType: s.userType,
        restaurantId: s.restaurantId,
        restaurantName: s.restaurantName,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
