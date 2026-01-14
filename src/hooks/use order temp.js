// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../stores/authStore';
import * as ordersAPI from '../api/orders';

// ⚡ SWITCH ICI
const USE_MOCK = true;

export const useOrders = (restaurantIdParam = null) => {
  const { t } = useTranslation();
  const { restaurantId: storeRestaurantId, userType, token } = useAuthStore();
  
  const restaurantId = restaurantIdParam || storeRestaurantId;
  const isRestaurantMode = userType === 'restaurant' || !!restaurantIdParam;

  // States
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        const response = await ordersAPI.getOrders(restaurantId, {
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });

        if (response.success) {
          setOrders(response.data.orders);
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          }));
        }

        // Fetch stats
        const statsResponse = await ordersAPI.getOrdersStats(restaurantId);
        if (statsResponse.success) {
          setStats(statsResponse.data.stats);
        }
      } else {
        // Mode réel - fetch API
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const baseUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/orders`
          : `${API_URL}/orders`;

        const params = new URLSearchParams({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        }).toString();

        const response = await fetch(`${baseUrl}?${params}`, { headers });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || data.orders || []);
          if (data.pagination) {
            setPagination(prev => ({
              ...prev,
              total: data.pagination.total,
              totalPages: data.pagination.totalPages
            }));
          }
        }

        // Fetch stats
        const statsUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/orders/stats`
          : `${API_URL}/orders/stats`;
        
        const statsRes = await fetch(statsUrl, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData || {});
        }
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(t('orders.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, isRestaurantMode, filters, pagination.page, pagination.limit, token, t]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      if (USE_MOCK) {
        const response = await ordersAPI.updateOrderStatus(orderId, newStatus);
        if (response.success) {
          setOrders(prev => 
            prev.map(order => 
              order.id === orderId 
                ? { ...order, status: newStatus }
                : order
            )
          );
          return { success: true };
        }
      } else {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          setOrders(prev => 
            prev.map(order => 
              order.id === orderId 
                ? { ...order, status: newStatus }
                : order
            )
          );
          return { success: true };
        }
      }
    } catch (err) {
      console.error('Update order status error:', err);
      return { success: false, error: t('orders.errors.updateFailed') };
    }
  }, [token, t]);

  // Effect
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    updateOrderStatus,
    isRestaurantMode,
    restaurantId
  };
};

export default useOrders;