// src/components/payments/TransactionDetailModal.jsx
import React from 'react';
import { RiCheckLine, RiLoader4Line } from 'react-icons/ri';
import './css/TransactionDetailModal.css';

const TransactionDetailModal = ({
  transaction,
  formatAmount,
  formatDate,
  getStatusConfig,
  getMethodLabel,
  onMarkPaid,
  loading,
  isAdmin = false,
  t
}) => {
  const statusConfig = getStatusConfig(transaction.status);
  const canMarkPaid = !isAdmin && 
                      ['CASH_PENDING', 'PENDING'].includes(transaction.status) && 
                      transaction.method === 'cash';

  return (
    <div className="transaction-detail">
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.order', 'Commande')}</span>
        <span className="detail-value">#{transaction.orderNumber || transaction.orderId}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.date', 'Date')}</span>
        <span className="detail-value">{formatDate(transaction.createdAt)}</span>
      </div>
      {isAdmin && transaction.restaurantName && (
        <div className="detail-row">
          <span className="detail-label">{t('payments.detail.restaurant', 'Restaurant')}</span>
          <span className="detail-value">{transaction.restaurantName}</span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.customer', 'Client')}</span>
        <span className="detail-value">{transaction.customerName || '-'}</span>
      </div>
      {transaction.customerPhone && (
        <div className="detail-row">
          <span className="detail-label">{t('payments.detail.phone', 'Téléphone')}</span>
          <span className="detail-value">{transaction.customerPhone}</span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.amount', 'Montant')}</span>
        <span className="detail-value amount">
          {formatAmount(transaction.amount)} {transaction.currency || 'XOF'}
        </span>
      </div>
      {isAdmin && transaction.fee > 0 && (
        <>
          <div className="detail-row">
            <span className="detail-label">{t('payments.detail.fee', 'Frais de transaction')}</span>
            <span className="detail-value">{formatAmount(transaction.fee)} {transaction.currency || 'XOF'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('payments.detail.net', 'Montant net')}</span>
            <span className="detail-value amount">
              {formatAmount(transaction.amount - transaction.fee)} {transaction.currency || 'XOF'}
            </span>
          </div>
        </>
      )}
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.method', 'Méthode')}</span>
        <span className="detail-value">{getMethodLabel(transaction.method)}</span>
      </div>
      {transaction.provider && (
        <div className="detail-row">
          <span className="detail-label">{t('payments.detail.provider', 'Fournisseur')}</span>
          <span className="detail-value">{transaction.provider}</span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">{t('payments.detail.status', 'Statut')}</span>
        <span className={`status-badge ${statusConfig.class}`}>{statusConfig.label}</span>
      </div>
      {transaction.reference && (
        <div className="detail-row">
          <span className="detail-label">{t('payments.detail.reference', 'Référence')}</span>
          <span className="detail-value mono">{transaction.reference}</span>
        </div>
      )}
      {transaction.errorMessage && (
        <div className="detail-row error">
          <span className="detail-label">{t('payments.detail.error', 'Erreur')}</span>
          <span className="detail-value">{transaction.errorMessage}</span>
        </div>
      )}

      {/* Order Items */}
      {transaction.items && transaction.items.length > 0 && (
        <div className="detail-items">
          <h4>{t('payments.detail.items', 'Articles')}</h4>
          <ul>
            {transaction.items.map((item, index) => (
              <li key={index}>
                <span>{item.quantity}x {item.name}</span>
                <span>{formatAmount(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {canMarkPaid && (
        <div className="detail-actions">
          <button
            className="payments-btn-primary"
            onClick={onMarkPaid}
            disabled={loading.markingPaid}
          >
            {loading.markingPaid ? <RiLoader4Line className="spin" /> : <RiCheckLine />}
            <span>{t('payments.markPaid.button', 'Marquer comme encaissé')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailModal;