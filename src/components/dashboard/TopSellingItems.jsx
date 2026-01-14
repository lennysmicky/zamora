import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiArrowRightSLine } from 'react-icons/ri';
import './TopSellingItems.css';

const TopSellingItems = () => {
  const { t } = useTranslation();

  // État initialisé à tableau vide (prêt pour le backend)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données depuis le backend
  const fetchTopSellingItems = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/dashboard/top-selling');
      // const data = await response.json();
      // setItems(data);

      // Pour l'instant, on garde le tableau vide
      setItems([]);
    } catch (error) {
      console.error('Erreur lors du chargement des meilleures ventes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellingItems();
  }, []);

  // Fonction pour formater la monnaie
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Fonction pour formater le nombre de ventes
  const formatSold = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // ================================
  // ÉTAT 1 : LOADING (Skeleton)
  // ================================
  if (loading) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t('dashboard.topSelling')}</h3>
          <button className="top-selling-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="top-selling-item skeleton-item">
              <div className="skeleton-rank"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-meta"></div>
              </div>
              <div className="skeleton-stats"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 2 : EMPTY (Aucune donnée)
  // ================================
  if (items.length === 0) {
    return (
      <div className="top-selling-card">
        <div className="top-selling-header">
          <h3>{t('dashboard.topSelling')}</h3>
          <button className="top-selling-link">
            {t('dashboard.viewAll')}
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="top-selling-empty">
          <p>{t('dashboard.noSales')}</p>
        </div>
      </div>
    );
  }

  // ================================
  // ÉTAT 3 : DATA (Affichage normal)
  // ================================
  return (
    <div className="top-selling-card">
      <div className="top-selling-header">
        <h3>{t('dashboard.topSelling')}</h3>
        <button className="top-selling-link">
          {t('dashboard.viewAll')}
          <RiArrowRightSLine />
        </button>
      </div>

      <div className="top-selling-list">
        {items.map((item, index) => (
          <div key={item.id} className="top-selling-item">
            <div className={`top-selling-rank rank-${index + 1}`}>
              {index + 1}
            </div>
            <div className="top-selling-info">
              <span className="top-selling-name">{item.name}</span>
              <span className="top-selling-meta">
                {formatCurrency(item.price)} • {item.category}
              </span>
            </div>
            <div className="top-selling-stats">
              <span className="top-selling-sold">{formatSold(item.sold)}</span>
              <span className="top-selling-sold-label">{t('common.sold')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;