// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../stores/authStore';
import * as dashboardAPI from '../api/dashboard';

// ⚡ SWITCH ICI - mettre false pour utiliser le vrai backend
const USE_MOCK = true;

export const useDashboardData = (restaurantIdParam = null) => {
  const { t } = useTranslation();
  
  // Récupérer restaurantId du store si pas passé en param
  const { restaurantId: storeRestaurantId, userType, token } = useAuthStore();
  
  // Utiliser le param ou celui du store
  const restaurantId = restaurantIdParam || storeRestaurantId;

  // Déterminer si mode restaurant ou admin
  const isRestaurantMode = userType === 'restaurant' && !!restaurantId;
  const isAdminMode = userType === 'admin' || !restaurantId;

  // ============================================
  // 📊 STATES
  // ============================================
  const [kpis, setKpis] = useState({
    // Common
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    // Admin only
    totalRestaurants: 0,
    activeRestaurants: 0,
    // Restaurant only
    todayRevenue: 0,
    todayOrders: 0,
    inProgressOrders: 0,
    cancelledOrders: 0,
    // Growth
    growthRevenue: 0,
    growthOrders: 0,
    growthCustomers: 0
  });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  });

  const [ordersStatusData, setOrdersStatusData] = useState({
    labels: [],
    data: [],
    colors: []
  });

  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]); // Admin only
  const [hourlyOrders, setHourlyOrders] = useState(null); // Restaurant only

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // 🌐 API CONFIG (pour mode réel)
  // ============================================
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  // ============================================
  // 🎭 FETCH AVEC MOCK
  // ============================================
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // ========== MODE MOCK ==========
        if (isAdminMode) {
          const response = await dashboardAPI.getAdminDashboard();
          
          if (response.success) {
            const { data } = response;
            setKpis(data.kpis);
            setRevenueData(data.revenueChart);
            setOrdersStatusData(data.ordersStatusChart);
            setTopSellingItems(data.topSellingItems);
            setRecentOrders(data.recentOrders);
            setTopRestaurants(data.topRestaurants);
          }
        } else {
          const response = await dashboardAPI.getRestaurantDashboard(restaurantId);
          
          if (response.success) {
            const { data } = response;
            setKpis(data.kpis);
            setRevenueData(data.revenueChart);
            setOrdersStatusData(data.ordersStatusChart);
            setTopSellingItems(data.topSellingItems);
            setRecentOrders(data.recentOrders);
            setHourlyOrders(data.hourlyOrders);
          }
        }
      } else {
        // ========== MODE RÉEL ==========
        const headers = getHeaders();
        
        const baseUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/dashboard`
          : `${API_URL}/dashboard`;

        const ordersUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/orders?limit=10&sort=-createdAt`
          : `${API_URL}/orders?limit=10&sort=-createdAt`;

        const [
          statsRes,
          revenueRes,
          ordersStatusRes,
          topItemsRes,
          recentOrdersRes
        ] = await Promise.all([
          fetch(`${baseUrl}/stats`, { headers }).catch(() => null),
          fetch(`${baseUrl}/revenue`, { headers }).catch(() => null),
          fetch(`${baseUrl}/orders-status`, { headers }).catch(() => null),
          fetch(`${baseUrl}/top-items`, { headers }).catch(() => null),
          fetch(ordersUrl, { headers }).catch(() => null)
        ]);

        if (statsRes?.ok) {
          const data = await statsRes.json();
          setKpis(prev => ({ ...prev, ...data }));
        }

        if (revenueRes?.ok) {
          const data = await revenueRes.json();
          setRevenueData(data.data || data || []);
        }

        if (ordersStatusRes?.ok) {
          const data = await ordersStatusRes.json();
          setOrdersStatusData(data.data || data || []);
        }

        if (topItemsRes?.ok) {
          const data = await topItemsRes.json();
          setTopSellingItems(data.data || data || []);
        }

        if (recentOrdersRes?.ok) {
          const data = await recentOrdersRes.json();
          setRecentOrders(data.data || data || []);
        }

        // Admin: fetch top restaurants
        if (isAdminMode) {
          try {
            const topRestosRes = await fetch(`${API_URL}/dashboard/top-restaurants`, { headers });
            if (topRestosRes?.ok) {
              const data = await topRestosRes.json();
              setTopRestaurants(data.data || data || []);
            }
          } catch (e) {
            console.warn('Top restaurants fetch failed:', e);
          }
        }

        // Restaurant: fetch hourly orders
        if (isRestaurantMode) {
          try {
            const hourlyRes = await fetch(`${baseUrl}/hourly-orders`, { headers });
            if (hourlyRes?.ok) {
              const data = await hourlyRes.json();
              setHourlyOrders(data.data || data || null);
            }
          } catch (e) {
            console.warn('Hourly orders fetch failed:', e);
          }
        }
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(t('dashboard.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [
    isAdminMode, 
    isRestaurantMode, 
    restaurantId, 
    getHeaders, 
    API_URL, 
    t
  ]);

  // ============================================
  // 🔄 REFRESH INDIVIDUEL
  // ============================================
  const refreshKpis = useCallback(async () => {
    try {
      if (USE_MOCK) {
        const type = isAdminMode ? 'admin' : 'restaurant';
        const response = await dashboardAPI.getKpis(type);
        if (response.success) {
          setKpis(response.data.kpis);
        }
      } else {
        const headers = getHeaders();
        const baseUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/dashboard`
          : `${API_URL}/dashboard`;
        
        const res = await fetch(`${baseUrl}/stats`, { headers });
        if (res?.ok) {
          const data = await res.json();
          setKpis(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('KPIs refresh error:', err);
    }
  }, [isAdminMode, isRestaurantMode, restaurantId, getHeaders, API_URL]);

  const refreshRecentOrders = useCallback(async () => {
    try {
      if (USE_MOCK) {
        const type = isAdminMode ? 'admin' : 'restaurant';
        const response = await dashboardAPI.getRecentOrders(type);
        if (response.success) {
          setRecentOrders(response.data.orders);
        }
      } else {
        const headers = getHeaders();
        const ordersUrl = isRestaurantMode
          ? `${API_URL}/restaurants/${restaurantId}/orders?limit=10&sort=-createdAt`
          : `${API_URL}/orders?limit=10&sort=-createdAt`;
        
        const res = await fetch(ordersUrl, { headers });
        if (res?.ok) {
          const data = await res.json();
          setRecentOrders(data.data || data || []);
        }
      }
    } catch (err) {
      console.error('Recent orders refresh error:', err);
    }
  }, [isAdminMode, isRestaurantMode, restaurantId, getHeaders, API_URL]);

  // ============================================
  // 🚀 EFFECT
  // ============================================
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ============================================
  // 📤 RETURN
  // ============================================
  return {
    // Data
    kpis,
    revenueData,
    ordersStatusData,
    topSellingItems,
    recentOrders,
    topRestaurants,      // Admin only
    hourlyOrders,        // Restaurant only
    
    // States
    isLoading,
    error,
    
    // Mode info
    isAdminMode,
    isRestaurantMode,
    restaurantId,
    
    // Actions
    refresh: fetchDashboardData,
    refreshKpis,
    refreshRecentOrders,
    
    // Debug
    _isMockMode: USE_MOCK
  };
};

export default useDashboardData;