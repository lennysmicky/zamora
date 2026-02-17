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

const normType = (u) =>
  String(u?.role ?? u?.userType ?? u?.type ?? "").toLowerCase();

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
        const rid = user.restaurantId ?? user.restaurant_id ?? uid; // fix typo
        const rname = user.restaurantName ?? user.name ?? "";

        set({
          user: {
            id: uid,
            name: user.name ?? user.restaurantName ?? "",
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

      // utilisé par useAuth (init)
      setUser: (userData) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...userData } : userData,
        })),

      // utilisé par useAuth (logout/catch)
      clear: () => set({ ...initialState }),

      logout: () => set({ ...initialState }),

      setToken: (token) => token && set({ token }),
      updateUser: (userData) => set((s) => ({ user: { ...s.user, ...userData } })),
      setLoading: (v) => set({ isLoading: v }),

      isAdmin: () => get().userType === "admin",
      isRestaurant: () => get().userType === "restaurant",
      getToken: () => get().token,
      getUser: () => get().user,
      getUserType: () => get().userType,
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
