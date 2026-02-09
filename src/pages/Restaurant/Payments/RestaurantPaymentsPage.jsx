// src/pages/Restaurant/Payments/RestaurantPaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePayments } from '../../../hooks/usePayments';
import useAuthStore from '../../../stores/authStore';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// Components
import PaymentsTabs from '../../../components/payments/PaymentsTabs';
import PaymentStats from '../../../components/payments/PaymentStats';
import TransactionFilters from '../../../components/payments/TransactionFilters';
import TransactionsTable from '../../../components/payments/TransactionsTable';
import TransactionsPagination from '../../../components/payments/TransactionsPagination';
import PaymentConfig from '../../../components/payments/PaymentConfig';
import TransactionDetailModal from '../../../components/payments/TransactionDetailModal';

import './payments.css';

const RestaurantPaymentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Tabs
  const [activeTab, setActiveTab] = useState('transactions');

  // Hook
  const {
    config,
    saveConfig,
    testConnection,
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    fetchTransactionDetail,
    stats,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    changePage,
    fetchTransactions,
    markAsPaid,
    exportTransactions,
    loading,
    error,
    success
  } = usePayments(false);

  // Local config state
  const [localConfig, setLocalConfig] = useState(config);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmMarkPaid, setConfirmMarkPaid] = useState({
    isOpen: false,
    transaction: null
  });

  // Sync local config
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Handlers Config
  const handleConfigChange = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    await saveConfig(localConfig);
  };

  const handleTestConnection = async () => {
    await testConnection();
  };

  // Handlers Transactions
  const handleViewDetail = async (transaction) => {
    await fetchTransactionDetail(transaction._id || transaction.id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTransaction(null);
  };

  const handleMarkPaidClick = (transaction) => {
    setConfirmMarkPaid({ isOpen: true, transaction });
  };

  const handleConfirmMarkPaid = async () => {
    if (confirmMarkPaid.transaction) {
      await markAsPaid(confirmMarkPaid.transaction._id || confirmMarkPaid.transaction.id);
      setConfirmMarkPaid({ isOpen: false, transaction: null });
    }
  };

  const handleExport = async () => {
    await exportTransactions('csv');
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  // Format helpers
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      PAID: { label: t('payments.status.paid', 'Payé'), class: 'success' },
      CASH_PAID: { label: t('payments.status.cashPaid', 'Encaissé'), class: 'success' },
      PENDING: { label: t('payments.status.pending', 'En attente'), class: 'warning' },
      CASH_PENDING: { label: t('payments.status.cashPending', 'À encaisser'), class: 'warning' },
      FAILED: { label: t('payments.status.failed', 'Échoué'), class: 'error' }
    };
    return configs[status] || { label: status, class: 'muted' };
  };

  const getMethodLabel = (method) => {
    const methods = {
      cash: t('payments.methods.cash', 'Espèces'),
      mobile_money: t('payments.methods.mobileMoney', 'Mobile Money'),
      card: t('payments.methods.card', 'Carte')
    };
    return methods[method] || method;
  };

  return (
    <div className="payments-page">
      {/* Tabs + Actions (sur la même ligne) */}
      <PaymentsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onSave={handleSaveConfig}
        loading={loading}
        t={t}
      />

      {/* Success Message (pas d'erreur visible) */}
      {success && (
        <div className="payments-toast success">
          <span>{success}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Stats */}
          <PaymentStats
            stats={stats}
            formatAmount={formatAmount}
            t={t}
          />

          {/* Filters */}
          <TransactionFilters
            filters={filters}
            updateFilters={updateFilters}
            t={t}
          />

          {/* Table */}
          <TransactionsTable
            transactions={transactions}
            loading={loading}
            onViewDetail={handleViewDetail}
            onMarkPaid={handleMarkPaidClick}
            formatAmount={formatAmount}
            formatDate={formatDate}
            getStatusConfig={getStatusConfig}
            getMethodLabel={getMethodLabel}
            t={t}
          />

          {/* Pagination */}
          <TransactionsPagination
            pagination={pagination}
            changePage={changePage}
            t={t}
          />
        </>
      )}

      {activeTab === 'config' && (
        <PaymentConfig
          config={localConfig}
          onChange={handleConfigChange}
          onTestConnection={handleTestConnection}
          loading={loading}
          showSecretKey={showSecretKey}
          setShowSecretKey={setShowSecretKey}
          t={t}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title={t('payments.detail.title', 'Détail de la transaction')}
        size="medium"
      >
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            formatAmount={formatAmount}
            formatDate={formatDate}
            getStatusConfig={getStatusConfig}
            getMethodLabel={getMethodLabel}
            onMarkPaid={() => handleMarkPaidClick(selectedTransaction)}
            loading={loading}
            t={t}
          />
        )}
      </Modal>

      {/* Confirm Mark Paid */}
      <ConfirmDialog
        isOpen={confirmMarkPaid.isOpen}
        onClose={() => setConfirmMarkPaid({ isOpen: false, transaction: null })}
        onConfirm={handleConfirmMarkPaid}
        title={t('payments.markPaid.title', 'Marquer comme encaissé')}
        message={t('payments.markPaid.message', 'Confirmer l\'encaissement de ce paiement ?')}
        confirmText={t('common.confirm', 'Confirmer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="primary"
      />
    </div>
  );
};

export default RestaurantPaymentsPage;