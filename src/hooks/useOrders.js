import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders';

export const useOrders = () => {
  // États
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    source: '',
    period: '30days',
    restaurant: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Charger les commandes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await ordersApi.getOrders({
      //   ...filters,
      //   page: pagination.currentPage,
      //   limit: pagination.itemsPerPage
      // });
      // setOrders(response.data);
      // setPagination(prev => ({
      //   ...prev,
      //   totalPages: response.totalPages,
      //   totalItems: response.totalItems
      // }));
      // setStats(response.stats);

      // Données vides pour l'instant
      setOrders([]);
      setStats({
        total: 0,
        pending: 0,
        delivered: 0,
        cancelled: 0
      });
      setPagination(prev => ({
        ...prev,
        totalPages: 0,
        totalItems: 0
      }));

    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des commandes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // TODO: Remplacer par l'appel API réel
      // await ordersApi.updateStatus(orderId, newStatus);
      
      // Mettre à jour localement
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      return false;
    }
  };

  return {
    orders,
    stats,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchOrders,
    updateOrderStatus
  };
};