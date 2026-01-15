import { useEffect, useState } from 'react';

export const usePromotions = (restaurantId) => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    setIsLoading(true);

    setTimeout(() => {
      setPromotions([
        {
          id: 1,
          title: 'Promo Pizza',
          description: 'Réduction de 20%',
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          active: true,
        },
        {
          id: 2,
          title: 'Menu Étudiant',
          description: 'Menu à prix réduit',
          startDate: '2026-01-05',
          endDate: '2026-01-31',
          active: false,
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, [restaurantId]);

  const createPromotion = (newPromo) => {
    setPromotions((prev) => [
      ...prev,
      {
        ...newPromo,
        id: Date.now(),
        active: true, 
      },
    ]);
  };

  const updatePromotion = (id, updatedData) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deletePromotion = (id) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePromotionStatus = (id) => {
    setPromotions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  return {
    promotions,
    isLoading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
  };
};
