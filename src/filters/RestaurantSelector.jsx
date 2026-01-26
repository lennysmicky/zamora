// src/filters/RestaurantSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RiStoreLine, RiArrowDownSLine, RiCheckLine, RiSearchLine } from 'react-icons/ri';
import './Filters.css'

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

  // Charger les restaurants depuis le backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/restaurants`, {
          headers: {
            'Content-Type': 'application/json',
            // Si auth token nécessaire
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (!response.ok) throw new Error('Erreur réseau');

        const data = await response.json();
        setRestaurants([
          { id: null, name: t('filters.allRestaurants') },
          ...data
        ]);
      } catch (error) {
        console.error('Erreur chargement restaurants:', error);
        setRestaurants([{ id: null, name: t('filters.allRestaurants') }]); // fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [t]);

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
