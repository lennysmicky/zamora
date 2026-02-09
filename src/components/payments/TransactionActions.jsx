// src/components/payments/TransactionActions.jsx
import React from 'react';
import { RiEyeLine, RiCheckLine } from 'react-icons/ri';
import './css/TransactionsTable.css';

const TransactionActions = ({ transaction, canMarkPaid, onViewDetail, onMarkPaid, t }) => {
  return (
    <div className="actions-cell">
      <button
        className="action-btn view"
        onClick={() => onViewDetail(transaction)}
        title={t('common.view', 'Voir')}
      >
        <RiEyeLine />
      </button>
      {canMarkPaid && (
        <button
          className="action-btn success"
          onClick={() => onMarkPaid(transaction)}
          title={t('payments.markPaid.button', 'Marquer payé')}
        >
          <RiCheckLine />
        </button>
      )}
    </div>
  );
};

export default TransactionActions;