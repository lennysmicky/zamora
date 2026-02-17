// src/hooks/useOrdersStore.js
import { useEffect, useMemo, useState } from "react";
import { ordersStore } from "../stores/ordersStore";

// ✅ hook générique selector
const useOrdersSelector = (selector) => {
  const [state, setState] = useState(() => selector(ordersStore.getState()));

  useEffect(() => {
    const unsub = ordersStore.subscribe((next) => {
      setState(selector(next));
    });
    return unsub;
  }, [selector]);

  return state;
};

// ✅ selectors demandés
export const useSelectedOrders = () =>
  useOrdersSelector((s) => (Array.isArray(s.selectedOrders) ? s.selectedOrders : []));

export const useIsCreateModalOpen = () =>
  useOrdersSelector((s) => Boolean(s.isCreateModalOpen));

export const useOrdersHandlers = () =>
  useOrdersSelector((s) => s.handlers);

// ✅ ton hook existant (compatible)
export const useOrdersStore = () => {
  const fullState = useOrdersSelector((s) => s);

  const selectedOrders = useMemo(
    () => (Array.isArray(fullState.selectedOrders) ? fullState.selectedOrders : []),
    [fullState.selectedOrders]
  );

  return {
    // États
    selectedOrders,
    orders: fullState.orders ?? [],
    handlers: fullState.handlers ?? {},
    isCreateModalOpen: Boolean(fullState.isCreateModalOpen),

    // Méthodes
    setSelectedOrders: ordersStore.setSelectedOrders,
    setOrders: ordersStore.setOrders,
    setHandlers: ordersStore.setHandlers,
    clearSelection: ordersStore.clearSelection,
    openCreateModal: ordersStore.openCreateModal,
    closeCreateModal: ordersStore.closeCreateModal,
    reset: ordersStore.reset,
  };
};
