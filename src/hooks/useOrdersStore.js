// src/hooks/useOrdersStore.js
import { useState, useEffect } from 'react';
import { ordersStore } from '../stores/ordersStore';

export const useOrdersStore = () => {
  const [state, setState] = useState(ordersStore.getState());

  useEffect(() => {
    const unsubscribe = ordersStore.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    // États
    selectedOrders: state.selectedOrders,
    orders: state.orders,
    handlers: state.handlers,
    isCreateModalOpen: state.isCreateModalOpen, // ✅ NOUVEAU
    
    // Méthodes
    setSelectedOrders: ordersStore.setSelectedOrders,
    setOrders: ordersStore.setOrders,
    setHandlers: ordersStore.setHandlers,
    clearSelection: ordersStore.clearSelection,
    openCreateModal: ordersStore.openCreateModal,   // ✅ NOUVEAU
    closeCreateModal: ordersStore.closeCreateModal, // ✅ NOUVEAU
    reset: ordersStore.reset
  };
};