// src/components/payments/TransactionsPagination.jsx
import React from 'react';
import './css/TransactionsPagination.css';

const TransactionsPagination = ({ pagination, changePage, t }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="payments-pagination">
      <button
        className="pagination-btn"
        onClick={() => changePage(pagination.page - 1)}
        disabled={pagination.page <= 1}
      >
        {t('common.previous', 'Précédent')}
      </button>
      <span className="pagination-info">
        {pagination.page} / {pagination.totalPages}
      </span>
      <button
        className="pagination-btn"
        onClick={() => changePage(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
      >
        {t('common.next', 'Suivant')}
      </button>
    </div>
  );
};

export default TransactionsPagination;