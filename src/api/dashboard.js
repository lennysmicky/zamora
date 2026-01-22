// src/api/dashboard.js
import client from './client';

// ======================================================
// Utils
// ======================================================
const buildQuery = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ).toString();

// ======================================================
// DASHBOARD API (REAL BACKEND ONLY)
// ======================================================
const dashboardAPI = {
  /**
   * ============================
   * DASHBOARD PRINCIPAL
   * ============================
   */

  // ADMIN : voit tout
  getAdminDashboard: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/admin?${query}`);
    return data;
  },

  // RESTAURANT : basé sur le token
  getRestaurantDashboard: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/restaurant?${query}`);
    return data;
  },

  /**
   * ============================
   * KPI
   * ============================
   */
  getKpis: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/kpis?${query}`);
    return data;
  },

  /**
   * ============================
   * CHARTS
   * ============================
   */
  getRevenueChart: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/charts/revenue?${query}`);
    return data;
  },

  getOrdersStatusChart: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/charts/orders-status?${query}`);
    return data;
  },

  /**
   * ============================
   * LISTES
   * ============================
   */
  getTopSellingItems: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/top-items?${query}`);
    return data;
  },

  getRecentOrders: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/recent-orders?${query}`);
    return data;
  },

  /**
   * ============================
   * ADMIN ONLY
   * ============================
   */
  getTopRestaurants: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/top-restaurants?${query}`);
    return data;
  },

  /**
   * ============================
   * RESTAURANT ONLY
   * ============================
   */
  getHourlyOrders: async (filters = {}) => {
    const query = buildQuery(filters);
    const { data } = await client.get(`/dashboard/hourly-orders?${query}`);
    return data;
  }
};

export default dashboardAPI;
