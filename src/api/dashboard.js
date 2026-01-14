// api/dashboard.js
import client from './client';

//  SWITCH ICI - mettre false pour utiliser le vrai backend
const USE_MOCK = false;

// Simuler délai réseau
const mockDelay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK DATA
// ============================================
const MOCK_DASHBOARD_DATA = {
  admin: {
    kpis: {
      totalRevenue: 125750.50,
      totalOrders: 1847,
      totalCustomers: 523,
      totalRestaurants: 45,
      activeRestaurants: 38,
      pendingOrders: 23,
      todayRevenue: 4520.00,
      todayOrders: 67,
      growthRevenue: 12.5,
      growthOrders: 8.3,
      growthCustomers: 15.2
    },
    revenueChart: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [
        {
          label: 'Revenus',
          data: [12500, 15200, 18700, 16400, 21300, 25750]
        }
      ]
    },
    ordersStatusChart: {
      labels: ['Livrées', 'En cours', 'En attente', 'Annulées'],
      data: [1520, 180, 97, 50],
      colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
    },
    topSellingItems: [
      { id: 1, name: 'Burger Classic', quantity: 342, revenue: 5130.00, image: '/assets/images/food/burger.png' },
      { id: 2, name: 'Pizza Margherita', quantity: 287, revenue: 4305.00, image: '/assets/images/food/pizza.png' },
      { id: 3, name: 'Tacos Mexicain', quantity: 256, revenue: 3072.00, image: '/assets/images/food/taco.png' },
      { id: 4, name: 'Frites Maison', quantity: 234, revenue: 1170.00, image: '/assets/images/food/fries.png' },
      { id: 5, name: 'Hot Dog', quantity: 198, revenue: 1584.00, image: '/assets/images/food/hotdog.png' }
    ],
    recentOrders: [
      {
        id: 'ORD-001',
        customer: 'Jean Dupont',
        restaurant: 'Le Gourmet',
        total: 45.50,
        status: 'delivered',
        date: '2024-01-15T14:30:00Z'
      },
      {
        id: 'ORD-002',
        customer: 'Marie Claire',
        restaurant: 'Pizza Roma',
        total: 32.00,
        status: 'in_progress',
        date: '2024-01-15T14:15:00Z'
      },
      {
        id: 'ORD-003',
        customer: 'Pierre Martin',
        restaurant: 'Burger House',
        total: 28.75,
        status: 'pending',
        date: '2024-01-15T14:00:00Z'
      },
      {
        id: 'ORD-004',
        customer: 'Sophie Bernard',
        restaurant: 'Taco Loco',
        total: 52.25,
        status: 'delivered',
        date: '2024-01-15T13:45:00Z'
      },
      {
        id: 'ORD-005',
        customer: 'Lucas Petit',
        restaurant: 'Le Gourmet',
        total: 67.00,
        status: 'cancelled',
        date: '2024-01-15T13:30:00Z'
      }
    ],
    topRestaurants: [
      { id: 1, name: 'Le Gourmet', orders: 245, revenue: 12500.00, rating: 4.8 },
      { id: 2, name: 'Pizza Roma', orders: 198, revenue: 9800.00, rating: 4.6 },
      { id: 3, name: 'Burger House', orders: 176, revenue: 8200.00, rating: 4.5 },
      { id: 4, name: 'Taco Loco', orders: 154, revenue: 7100.00, rating: 4.7 },
      { id: 5, name: 'Sushi Master', orders: 132, revenue: 9500.00, rating: 4.9 }
    ]
  },
  restaurant: {
    kpis: {
      todayRevenue: 850.50,
      todayOrders: 24,
      pendingOrders: 5,
      inProgressOrders: 8,
      completedOrders: 11,
      cancelledOrders: 0,
      weeklyRevenue: 5420.00,
      monthlyRevenue: 18750.00,
      averageOrderValue: 35.44,
      growthRevenue: 8.5,
      growthOrders: 12.0
    },
    revenueChart: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Revenus',
          data: [650, 720, 580, 890, 1200, 1450, 930]
        }
      ]
    },
    ordersStatusChart: {
      labels: ['Livrées', 'En cours', 'En attente', 'Annulées'],
      data: [156, 8, 5, 3],
      colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
    },
    topSellingItems: [
      { id: 1, name: 'Burger Classic', quantity: 87, revenue: 1305.00, image: '/assets/images/food/burger.png' },
      { id: 2, name: 'Frites Maison', quantity: 76, revenue: 380.00, image: '/assets/images/food/fries.png' },
      { id: 3, name: 'Coca Cola', quantity: 65, revenue: 195.00, image: '/assets/images/food/drink.png' },
      { id: 4, name: 'Burger Cheese', quantity: 54, revenue: 918.00, image: '/assets/images/food/burger.png' },
      { id: 5, name: 'Ice Cream', quantity: 43, revenue: 215.00, image: '/assets/images/food/icecream.png' }
    ],
    recentOrders: [
      {
        id: 'ORD-101',
        customer: 'Jean Dupont',
        total: 45.50,
        status: 'in_progress',
        items: 3,
        date: '2024-01-15T14:30:00Z'
      },
      {
        id: 'ORD-102',
        customer: 'Marie Claire',
        total: 32.00,
        status: 'pending',
        items: 2,
        date: '2024-01-15T14:25:00Z'
      },
      {
        id: 'ORD-103',
        customer: 'Pierre Martin',
        total: 28.75,
        status: 'pending',
        items: 2,
        date: '2024-01-15T14:20:00Z'
      },
      {
        id: 'ORD-104',
        customer: 'Sophie Bernard',
        total: 52.25,
        status: 'delivered',
        items: 4,
        date: '2024-01-15T14:10:00Z'
      },
      {
        id: 'ORD-105',
        customer: 'Lucas Petit',
        total: 67.00,
        status: 'delivered',
        items: 5,
        date: '2024-01-15T14:00:00Z'
      }
    ],
    hourlyOrders: {
      labels: ['10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h'],
      data: [2, 5, 12, 15, 8, 4, 3, 6, 14, 18, 12, 5]
    }
  }
};

// ============================================
// 🎭 MOCK API FUNCTIONS
// ============================================
const mockDashboardAPI = {
  // Dashboard Admin
  getAdminDashboard: async (filters = {}) => {
    await mockDelay(800);
    
    let data = { ...MOCK_DASHBOARD_DATA.admin };
    
    // Simuler filtrage par date
    if (filters.startDate || filters.endDate) {
      // Juste retourner les mêmes données pour le mock
      console.log('Mock: Filtering by date', filters);
    }
    
    // Simuler filtrage par restaurant
    if (filters.restaurantId) {
      console.log('Mock: Filtering by restaurant', filters.restaurantId);
    }
    
    return {
      success: true,
      data
    };
  },

  // Dashboard Restaurant
  getRestaurantDashboard: async (restaurantId, filters = {}) => {
    await mockDelay(700);
    
    let data = { ...MOCK_DASHBOARD_DATA.restaurant };
    
    if (filters.period === 'week') {
      data.kpis.todayRevenue = data.kpis.weeklyRevenue;
      data.kpis.todayOrders = 168;
    } else if (filters.period === 'month') {
      data.kpis.todayRevenue = data.kpis.monthlyRevenue;
      data.kpis.todayOrders = 534;
    }
    
    return {
      success: true,
      data
    };
  },

  // KPIs seulement
  getKpis: async (type = 'admin', filters = {}) => {
    await mockDelay(400);
    
    const kpis = type === 'admin' 
      ? MOCK_DASHBOARD_DATA.admin.kpis 
      : MOCK_DASHBOARD_DATA.restaurant.kpis;
    
    return {
      success: true,
      data: { kpis }
    };
  },

  // Revenue Chart
  getRevenueChart: async (type = 'admin', period = 'month') => {
    await mockDelay(500);
    
    const chart = type === 'admin'
      ? MOCK_DASHBOARD_DATA.admin.revenueChart
      : MOCK_DASHBOARD_DATA.restaurant.revenueChart;
    
    return {
      success: true,
      data: { chart }
    };
  },

  // Orders Status Chart
  getOrdersStatusChart: async (type = 'admin', filters = {}) => {
    await mockDelay(400);
    
    const chart = type === 'admin'
      ? MOCK_DASHBOARD_DATA.admin.ordersStatusChart
      : MOCK_DASHBOARD_DATA.restaurant.ordersStatusChart;
    
    return {
      success: true,
      data: { chart }
    };
  },

  // Top Selling Items
  getTopSellingItems: async (type = 'admin', limit = 5) => {
    await mockDelay(500);
    
    const items = type === 'admin'
      ? MOCK_DASHBOARD_DATA.admin.topSellingItems
      : MOCK_DASHBOARD_DATA.restaurant.topSellingItems;
    
    return {
      success: true,
      data: { items: items.slice(0, limit) }
    };
  },

  // Recent Orders
  getRecentOrders: async (type = 'admin', limit = 5) => {
    await mockDelay(450);
    
    const orders = type === 'admin'
      ? MOCK_DASHBOARD_DATA.admin.recentOrders
      : MOCK_DASHBOARD_DATA.restaurant.recentOrders;
    
    return {
      success: true,
      data: { orders: orders.slice(0, limit) }
    };
  },

  // Top Restaurants (Admin only)
  getTopRestaurants: async (limit = 5) => {
    await mockDelay(500);
    
    return {
      success: true,
      data: { 
        restaurants: MOCK_DASHBOARD_DATA.admin.topRestaurants.slice(0, limit) 
      }
    };
  },

  // Hourly Orders (Restaurant only)
  getHourlyOrders: async (restaurantId, date = null) => {
    await mockDelay(400);
    
    return {
      success: true,
      data: { 
        hourlyOrders: MOCK_DASHBOARD_DATA.restaurant.hourlyOrders 
      }
    };
  }
};

// ============================================
// 🌐 REAL API FUNCTIONS
// ============================================
const realDashboardAPI = {
  getAdminDashboard: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await client.get(`/dashboard?${params}`);
    return response.data;
  },

  getRestaurantDashboard: async (restaurantId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await client.get(`/restaurant/${restaurantId}/dashboard?${params}`);
    return response.data;
  },

  getKpis: async (type = 'admin', filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = type === 'admin' ? '/kpis' : '/restaurant/kpis';
    const response = await client.get(`${endpoint}?${params}`);
    return response.data;
  },

  getRevenueChart: async (type = 'admin', period = 'month') => {
    const endpoint = type === 'admin' ? '/charts/revenue' : '/restaurant/charts/revenue';
    const response = await client.get(`${endpoint}?period=${period}`);
    return response.data;
  },

  getOrdersStatusChart: async (type = 'admin', filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = type === 'admin' ? '/charts/orders-status' : '/restaurant/charts/orders-status';
    const response = await client.get(`${endpoint}?${params}`);
    return response.data;
  },

  getTopSellingItems: async (type = 'admin', limit = 5) => {
    const endpoint = type === 'admin' ? '/top-items' : '/restaurant/top-items';
    const response = await client.get(`${endpoint}?limit=${limit}`);
    return response.data;
  },

  getRecentOrders: async (type = 'admin', limit = 5) => {
    const endpoint = type === 'admin' ? '/recent-orders' : '/restaurant/recent-orders';
    const response = await client.get(`${endpoint}?limit=${limit}`);
    return response.data;
  },

  getTopRestaurants: async (limit = 5) => {
    const response = await client.get(`/top-restaurants?limit=${limit}`);
    return response.data;
  },

  getHourlyOrders: async (restaurantId, date = null) => {
    const params = date ? `?date=${date}` : '';
    const response = await client.get(`/restaurant/${restaurantId}/hourly-orders${params}`);
    return response.data;
  }
};

// ============================================
// 📤 EXPORT
// ============================================
const dashboardAPI = USE_MOCK ? mockDashboardAPI : realDashboardAPI;

export const {
  getAdminDashboard,
  getRestaurantDashboard,
  getKpis,
  getRevenueChart,
  getOrdersStatusChart,
  getTopSellingItems,
  getRecentOrders,
  getTopRestaurants,
  getHourlyOrders
} = dashboardAPI;

export default dashboardAPI;