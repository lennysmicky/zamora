// src/hooks/usePayments.js
import { useState, useEffect, useCallback } from 'react';
import { paymentsAPI } from '../api/payments';
import useAuthStore from '../stores/authStore';

export const usePayments = (isAdmin = false) => {
  const { restaurantId, user } = useAuthStore();
  
  // Détermine si on est en mode admin
  const adminMode = isAdmin || user?.role === 'admin';
  
  // Config state (seulement pour restaurant)
  const [config, setConfig] = useState({
    cashEnabled: true,
    mobileMoneyEnabled: false,
    currency: 'XOF',
    mode: 'test',
    publicKey: '',
    secretKey: '',
    connectionStatus: null
  });
  
  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    totalCount: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    period: '7d',
    status: '',
    method: '',
    restaurantId: '', // Pour admin seulement
    startDate: null,
    endDate: null
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    config: false,
    transactions: false,
    detail: false,
    saving: false,
    testing: false,
    markingPaid: false,
    exporting: false
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // ============ CONFIG (Restaurant only) ============
  const fetchConfig = useCallback(async () => {
    if (adminMode || !restaurantId) return;
    
    setLoading(prev => ({ ...prev, config: true }));
    setError(null);
    
    try {
      const response = await paymentsAPI.getConfig(restaurantId);
      if (response.data) {
        setConfig(response.data.config || response.data);
      }
    } catch (err) {
      console.error('Fetch config error:', err);
      setError('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, [restaurantId, adminMode]);

  const saveConfig = useCallback(async (configData) => {
    if (adminMode || !restaurantId) return { success: false };
    
    setLoading(prev => ({ ...prev, saving: true }));
    clearMessages();
    
    try {
      const response = await paymentsAPI.updateConfig(restaurantId, configData);
      if (response.data) {
        setConfig(response.data.config || response.data);
        setSuccess('Configuration enregistrée');
        return { success: true };
      }
    } catch (err) {
      console.error('Save config error:', err);
      const errorMsg = err.response?.data?.message || 'Erreur lors de la sauvegarde';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [restaurantId, adminMode, clearMessages]);

  const testConnection = useCallback(async () => {
    if (adminMode || !restaurantId) return { success: false };
    
    setLoading(prev => ({ ...prev, testing: true }));
    
    try {
      const response = await paymentsAPI.testConnection(restaurantId);
      const status = response.data?.status || 'ok';
      setConfig(prev => ({ ...prev, connectionStatus: status }));
      return { success: status === 'ok', status };
    } catch (err) {
      console.error('Test connection error:', err);
      setConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      return { success: false, status: 'error' };
    } finally {
      setLoading(prev => ({ ...prev, testing: false }));
    }
  }, [restaurantId, adminMode]);

  // ============ TRANSACTIONS ============
  const fetchTransactions = useCallback(async () => {
    if (!adminMode && !restaurantId) return;
    
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(null);
    
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = adminMode 
        ? await paymentsAPI.admin.getTransactions(params)
        : await paymentsAPI.getTransactions(restaurantId, params);
        
      if (response.data) {
        setTransactions(response.data.transactions || response.data.data || []);
        if (response.data.pagination) {
          setPagination(prev => ({ ...prev, ...response.data.pagination }));
        }
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
      setError('Erreur lors du chargement des transactions');
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [restaurantId, adminMode, filters, pagination.page, pagination.limit]);

  const fetchTransactionDetail = useCallback(async (transactionId) => {
    if (!transactionId) return null;
    
    setLoading(prev => ({ ...prev, detail: true }));
    
    try {
      const response = adminMode
        ? await paymentsAPI.admin.getTransaction(transactionId)
        : await paymentsAPI.getTransaction(restaurantId, transactionId);
        
      if (response.data) {
        setSelectedTransaction(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Fetch transaction detail error:', err);
      setError('Erreur lors du chargement du détail');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  }, [restaurantId, adminMode]);

  // ============ STATS ============
  const fetchStats = useCallback(async () => {
    if (!adminMode && !restaurantId) return;
    
    try {
      const params = { period: filters.period };
      
      const response = adminMode
        ? await paymentsAPI.admin.getStats(params)
        : await paymentsAPI.getStats(restaurantId, params);
        
      if (response.data) {
        setStats(response.data.stats || response.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [restaurantId, adminMode, filters.period]);

  // ============ ACTIONS ============
  const markAsPaid = useCallback(async (transactionId) => {
    if (adminMode || !restaurantId) return { success: false };
    
    setLoading(prev => ({ ...prev, markingPaid: true }));
    clearMessages();
    
    try {
      await paymentsAPI.markAsPaid(restaurantId, transactionId);
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status: 'CASH_PAID' } : t)
      );
      
      if (selectedTransaction?.id === transactionId) {
        setSelectedTransaction(prev => ({ ...prev, status: 'CASH_PAID' }));
      }
      
      // Refresh stats
      await fetchStats();
      
      setSuccess('Paiement marqué comme encaissé');
      return { success: true };
    } catch (err) {
      console.error('Mark as paid error:', err);
      const errorMsg = err.response?.data?.message || 'Erreur lors du marquage';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(prev => ({ ...prev, markingPaid: false }));
    }
  }, [restaurantId, adminMode, selectedTransaction, fetchStats, clearMessages]);

  const exportTransactions = useCallback(async (format = 'csv') => {
    if (!adminMode && !restaurantId) return { success: false };
    
    setLoading(prev => ({ ...prev, exporting: true }));
    
    try {
      const params = { ...filters, format };
      
      const response = adminMode
        ? await paymentsAPI.admin.exportTransactions(params)
        : await paymentsAPI.exportTransactions(restaurantId, params);
      
      // Create download
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Export téléchargé');
      return { success: true };
    } catch (err) {
      console.error('Export error:', err);
      setError('Erreur lors de l\'export');
      return { success: false, error: 'Erreur lors de l\'export' };
    } finally {
      setLoading(prev => ({ ...prev, exporting: false }));
    }
  }, [restaurantId, adminMode, filters]);

  // ============ FILTER HELPERS ============
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset page on filter change
  }, []);

  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      period: '7d',
      status: '',
      method: '',
      restaurantId: '',
      startDate: null,
      endDate: null
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // ============ EFFECTS ============
  useEffect(() => {
    if (!adminMode) {
      fetchConfig();
    }
  }, [fetchConfig, adminMode]);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    // Mode
    isAdmin: adminMode,
    
    // Config (restaurant only)
    config,
    setConfig,
    saveConfig,
    testConnection,
    
    // Transactions
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    fetchTransactionDetail,
    
    // Stats
    stats,
    
    // Filters & Pagination
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    pagination,
    setPagination,
    changePage,
    
    // Actions
    fetchTransactions,
    markAsPaid,
    exportTransactions,
    
    // States
    loading,
    error,
    success,
    setError,
    clearMessages
  };
};

export default usePayments;