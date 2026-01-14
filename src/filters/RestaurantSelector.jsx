// src/filters/RestaurantSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RiStoreLine, RiArrowDownSLine, RiCheckLine, RiSearchLine } from 'react-icons/ri';


const RestaurantSelector = ({ 
  selectedRestaurant, 
  onSelectRestaurant,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 🧪 MODE MOCK - Mettre à false quand backend prêt
  const useMockData = true;

  // Charger les restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      
      try {
        if (useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setRestaurants([
            { id: null, name: t('filters.allRestaurants') },
            { id: 1, name: 'Chez Ahmed - Fast Food' },
            { id: 2, name: 'Pizza Palace' },
            { id: 3, name: 'Burger King Express' },
            { id: 4, name: 'Le Petit Bistro' },
            { id: 5, name: 'Taco Loco' },
            { id: 6, name: 'Sushi Master' },
            { id: 7, name: 'La Bonne Cuisine' }
          ]);
        } else {
          // TODO: Appel API
          const response = await fetch('/api/restaurants');
          const data = await response.json();
          setRestaurants([
            { id: null, name: t('filters.allRestaurants') },
            ...data
          ]);
        }
      } catch (error) {
        console.error('Erreur chargement restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [useMockData, t]);

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer restaurants par recherche
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sélectionner un restaurant
  const handleSelect = (restaurant) => {
    onSelectRestaurant(restaurant);
    setIsOpen(false);
    setSearch('');
  };

  // Label affiché
  const displayLabel = selectedRestaurant?.name || t('filters.allRestaurants');

  return (
    <div className={`filter-dropdown ${className}`} ref={dropdownRef}>
      <button 
        className={`filter-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <RiStoreLine className="filter-icon" />
        <span className="filter-label">{displayLabel}</span>
        <RiArrowDownSLine className={`filter-arrow ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="filter-menu">
          {/* Recherche */}
          <div className="filter-search">
            <RiSearchLine />
            <input
              type="text"
              placeholder={t('filters.searchRestaurant')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Liste */}
          <div className="filter-list">
            {isLoading ? (
              <div className="filter-loading">
                <span className="filter-spinner"></span>
                <span>{t('common.loading')}</span>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="filter-empty">
                {t('filters.noResults')}
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id || 'all'}
                  className={`filter-item ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(restaurant)}
                >
                  <span>{restaurant.name}</span>
                  {selectedRestaurant?.id === restaurant.id && (
                    <RiCheckLine className="filter-check" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSelector;