import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiArrowLeftSLine, 
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine
} from 'react-icons/ri';
import './css/OrdersPagination.css';

const OrdersPagination = ({ pagination, onPaginationChange }) => {
  const { t } = useTranslation();

  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPaginationChange(prev => ({ ...prev, currentPage: page }));
    }
  };

  const handleItemsPerPageChange = (e) => {
    onPaginationChange(prev => ({ 
      ...prev, 
      itemsPerPage: parseInt(e.target.value),
      currentPage: 1
    }));
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="orders-pagination">
      {/* Info */}
      <div className="orders-pagination-info">
        <span>
          {t('orders.pagination.showing')} {startItem}-{endItem} {t('orders.pagination.of')} {totalItems}
        </span>
      </div>

      {/* Navigation */}
      <div className="orders-pagination-nav">
        {/* Première page */}
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          title={t('orders.pagination.first')}
        >
          <RiArrowLeftDoubleLine />
        </button>

        {/* Page précédente */}
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title={t('orders.pagination.previous')}
        >
          <RiArrowLeftSLine />
        </button>

        {/* Numéros de page */}
        <div className="pagination-pages">
          {getPageNumbers().map(page => (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Page suivante */}
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title={t('orders.pagination.next')}
        >
          <RiArrowRightSLine />
        </button>

        {/* Dernière page */}
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          title={t('orders.pagination.last')}
        >
          <RiArrowRightDoubleLine />
        </button>
      </div>

      {/* Items par page */}
      <div className="orders-pagination-size">
        <select 
          value={itemsPerPage} 
          onChange={handleItemsPerPageChange}
        >
          <option value={10}>10 / {t('orders.pagination.page')}</option>
          <option value={25}>25 / {t('orders.pagination.page')}</option>
          <option value={50}>50 / {t('orders.pagination.page')}</option>
          <option value={100}>100 / {t('orders.pagination.page')}</option>
        </select>
      </div>
    </div>
  );
};

export default OrdersPagination;