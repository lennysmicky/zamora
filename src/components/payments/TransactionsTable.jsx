// src/components/payments/TransactionsTable.jsx
import React from 'react';
import { RiExchangeDollarLine } from 'react-icons/ri';
import TransactionStatusBadge from './TransactionStatusBadge';
import TransactionMethodBadge from './TransactionMethodBadge';
import TransactionActions from './TransactionActions';
import './css/TransactionsTable.css';

const TransactionsTable = ({
  transactions,
  loading,
  onViewDetail,
  onMarkPaid,
  formatAmount,
  formatDate,
  getStatusConfig,
  getMethodLabel,
  isAdmin = false,
  t
}) => {
  // Si pas de transactions et pas de loading, afficher empty state
  if (!loading.transactions && transactions.length === 0) {
    return (
      <div className="payments-content">
        <div className="payments-empty">
          <div className="payments-empty-icon">
            <RiExchangeDollarLine />
          </div>
          <h3>{t('payments.empty.title', 'Aucune transaction')}</h3>
          <p>{t('payments.empty.message', 'Les transactions apparaîtront ici')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`payments-content ${loading.transactions ? 'loading' : ''}`}>
      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>{t('payments.table.date', 'Date')}</th>
              <th>{t('payments.table.order', 'Commande')}</th>
              {isAdmin && <th>{t('payments.table.restaurant', 'Restaurant')}</th>}
              <th>{t('payments.table.customer', 'Client')}</th>
              <th>{t('payments.table.amount', 'Montant')}</th>
              <th>{t('payments.table.method', 'Méthode')}</th>
              <th>{t('payments.table.status', 'Statut')}</th>
              <th>{t('payments.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              const canMarkPaid = !isAdmin && 
                                  ['CASH_PENDING', 'PENDING'].includes(transaction.status) && 
                                  transaction.method === 'cash';

              return (
                <tr key={transaction._id || transaction.id}>
                  <td>
                    <span className="transaction-date">
                      {formatDate(transaction.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="transaction-order">
                      #{transaction.orderNumber || transaction.orderId}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <span className="transaction-restaurant">
                        {transaction.restaurantName || '-'}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className="transaction-customer">
                      {transaction.customerName || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="transaction-amount">
                      {formatAmount(transaction.amount)} {transaction.currency || 'XOF'}
                    </span>
                  </td>
                  <td>
                    <TransactionMethodBadge 
                      method={transaction.method} 
                      label={getMethodLabel(transaction.method)} 
                    />
                  </td>
                  <td>
                    <TransactionStatusBadge 
                      status={statusConfig.class} 
                      label={statusConfig.label} 
                    />
                  </td>
                  <td>
                    <TransactionActions
                      transaction={transaction}
                      canMarkPaid={canMarkPaid}
                      onViewDetail={onViewDetail}
                      onMarkPaid={onMarkPaid}
                      t={t}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;