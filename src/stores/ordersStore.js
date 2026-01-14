// Store simple pour partager les données Orders entre Header et OrdersPage

let listeners = [];

let state = {
  selectedOrders: [],
  orders: [],
  handlers: {
    onRefresh: () => {},
    onExport: () => {},
    onBulkAction: () => {},
    onNewOrder: () => {},
    onClearSelection: () => {}
  }
};

export const ordersStore = {
  // Récupérer l'état
  getState: () => state,

  // Mettre à jour les commandes sélectionnées
  setSelectedOrders: (selectedOrders) => {
    state = { ...state, selectedOrders };
    listeners.forEach(listener => listener(state));
  },

  // Mettre à jour la liste des commandes
  setOrders: (orders) => {
    state = { ...state, orders };
    listeners.forEach(listener => listener(state));
  },

  // Enregistrer les handlers
  setHandlers: (handlers) => {
    state = { ...state, handlers: { ...state.handlers, ...handlers } };
    listeners.forEach(listener => listener(state));
  },

  // Vider la sélection
  clearSelection: () => {
    state = { ...state, selectedOrders: [] };
    listeners.forEach(listener => listener(state));
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
      }
    };
    listeners.forEach(listener => listener(state));
  },

  // S'abonner aux changements
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};