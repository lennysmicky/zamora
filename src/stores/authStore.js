import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // STATE
      user: null,
      token: null,
      userType: null,
      restaurantId: null,
      restaurantName: null,
      isAuthenticated: false,
      isLoading: false,

      // ACTIONS
      loginAdmin: ({ user, token }) => {
        if (!token || !user) return;
        set({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || null,
            role: user.role || 'admin'
          },
          token,
          userType: 'admin',
          restaurantId: null,
          restaurantName: null,
          isAuthenticated: true
        });
      },

      loginRestaurant: ({ user, token }) => {
        if (!token || !user) return;
        set({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || null,
            role: user.role || 'restaurant'
          },
          token,
          userType: 'restaurant',
          restaurantId: user.restaurantId || user.id,
          restaurantName: user.restaurantName || user.name,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          userType: null,
          restaurantId: null,
          restaurantName: null,
          isAuthenticated: false
        });
      },

      setToken: (token) => {
        if (token) set({ token });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      setLoading: (value) => {
        set({ isLoading: value });
      },

      // GETTERS
      isAdmin: () => get().userType === 'admin',
      isRestaurant: () => get().userType === 'restaurant',
      getToken: () => get().token,
      getUser: () => get().user,
      getUserType: () => get().userType
    }),
    {
      name: 'zamora-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userType: state.userType,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;