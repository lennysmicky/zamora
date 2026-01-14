import { useState, useEffect } from 'react';
import { ordersStore } from '../stores/ordersStore';

export const useOrdersStore = () => {
  const [state, setState] = useState(ordersStore.getState());

  useEffect(() => {
    const unsubscribe = ordersStore.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    selectedOrders: state.selectedOrders,
    orders: state.orders,
    handlers: state.handlers,
    setSelectedOrders: ordersStore.setSelectedOrders,
    setOrders: ordersStore.setOrders,
    setHandlers: ordersStore.setHandlers,
    clearSelection: ordersStore.clearSelection,
    reset: ordersStore.reset
  };
};