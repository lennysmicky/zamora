// src/filters/RestaurantSelector.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiStoreLine, RiArrowDownSLine, RiCheckLine, RiSearchLine } from "react-icons/ri";
import client from "../api/client";
import "./Filters.css";

const RestaurantSelector = ({ selectedRestaurant, onSelectRestaurant, className = "" }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Charger les restaurants (anti double-call DEV + abort + timeout local)
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const { data } = await client.get("/restaurent", {
          signal: controller.signal,
          timeout: 10000, // évite le 10s si backend lent (Render cold start)
        });

        // unwrap (supporte: array direct, {data:[]}, {restaurants:[]}, {results:[]})
        const list = data?.restaurants ?? data?.data ?? data?.results ?? data;

        // normalize (supporte: id/_id/restaurantId/restaurentId/restuarentId + name/restaurantName/nom)
        const normalize = (r) => ({
          id:
            r?.id ??
            r?._id ??
            r?.restaurantId ??
            r?.restaurentId ??
            r?.restuarentId ??
            null,
          name: r?.name ?? r?.restaurantName ?? r?.nom ?? "Restaurant",
          raw: r,
        });

        if (!mounted) return;

        setRestaurants([
          { id: null, name: t("filters.allRestaurants") },
          ...(Array.isArray(list) ? list.map(normalize) : []),
        ]);
      } catch (error) {
        // axios v1 => CanceledError si abort
        if (error?.name === "CanceledError") return;
        if (!mounted) return;

        console.error("Erreur chargement restaurants:", error);
        setRestaurants([{ id: null, name: t("filters.allRestaurants") }]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRestaurants();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [t]);

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) =>
    (restaurant.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (restaurant) => {
    onSelectRestaurant?.(restaurant);
    setIsOpen(false);
    setSearch("");
  };

  const displayLabel = selectedRestaurant?.name || t("filters.allRestaurants");
  const isSelected = (a, b) => String(a ?? "") === String(b ?? "");

  return (
    <div className={`filter-dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`filter-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <RiStoreLine className="filter-icon" />
        <span className="filter-label">{displayLabel}</span>
        <RiArrowDownSLine className={`filter-arrow ${isOpen ? "rotate" : ""}`} />
      </button>

      {isOpen && (
        <div className="filter-menu">
          <div className="filter-search">
            <RiSearchLine />
            <input
              type="text"
              placeholder={t("filters.searchRestaurant")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="filter-list">
            {isLoading ? (
              <div className="filter-loading">
                <span className="filter-spinner"></span>
                <span>{t("common.loading")}</span>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="filter-empty">{t("filters.noResults")}</div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id ?? "all"}
                  className={`filter-item ${
                    isSelected(selectedRestaurant?.id, restaurant.id) ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(restaurant)}
                  type="button"
                >
                  <span>{restaurant.name}</span>
                  {isSelected(selectedRestaurant?.id, restaurant.id) && (
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
