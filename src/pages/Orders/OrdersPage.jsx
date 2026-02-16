// pages/Orders/OrdersPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ordersStore } from '../../stores/ordersStore';
import { useOrdersStore } from '../../hooks/useOrdersStore';
import useAuthStore from '../../stores/authStore';

import OrdersStats from '../../components/orders/OrdersStats';
import OrdersFilters from '../../components/orders/OrderFilters';
import OrdersTable from '../../components/tables/OrdersTable';
import OrdersPagination from '../../components/orders/OrdersPagination';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import OrdersEmptyState from '../../components/orders/OrdersEmptyState';
import OrdersLoadingSkeleton from '../../components/orders/OrderLoadingSkeleton';
import { useOrders } from '../../hooks/useOrders';

// Modal create (tu peux laisser, on ne le touche pas)
import Modal from '../../components/common/Modal';
import OrderCreateForm from '../../components/orders/OrderCreateForm';

import './OrdersPage.css';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  paymentStatus: '',
  paymentMethod: '',
  source: '',
  period: '30days',
  from: '',
  to: '',
  restaurant: ''
};

const OrdersPage = ({ restaurantId: restaurantIdProp = null }) => {
  const { t } = useTranslation();

  const {
    selectedOrders,
    setSelectedOrders,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  } = useOrdersStore();

  const { restaurantId: storeRestaurantId, userType } = useAuthStore();

  // ✅ vrai mode restaurant si user restaurant OU page forcée sur un restaurant (prop)
  const isRestaurantMode = userType === 'restaurant' || Boolean(restaurantIdProp);

  // ✅ IMPORTANT: en admin => restaurantId null (pour endpoints /admin/commandes)
  const restaurantIdForHook = useMemo(() => {
    if (!isRestaurantMode) return null;
    return restaurantIdProp || storeRestaurantId || null;
  }, [isRestaurantMode, restaurantIdProp, storeRestaurantId]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    orders,
    stats,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchOrders,
    updateOrderStatus
  } = useOrders({
    restaurantId: restaurantIdForHook,
    mode: isRestaurantMode ? 'restaurant' : 'admin'
  });

  // ================================
  // HANDLERS (memo pour éviter stale + rebind)
  // ================================
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  }, []);

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }, [setSelectedOrders]);

  const handleSelectAll = useCallback(() => {
    setSelectedOrders((prev) => {
      if (prev.length === orders.length) return [];
      return orders.map((o) => o.id);
    });
  }, [orders, setSelectedOrders]);

  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleExport = useCallback((format) => {
    console.log(`Exporting as ${format}`);
  }, []);

  const handleBulkAction = useCallback((action) => {
    console.log(`Bulk action: ${action}`, selectedOrders);
    ordersStore.clearSelection();
  }, [selectedOrders]);

  const handleNewOrder = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  const handleCreateSuccess = useCallback(() => {
    closeCreateModal();
    fetchOrders();
  }, [closeCreateModal, fetchOrders]);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, ...DEFAULT_FILTERS }));
  }, [setFilters]);

  // ================================
  // ✅ HANDLERS HEADER : mount/unmount (pas dépendre de orders)
  // ================================
  useEffect(() => {
    ordersStore.setHandlers({
      onRefresh: handleRefresh,
      onExport: handleExport,
      onBulkAction: handleBulkAction,
      onNewOrder: handleNewOrder
    });

    return () => {
      ordersStore.reset();
    };
  }, [handleRefresh, handleExport, handleBulkAction, handleNewOrder]);

  // ✅ Sync orders -> store (séparé)
  useEffect(() => {
    ordersStore.setOrders(orders);
  }, [orders]);

  // ================================
  // RENDER
  // ================================
  return (
    <div className={`orders-page ${isRestaurantMode ? 'restaurant-mode' : 'admin-mode'}`}>
      <OrdersStats stats={stats} loading={loading} isRestaurantMode={isRestaurantMode} />

      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        isRestaurantMode={isRestaurantMode}
      />

      <div className="orders-content">
        {loading ? (
          <OrdersLoadingSkeleton />
        ) : error ? (
          <div className="orders-error">
            <p>{t('common.error')}: {error}</p>
            <button className="orders-btn orders-btn-primary" onClick={handleRefresh}>
              {t('common.retry')}
            </button>
          </div>
        ) : orders.length === 0 ? (
          <OrdersEmptyState filters={filters} onReset={resetFilters} />
        ) : (
          <>
            <OrdersTable
              orders={orders}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetails={handleViewDetails}
              onUpdateStatus={updateOrderStatus}
              isRestaurantMode={isRestaurantMode}
            />

            <OrdersPagination pagination={pagination} onPaginationChange={setPagination} />
          </>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={updateOrderStatus}
          isRestaurantMode={isRestaurantMode}
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={t('orders.createOrder', 'Nouvelle Commande')}
        size="large"
      >
        <OrderCreateForm
          restaurantId={restaurantIdForHook}
          isRestaurantMode={isRestaurantMode}
          onCancel={closeCreateModal}
          onSuccess={handleCreateSuccess}
        />
      </Modal>
    </div>
  );
};

export default OrdersPage;
