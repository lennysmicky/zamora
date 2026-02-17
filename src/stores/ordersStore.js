// src/stores/ordersStore.js

const createOrdersStore = () => {
  let state = {
    selectedOrders: [],
    orders: [],
    handlers: {
      onRefresh: () => {},
      onExport: () => {},
      onBulkAction: () => {},
      onNewOrder: () => {},
      onClearSelection: () => {}
    },
    //  NOUVEAU : état du modal création
    isCreateModalOpen: false
  };

  const listeners = new Set();

  const notify = () => {
    listeners.forEach(listener => listener(state));
  };

  return {
    // Récupérer l'état
    getState: () => state,

    // S'abonner aux changements
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Mettre à jour les commandes sélectionnées
    setSelectedOrders: (selectedOrders) => {
      state = { ...state, selectedOrders };
      notify();
    },

    // Mettre à jour la liste des commandes
    setOrders: (orders) => {
      state = { ...state, orders };
      notify();
    },

    // Enregistrer les handlers (merge avec existants)
    setHandlers: (handlers) => {
      state = { ...state, handlers: { ...state.handlers, ...handlers } };
      notify();
    },

    // Vider la sélection
    clearSelection: () => {
      state = { ...state, selectedOrders: [] };
      notify();
    },

    // NOUVEAU : ouvrir le modal création
    openCreateModal: () => {
      state = { ...state, isCreateModalOpen: true };
      notify();
    },

    // NOUVEAU : fermer le modal création
    closeCreateModal: () => {
      state = { ...state, isCreateModalOpen: false };
      notify();
    },

    // Reset complet
    reset: () => {
      state = {
        selectedOrders: [],
        orders: [],
        handlers: {
          onRefresh: () => {},
          onExport: () => {},
          onBulkAction: () => {},
          onNewOrder: () => {},
          onClearSelection: () => {}
        },
        isCreateModalOpen: false
      };
      notify();
    }
  };
};

export const ordersStore = createOrdersStore();