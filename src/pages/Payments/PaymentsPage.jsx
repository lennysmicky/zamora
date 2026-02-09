// src/pages/Payments/PaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePayments } from '../../hooks/usePayments';
import Modal from '../../components/common/Modal';

// Components
import AdminPaymentsTabs from '../../components/payments/AdminPaymentsTabs';
import AdminPaymentStats from '../../components/payments/AdminPaymentStats';
import AdminTransactionFilters from '../../components/payments/AdminTransactionFilters';
import TransactionsTable from '../../components/payments/TransactionsTable';
import TransactionsPagination from '../../components/payments/TransactionsPagination';
import TransactionDetailModal from '../../components/payments/TransactionDetailModal';

import './PaymentsPage.css';

const PaymentsPage = () => {
  const { t } = useTranslation();

  // Tabs
  const [activeTab, setActiveTab] = useState('transactions');

  // Hook (isAdmin = true)
  const {
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
    exportTransactions,
    loading,
    error,
    success
  } = usePayments(true);

  // Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Handlers
  const handleViewDetail = async (transaction) => {
    await fetchTransactionDetail(transaction._id || transaction.id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTransaction(null);
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
      FAILED: { label: t('payments.status.failed', 'Échoué'), class: 'error' },
      REFUNDED: { label: t('payments.status.refunded', 'Remboursé'), class: 'muted' },
      CANCELLED: { label: t('payments.status.cancelled', 'Annulé'), class: 'muted' }
    };
    return configs[status] || { label: status, class: 'muted' };
  };

  const getMethodLabel = (method) => {
    const methods = {
      cash: t('payments.methods.cash', 'Espèces'),
      mobile_money: t('payments.methods.mobileMoney', 'Mobile Money'),
      card: t('payments.methods.card', 'Carte'),
      orange_money: t('payments.methods.orangeMoney', 'Orange Money'),
      moov_money: t('payments.methods.moovMoney', 'Moov Money'),
      wave: t('payments.methods.wave', 'Wave')
    };
    return methods[method] || method;
  };

  return (
    <div className="admin-payments-page">
      {/* Tabs + Actions */}
      <AdminPaymentsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
        t={t}
      />

      {/* Success Message */}
      {success && (
        <div className="payments-toast success">
          <span>{success}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Stats */}
          <AdminPaymentStats
            stats={stats}
            formatAmount={formatAmount}
            t={t}
          />

          {/* Filters */}
          <AdminTransactionFilters
            filters={filters}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
            t={t}
          />

          {/* Table */}
          <TransactionsTable
            transactions={transactions}
            loading={loading}
            onViewDetail={handleViewDetail}
            onMarkPaid={() => {}} // Admin ne marque pas les paiements
            formatAmount={formatAmount}
            formatDate={formatDate}
            getStatusConfig={getStatusConfig}
            getMethodLabel={getMethodLabel}
            isAdmin={true}
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

      {activeTab === 'overview' && (
        <AdminOverviewTab
          stats={stats}
          formatAmount={formatAmount}
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
            onMarkPaid={() => {}}
            loading={loading}
            isAdmin={true}
            t={t}
          />
        )}
      </Modal>
    </div>
  );
};

// ============================================
// ADMIN OVERVIEW TAB
// ============================================
const AdminOverviewTab = ({ stats, formatAmount, t }) => {
  return (
    <div className="admin-overview">
      <div className="overview-section">
        <h3>{t('payments.admin.globalStats', 'Statistiques globales')}</h3>
        <div className="overview-cards">
          <div className="overview-card primary">
            <span className="overview-value">{formatAmount(stats.totalRevenue)}</span>
            <span className="overview-label">{t('payments.admin.totalRevenue', 'Revenu total')}</span>
          </div>
          <div className="overview-card success">
            <span className="overview-value">{formatAmount(stats.platformFees)}</span>
            <span className="overview-label">{t('payments.admin.platformFees', 'Frais plateforme')}</span>
          </div>
          <div className="overview-card warning">
            <span className="overview-value">{formatAmount(stats.pendingPayouts)}</span>
            <span className="overview-label">{t('payments.admin.pendingPayouts', 'Paiements en attente')}</span>
          </div>
          <div className="overview-card info">
            <span className="overview-value">{stats.totalTransactions || 0}</span>
            <span className="overview-label">{t('payments.stats.totalTransactions', 'Total transactions')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;