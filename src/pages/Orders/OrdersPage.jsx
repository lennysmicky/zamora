// pages/Orders/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
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
import './OrdersPage.css';

const OrdersPage = ({ restaurantId: restaurantIdProp = null }) => {
  const { t } = useTranslation();
  const { selectedOrders, setSelectedOrders } = useOrdersStore();
  
  //  Récupérer restaurantId du store si pas passé en prop
  const { restaurantId: storeRestaurantId, userType } = useAuthStore();
  const restaurantId = restaurantIdProp || storeRestaurantId;
  
  //  Déterminer le mode
  const isRestaurantMode = userType === 'restaurant' || !!restaurantIdProp;
  
  // États locaux
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //  Hook personnalisé avec restaurantId
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
  } = useOrders(restaurantId);

  // ================================
  // HANDLERS
  // ================================

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleSelectOrder = (orderId) => {
    const newSelection = selectedOrders.includes(orderId)
      ? selectedOrders.filter(id => id !== orderId)
      : [...selectedOrders, orderId];
    setSelectedOrders(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`);
    // TODO: Implémenter l'export
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action}`, selectedOrders);
    // TODO: Implémenter les actions groupées
    ordersStore.clearSelection();
  };

  const handleNewOrder = () => {
    console.log('New order');
    // TODO: Implémenter la création
  };

  // ================================
  // ENREGISTRER LES HANDLERS POUR LE HEADER
  // ================================
  useEffect(() => {
    ordersStore.setHandlers({
      onRefresh: handleRefresh,
      onExport: handleExport,
      onBulkAction: handleBulkAction,
      onNewOrder: handleNewOrder
    });

    ordersStore.setOrders(orders);

    return () => {
      ordersStore.reset();
    };
  }, [orders]);

  // ================================
  // RENDER
  // ================================
  return (
    <div className={`orders-page ${isRestaurantMode ? 'restaurant-mode' : 'admin-mode'}`}>

      {/* SECTION : STATS */}
      <OrdersStats 
        stats={stats} 
        loading={loading} 
        isRestaurantMode={isRestaurantMode}
      />

      {/* SECTION : FILTRES */}
      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        isRestaurantMode={isRestaurantMode}
      />

      {/* SECTION : CONTENU PRINCIPAL */}
      <div className="orders-content">
        {loading ? (
          <OrdersLoadingSkeleton />
        ) : error ? (
          <div className="orders-error">
            <p>{t('common.error')}: {error}</p>
            <button 
              className="orders-btn orders-btn-primary"
              onClick={handleRefresh}
            >
              {t('common.retry')}
            </button>
          </div>
        ) : orders.length === 0 ? (
          <OrdersEmptyState 
            filters={filters} 
            onReset={() => setFilters({})} 
          />
        ) : (
          <>
            {/* Tableau */}
            <OrdersTable
              orders={orders}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetails={handleViewDetails}
              onUpdateStatus={updateOrderStatus}
              isRestaurantMode={isRestaurantMode}
            />

            {/* Pagination */}
            <OrdersPagination
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </>
        )}
      </div>

      {/* MODAL DÉTAILS */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={updateOrderStatus}
          isRestaurantMode={isRestaurantMode}
        />
      )}
    </div>
  );
};

export default OrdersPage;