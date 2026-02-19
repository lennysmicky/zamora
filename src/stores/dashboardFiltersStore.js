// src/stores/dashboardFiltersStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initial = {
  restaurant: null, // { id, name } | null
  period: "30days", // today | 7days | 30days | custom
  from: "",
  to: "",
};

export const useDashboardFiltersStore = create(
  persist(
    (set) => ({
      ...initial,

      setRestaurant: (r) =>
        set({
          restaurant: r?.id ? { id: r.id, name: r.name } : null,
        }),

      setPeriod: (period) =>
        set((s) => ({
          period,
          // si pas custom, on nettoie les dates
          from: period === "custom" ? s.from : "",
          to: period === "custom" ? s.to : "",
        })),

      setRange: ({ from, to }) =>
        set({
          period: "custom",
          from: from || "",
          to: to || "",
        }),

      reset: () => set({ ...initial }),
    }),
    { name: "zamora-dashboard-filters" }
  )
);
