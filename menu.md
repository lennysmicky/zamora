// api/menus.js
import client from './client';

// ⚡ SWITCH ICI - mettre false pour utiliser le vrai backend
const USE_MOCK = true;

// Simuler délai réseau
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK DATA
// ============================================
let MOCK_CATEGORIES = [
  { id: 1, name: 'Burgers', slug: 'burgers', image: '/assets/images/food/burger.png', order: 1, isActive: true, itemsCount: 5 },
  { id: 2, name: 'Pizzas', slug: 'pizzas', image: '/assets/images/food/pizza.png', order: 2, isActive: true, itemsCount: 8 },
  { id: 3, name: 'Tacos', slug: 'tacos', image: '/assets/images/food/taco.png', order: 3, isActive: true, itemsCount: 4 },
  { id: 4, name: 'Accompagnements', slug: 'sides', image: '/assets/images/food/fries.png', order: 4, isActive: true, itemsCount: 6 },
  { id: 5, name: 'Boissons', slug: 'drinks', image: '/assets/images/food/drink.png', order: 5, isActive: true, itemsCount: 10 },
  { id: 6, name: 'Desserts', slug: 'desserts', image: '/assets/images/food/donut.png', order: 6, isActive: false, itemsCount: 3 }
];

let MOCK_MEALS = [
  {
    id: 1,
    name: 'Burger Classic',
    description: 'Boeuf, salade, tomate, oignon, sauce maison',
    price: 12.50,
    image: '/assets/images/food/burger.png',
    categoryId: 1,
    categoryName: 'Burgers',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    calories: 650,
    allergens: ['gluten', 'lactose'],
    options: [
      { id: 1, name: 'Double viande', price: 3.00 },
      { id: 2, name: 'Bacon', price: 1.50 },
      { id: 3, name: 'Fromage supplémentaire', price: 1.00 }
    ]
  },
  {
    id: 2,
    name: 'Burger Cheese',
    description: 'Boeuf, double cheddar, salade, sauce cheese',
    price: 14.00,
    image: '/assets/images/food/burger.png',
    categoryId: 1,
    categoryName: 'Burgers',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    calories: 780,
    allergens: ['gluten', 'lactose'],
    options: []
  },
  {
    id: 3,
    name: 'Pizza Margherita',
    description: 'Sauce tomate, mozzarella, basilic frais',
    price: 11.00,
    image: '/assets/images/food/pizza.png',
    categoryId: 2,
    categoryName: 'Pizzas',
    isAvailable: true,
    isPopular: false,
    preparationTime: 20,
    calories: 850,
    allergens: ['gluten', 'lactose'],
    options: [
      { id: 4, name: 'Grande taille', price: 4.00 },
      { id: 5, name: 'Bord farci', price: 2.50 }
    ]
  },
  {
    id: 4,
    name: 'Pizza 4 Fromages',
    description: 'Mozzarella, gorgonzola, chèvre, parmesan',
    price: 14.50,
    image: '/assets/images/food/pizza.png',
    categoryId: 2,
    categoryName: 'Pizzas',
    isAvailable: true,
    isPopular: true,
    preparationTime: 20,
    calories: 920,
    allergens: ['gluten', 'lactose'],
    options: []
  },
  {
    id: 5,
    name: 'Tacos Mexicain',
    description: 'Poulet, poivrons, oignons, sauce épicée',
    price: 10.50,
    image: '/assets/images/food/taco.png',
    categoryId: 3,
    categoryName: 'Tacos',
    isAvailable: true,
    isPopular: false,
    preparationTime: 12,
    calories: 480,
    allergens: ['gluten'],
    options: [
      { id: 6, name: 'Extra sauce', price: 0.50 },
      { id: 7, name: 'Guacamole', price: 2.00 }
    ]
  },
  {
    id: 6,
    name: 'Frites Maison',
    description: 'Frites croustillantes avec sel de mer',
    price: 4.50,
    image: '/assets/images/food/fries.png',
    categoryId: 4,
    categoryName: 'Accompagnements',
    isAvailable: true,
    isPopular: true,
    preparationTime: 8,
    calories: 320,
    allergens: [],
    options: [
      { id: 8, name: 'Sauce ketchup', price: 0.30 },
      { id: 9, name: 'Sauce mayo', price: 0.30 }
    ]
  },
  {
    id: 7,
    name: 'Coca Cola',
    description: 'Canette 33cl',
    price: 2.50,
    image: '/assets/images/food/drink.png',
    categoryId: 5,
    categoryName: 'Boissons',
    isAvailable: true,
    isPopular: false,
    preparationTime: 0,
    calories: 140,
    allergens: [],
    options: []
  },
  {
    id: 8,
    name: 'Donut Chocolat',
    description: 'Donut glacé au chocolat',
    price: 3.50,
    image: '/assets/images/food/donut.png',
    categoryId: 6,
    categoryName: 'Desserts',
    isAvailable: false,
    isPopular: false,
    preparationTime: 0,
    calories: 280,
    allergens: ['gluten', 'lactose', 'oeufs'],
    options: []
  },
  {
    id: 9,
    name: 'Hot Dog',
    description: 'Saucisse de boeuf, moutarde, ketchup, oignons',
    price: 8.00,
    image: '/assets/images/food/hotdog.png',
    categoryId: 1,
    categoryName: 'Burgers',
    isAvailable: true,
    isPopular: false,
    preparationTime: 10,
    calories: 420,
    allergens: ['gluten'],
    options: []
  },
  {
    id: 10,
    name: 'Ice Cream Vanille',
    description: '2 boules de glace vanille',
    price: 4.00,
    image: '/assets/images/food/icecream.png',
    categoryId: 6,
    categoryName: 'Desserts',
    isAvailable: true,
    isPopular: true,
    preparationTime: 2,
    calories: 220,
    allergens: ['lactose'],
    options: [
      { id: 10, name: 'Chantilly', price: 0.50 },
      { id: 11, name: 'Sauce chocolat', price: 0.50 }
    ]
  }
];

// ============================================
// 🎭 MOCK API FUNCTIONS
// ============================================
const mockMenusAPI = {
  // ============ CATEGORIES ============
  
  getCategories: async (restaurantId = null, filters = {}) => {
    await mockDelay(500);
    
    let categories = [...MOCK_CATEGORIES];
    
    // Filtrer par statut
    if (filters.isActive !== undefined) {
      categories = categories.filter(c => c.isActive === filters.isActive);
    }
    
    // Tri
    categories.sort((a, b) => a.order - b.order);
    
    return {
      success: true,
      data: { categories }
    };
  },

  getCategoryById: async (categoryId) => {
    await mockDelay(300);
    
    const category = MOCK_CATEGORIES.find(c => c.id === Number(categoryId));
    
    if (!category) {
      throw new Error('menus.errors.categoryNotFound');
    }
    
    return {
      success: true,
      data: { category }
    };
  },

  createCategory: async (data) => {
    await mockDelay(600);
    
    if (!data.name) {
      throw new Error('menus.errors.categoryNameRequired');
    }
    
    const newCategory = {
      id: Date.now(),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      image: data.image || null,
      order: MOCK_CATEGORIES.length + 1,
      isActive: data.isActive ?? true,
      itemsCount: 0
    };
    
    MOCK_CATEGORIES.push(newCategory);
    
    return {
      success: true,
      data: { category: newCategory },
      messageKey: 'menus.messages.categoryCreated'
    };
  },

  updateCategory: async (categoryId, data) => {
    await mockDelay(500);
    
    const index = MOCK_CATEGORIES.findIndex(c => c.id === Number(categoryId));
    
    if (index === -1) {
      throw new Error('menus.errors.categoryNotFound');
    }
    
    MOCK_CATEGORIES[index] = {
      ...MOCK_CATEGORIES[index],
      ...data,
      slug: data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : MOCK_CATEGORIES[index].slug
    };
    
    return {
      success: true,
      data: { category: MOCK_CATEGORIES[index] },
      messageKey: 'menus.messages.categoryUpdated'
    };
  },

  deleteCategory: async (categoryId) => {
    await mockDelay(400);
    
    const index = MOCK_CATEGORIES.findIndex(c => c.id === Number(categoryId));
    
    if (index === -1) {
      throw new Error('menus.errors.categoryNotFound');
    }
    
    // Vérifier si des plats existent dans cette catégorie
    const mealsInCategory = MOCK_MEALS.filter(m => m.categoryId === Number(categoryId));
    if (mealsInCategory.length > 0) {
      throw new Error('menus.errors.categoryHasMeals');
    }
    
    MOCK_CATEGORIES.splice(index, 1);
    
    return {
      success: true,
      messageKey: 'menus.messages.categoryDeleted'
    };
  },

  reorderCategories: async (orderedIds) => {
    await mockDelay(400);
    
    orderedIds.forEach((id, index) => {
      const category = MOCK_CATEGORIES.find(c => c.id === id);
      if (category) {
        category.order = index + 1;
      }
    });
    
    return {
      success: true,
      messageKey: 'menus.messages.categoriesReordered'
    };
  },

  // ============ MEALS ============
  
  getMeals: async (restaurantId = null, filters = {}) => {
    await mockDelay(600);
    
    let meals = [...MOCK_MEALS];
    
    // Filtrer par catégorie
    if (filters.categoryId) {
      meals = meals.filter(m => m.categoryId === Number(filters.categoryId));
    }
    
    // Filtrer par disponibilité
    if (filters.isAvailable !== undefined) {
      meals = meals.filter(m => m.isAvailable === filters.isAvailable);
    }
    
    // Filtrer par popularité
    if (filters.isPopular !== undefined) {
      meals = meals.filter(m => m.isPopular === filters.isPopular);
    }
    
    // Recherche par nom
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      meals = meals.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedMeals = meals.slice(startIndex, startIndex + limit);
    
    return {
      success: true,
      data: {
        meals: paginatedMeals,
        pagination: {
          total: meals.length,
          page,
          limit,
          totalPages: Math.ceil(meals.length / limit)
        }
      }
    };
  },

  getMealById: async (mealId) => {
    await mockDelay(300);
    
    const meal = MOCK_MEALS.find(m => m.id === Number(mealId));
    
    if (!meal) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    return {
      success: true,
      data: { meal }
    };
  },

  getMealsByCategory: async (categoryId) => {
    await mockDelay(500);
    
    const meals = MOCK_MEALS.filter(m => m.categoryId === Number(categoryId));
    
    return {
      success: true,
      data: { meals }
    };
  },

  createMeal: async (data) => {
    await mockDelay(700);
    
    if (!data.name || !data.price || !data.categoryId) {
      throw new Error('menus.errors.mealRequiredFields');
    }
    
    const category = MOCK_CATEGORIES.find(c => c.id === Number(data.categoryId));
    if (!category) {
      throw new Error('menus.errors.categoryNotFound');
    }
    
    const newMeal = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      image: data.image || null,
      categoryId: Number(data.categoryId),
      categoryName: category.name,
      isAvailable: data.isAvailable ?? true,
      isPopular: data.isPopular ?? false,
      preparationTime: data.preparationTime || 15,
      calories: data.calories || null,
      allergens: data.allergens || [],
      options: data.options || []
    };
    
    MOCK_MEALS.push(newMeal);
    
    // Mettre à jour le compteur de la catégorie
    category.itemsCount++;
    
    return {
      success: true,
      data: { meal: newMeal },
      messageKey: 'menus.messages.mealCreated'
    };
  },

  updateMeal: async (mealId, data) => {
    await mockDelay(600);
    
    const index = MOCK_MEALS.findIndex(m => m.id === Number(mealId));
    
    if (index === -1) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    // Si changement de catégorie
    if (data.categoryId && data.categoryId !== MOCK_MEALS[index].categoryId) {
      const oldCategory = MOCK_CATEGORIES.find(c => c.id === MOCK_MEALS[index].categoryId);
      const newCategory = MOCK_CATEGORIES.find(c => c.id === Number(data.categoryId));
      
      if (!newCategory) {
        throw new Error('menus.errors.categoryNotFound');
      }
      
      if (oldCategory) oldCategory.itemsCount--;
      newCategory.itemsCount++;
      
      data.categoryName = newCategory.name;
    }
    
    MOCK_MEALS[index] = {
      ...MOCK_MEALS[index],
      ...data,
      price: data.price ? Number(data.price) : MOCK_MEALS[index].price
    };
    
    return {
      success: true,
      data: { meal: MOCK_MEALS[index] },
      messageKey: 'menus.messages.mealUpdated'
    };
  },

  deleteMeal: async (mealId) => {
    await mockDelay(400);
    
    const index = MOCK_MEALS.findIndex(m => m.id === Number(mealId));
    
    if (index === -1) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    const meal = MOCK_MEALS[index];
    
    // Mettre à jour le compteur de la catégorie
    const category = MOCK_CATEGORIES.find(c => c.id === meal.categoryId);
    if (category) {
      category.itemsCount--;
    }
    
    MOCK_MEALS.splice(index, 1);
    
    return {
      success: true,
      messageKey: 'menus.messages.mealDeleted'
    };
  },

  toggleMealAvailability: async (mealId) => {
    await mockDelay(300);
    
    const meal = MOCK_MEALS.find(m => m.id === Number(mealId));
    
    if (!meal) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    meal.isAvailable = !meal.isAvailable;
    
    return {
      success: true,
      data: { meal },
      messageKey: meal.isAvailable 
        ? 'menus.messages.mealEnabled' 
        : 'menus.messages.mealDisabled'
    };
  },

  toggleMealPopular: async (mealId) => {
    await mockDelay(300);
    
    const meal = MOCK_MEALS.find(m => m.id === Number(mealId));
    
    if (!meal) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    meal.isPopular = !meal.isPopular;
    
    return {
      success: true,
      data: { meal },
      messageKey: meal.isPopular 
        ? 'menus.messages.mealMarkedPopular' 
        : 'menus.messages.mealUnmarkedPopular'
    };
  },

  // ============ OPTIONS ============
  
  addMealOption: async (mealId, option) => {
    await mockDelay(400);
    
    const meal = MOCK_MEALS.find(m => m.id === Number(mealId));
    
    if (!meal) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    const newOption = {
      id: Date.now(),
      name: option.name,
      price: Number(option.price)
    };
    
    meal.options.push(newOption);
    
    return {
      success: true,
      data: { option: newOption },
      messageKey: 'menus.messages.optionAdded'
    };
  },

  removeMealOption: async (mealId, optionId) => {
    await mockDelay(300);
    
    const meal = MOCK_MEALS.find(m => m.id === Number(mealId));
    
    if (!meal) {
      throw new Error('menus.errors.mealNotFound');
    }
    
    const optionIndex = meal.options.findIndex(o => o.id === Number(optionId));
    
    if (optionIndex === -1) {
      throw new Error('menus.errors.optionNotFound');
    }
    
    meal.options.splice(optionIndex, 1);
    
    return {
      success: true,
      messageKey: 'menus.messages.optionRemoved'
    };
  },

  // ============ BULK ACTIONS ============
  
  bulkDeleteMeals: async (mealIds) => {
    await mockDelay(600);
    
    mealIds.forEach(id => {
      const index = MOCK_MEALS.findIndex(m => m.id === Number(id));
      if (index !== -1) {
        const meal = MOCK_MEALS[index];
        const category = MOCK_CATEGORIES.find(c => c.id === meal.categoryId);
        if (category) category.itemsCount--;
        MOCK_MEALS.splice(index, 1);
      }
    });
    
    return {
      success: true,
      messageKey: 'menus.messages.mealsDeleted'
    };
  },

  bulkToggleAvailability: async (mealIds, isAvailable) => {
    await mockDelay(500);
    
    mealIds.forEach(id => {
      const meal = MOCK_MEALS.find(m => m.id === Number(id));
      if (meal) {
        meal.isAvailable = isAvailable;
      }
    });
    
    return {
      success: true,
      messageKey: isAvailable 
        ? 'menus.messages.mealsEnabled' 
        : 'menus.messages.mealsDisabled'
    };
  }
};

// ============================================
// 🌐 REAL API FUNCTIONS
// ============================================
const realMenusAPI = {
  // Categories
  getCategories: async (restaurantId = null, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = restaurantId 
      ? `/restaurants/${restaurantId}/categories` 
      : '/categories';
    const response = await client.get(`${endpoint}?${params}`);
    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await client.get(`/categories/${categoryId}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await client.post('/categories', data);
    return response.data;
  },

  updateCategory: async (categoryId, data) => {
    const response = await client.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await client.delete(`/categories/${categoryId}`);
    return response.data;
  },

  reorderCategories: async (orderedIds) => {
    const response = await client.post('/categories/reorder', { orderedIds });
    return response.data;
  },

  // Meals
  getMeals: async (restaurantId = null, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = restaurantId 
      ? `/restaurants/${restaurantId}/meals` 
      : '/meals';
    const response = await client.get(`${endpoint}?${params}`);
    return response.data;
  },

  getMealById: async (mealId) => {
    const response = await client.get(`/meals/${mealId}`);
    return response.data;
  },

  getMealsByCategory: async (categoryId) => {
    const response = await client.get(`/categories/${categoryId}/meals`);
    return response.data;
  },

  createMeal: async (data) => {
    const response = await client.post('/meals', data);
    return response.data;
  },

  updateMeal: async (mealId, data) => {
    const response = await client.put(`/meals/${mealId}`, data);
    return response.data;
  },

  deleteMeal: async (mealId) => {
    const response = await client.delete(`/meals/${mealId}`);
    return response.data;
  },

  toggleMealAvailability: async (mealId) => {
    const response = await client.patch(`/meals/${mealId}/toggle-availability`);
    return response.data;
  },

  toggleMealPopular: async (mealId) => {
    const response = await client.patch(`/meals/${mealId}/toggle-popular`);
    return response.data;
  },

  addMealOption: async (mealId, option) => {
    const response = await client.post(`/meals/${mealId}/options`, option);
    return response.data;
  },

  removeMealOption: async (mealId, optionId) => {
    const response = await client.delete(`/meals/${mealId}/options/${optionId}`);
    return response.data;
  },

  bulkDeleteMeals: async (mealIds) => {
    const response = await client.post('/meals/bulk-delete', { mealIds });
    return response.data;
  },

  bulkToggleAvailability: async (mealIds, isAvailable) => {
    const response = await client.post('/meals/bulk-toggle-availability', { mealIds, isAvailable });
    return response.data;
  }
};

// ============================================
// 📤 EXPORT
// ============================================
const menusAPI = USE_MOCK ? mockMenusAPI : realMenusAPI;

export const {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  
  // Meals
  getMeals,
  getMealById,
  getMealsByCategory,
  createMeal,
  updateMeal,
  deleteMeal,
  toggleMealAvailability,
  toggleMealPopular,
  addMealOption,
  removeMealOption,
  bulkDeleteMeals,
  bulkToggleAvailability
} = menusAPI;

export default menusAPI;

##
 // src/hooks/useMenusData.js
import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../stores/authStore';

export const useMenusData = () => {
  const { token, restaurantId } = useAuthStore();
  
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // MODE TEST - Mettre à false quand backend prêt
  const useMockData = true;

  // ========================================
  // FETCH CATEGORIES
  // ========================================
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockCategories = [
          { id: 1, name: 'Entrées', description: 'Nos entrées fraîches', order: 1, isActive: true },
          { id: 2, name: 'Plats', description: 'Plats principaux', order: 2, isActive: true },
          { id: 3, name: 'Desserts', description: 'Nos desserts maison', order: 3, isActive: true },
          { id: 4, name: 'Boissons', description: 'Boissons fraîches et chaudes', order: 4, isActive: true },
          { id: 5, name: 'Snacks', description: 'Encas rapides', order: 5, isActive: false }
        ];
        
        setCategories(mockCategories);
        if (mockCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(mockCategories[0]);
        }
        setIsLoading(false);
        return;
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');

      const data = await response.json();
      setCategories(data.data || data || []);
      
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
      }

    } catch (err) {
      console.error('Erreur fetchCategories:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, restaurantId, token, useMockData, selectedCategory]);

  // ========================================
  // FETCH MEALS BY CATEGORY
  // ========================================
  const fetchMeals = useCallback(async (categoryId) => {
    if (!categoryId) return;

    setIsLoading(true);
    setError(null);

    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allMockMeals = [
          // Entrées
          { id: 1, categoryId: 1, name: 'Salade César', description: 'Laitue, parmesan, croûtons', price: 45, isAvailable: true, image: null },
          { id: 2, categoryId: 1, name: 'Soupe du jour', description: 'Soupe fraîche maison', price: 35, isAvailable: true, image: null },
          // Plats
          { id: 3, categoryId: 2, name: 'Burger Classic', description: 'Boeuf, cheddar, salade, tomate', price: 75, isAvailable: true, image: null },
          { id: 4, categoryId: 2, name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic', price: 65, isAvailable: true, image: null },
          { id: 5, categoryId: 2, name: 'Poulet Grillé', description: 'Poulet mariné aux herbes', price: 85, isAvailable: false, image: null },
          // Desserts
          { id: 6, categoryId: 3, name: 'Tiramisu', description: 'Mascarpone, café, cacao', price: 40, isAvailable: true, image: null },
          { id: 7, categoryId: 3, name: 'Crème Brûlée', description: 'Vanille de Madagascar', price: 38, isAvailable: true, image: null },
          // Boissons
          { id: 8, categoryId: 4, name: 'Coca-Cola', description: '33cl', price: 15, isAvailable: true, image: null },
          { id: 9, categoryId: 4, name: 'Jus d\'orange', description: 'Frais pressé', price: 20, isAvailable: true, image: null },
          { id: 10, categoryId: 4, name: 'Café', description: 'Expresso ou allongé', price: 12, isAvailable: true, image: null }
        ];
        
        const filteredMeals = allMockMeals.filter(meal => meal.categoryId === categoryId);
        setMeals(filteredMeals);
        setIsLoading(false);
        return;
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories/${categoryId}/meals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des plats');

      const data = await response.json();
      setMeals(data.data || data || []);

    } catch (err) {
      console.error('Erreur fetchMeals:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, restaurantId, token, useMockData]);

  // ========================================
  // CRUD CATEGORIES
  // ========================================
  const addCategory = async (categoryData) => {
    try {
      // MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newCategory = {
          id: Date.now(),
          ...categoryData,
          isActive: categoryData.isActive ?? true
        };
        setCategories(prev => [...prev, newCategory]);
        return { success: true, data: newCategory };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout de la catégorie');

      const data = await response.json();
      setCategories(prev => [...prev, data]);
      return { success: true, data };

    } catch (err) {
      console.error('Erreur addCategory:', err);
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCategories(prev => 
          prev.map(cat => cat.id === categoryId ? { ...cat, ...categoryData } : cat)
        );
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(prev => ({ ...prev, ...categoryData }));
        }
        return { success: true };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) throw new Error('Erreur lors de la modification de la catégorie');

      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? { ...cat, ...categoryData } : cat)
      );
      
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(prev => ({ ...prev, ...categoryData }));
      }

      return { success: true };

    } catch (err) {
      console.error('Erreur updateCategory:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      // 🧪 MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null);
          setMeals([]);
        }
        return { success: true };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression de la catégorie');

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setMeals([]);
      }

      return { success: true };

    } catch (err) {
      console.error('Erreur deleteCategory:', err);
      return { success: false, error: err.message };
    }
  };

  // ========================================
  // CRUD MEALS
  // ========================================
  const addMeal = async (mealData) => {
    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newMeal = {
          id: Date.now(),
          ...mealData,
          isAvailable: mealData.isAvailable ?? true
        };
        setMeals(prev => [...prev, newMeal]);
        return { success: true, data: newMeal };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mealData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout du plat');

      const data = await response.json();
      setMeals(prev => [...prev, data]);
      return { success: true, data };

    } catch (err) {
      console.error('Erreur addMeal:', err);
      return { success: false, error: err.message };
    }
  };

  const updateMeal = async (mealId, mealData) => {
    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setMeals(prev => 
          prev.map(meal => meal.id === mealId ? { ...meal, ...mealData } : meal)
        );
        return { success: true };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/meals/${mealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mealData)
      });

      if (!response.ok) throw new Error('Erreur lors de la modification du plat');

      setMeals(prev => 
        prev.map(meal => meal.id === mealId ? { ...meal, ...mealData } : meal)
      );

      return { success: true };

    } catch (err) {
      console.error('Erreur updateMeal:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      //  MODE MOCK
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setMeals(prev => prev.filter(meal => meal.id !== mealId));
        return { success: true };
      }
      // FIN MODE MOCK

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression du plat');

      setMeals(prev => prev.filter(meal => meal.id !== mealId));

      return { success: true };

    } catch (err) {
      console.error('Erreur deleteMeal:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleMealAvailability = async (mealId) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return { success: false, error: 'Plat non trouvé' };

    return await updateMeal(mealId, { isAvailable: !meal.isAvailable });
  };

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory?.id) {
      fetchMeals(selectedCategory.id);
    }
  }, [selectedCategory?.id, fetchMeals]);

  // ========================================
  // RETURN
  // ========================================
  return {
    // Data
    categories,
    meals,
    selectedCategory,
    isLoading,
    error,

    // Actions Categories
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,

    // Actions Meals
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealAvailability,

    // Refresh
    refreshCategories: fetchCategories,
    refreshMeals: () => fetchMeals(selectedCategory?.id)
  };
};

export default useMenusData;