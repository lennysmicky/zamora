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