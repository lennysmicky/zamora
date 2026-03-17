import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { ordersStore } from "../../stores/ordersStore";
import { useSelectedOrders, useIsCreateModalOpen } from "../../hooks/useOrdersStore";
import useAuthStore from "../../stores/authStore";
import { emitDashboardRefresh } from "../../utils/dashboardEvents";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";
import { useWebSocket } from "../../hooks/useWebSocket";

import OrdersStats from "../../components/orders/OrdersStats";
import OrdersFilters from "../../components/orders/OrderFilters";
import OrdersTable from "../../components/tables/OrdersTable";
import OrdersPagination from "../../components/orders/OrdersPagination";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";
import OrdersEmptyState from "../../components/orders/OrdersEmptyState";
import OrdersLoadingSkeleton from "../../components/orders/OrderLoadingSkeleton";
import { useOrders } from "../../hooks/useOrders";

import Modal from "../../components/common/Modal";
import OrderCreateForm from "../../components/orders/OrderCreateForm";

import { ordersApi } from "../../api/orders";
import { readOrdersSearchParams, writeOrdersSearchParams } from "../../utils/ordersQuery";
import "./OrdersPage.css";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  paymentStatus: "",
  paymentMethod: "",
  source: "",
  period: "30days",
  from: "",
  to: "",
  restaurant: "",
};

const getOrderId = (o) => String(o?.id ?? o?._id ?? "");
const eqId = (a, b) => String(a || "") === String(b || "");

const resolveRestaurantIdForOrder = ({
  order,
  mode,
  restaurantIdForHook,
  storeRestaurantId,
  filters,
}) => {
  if (mode === "restaurant") return restaurantIdForHook || storeRestaurantId || null;

  return (
    order?.restaurantId ||
    order?.restaurentId ||
    order?.raw?.restaurantId ||
    order?.raw?.restaurentId ||
    filters?.restaurant ||
    null
  );
};

const OrdersPage = ({
  restaurantId: restaurantIdProp = null,
  mode: modeProp = null,
  disableUrlSync = false,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentQS = useMemo(() => searchParams.toString(), [searchParams]);
  const lastWrittenQSRef = useRef(null);

  const selectedOrders = useSelectedOrders();
  const isCreateModalOpen = useIsCreateModalOpen();

  const setSelectedOrders = ordersStore.setSelectedOrders;
  const openCreateModal = ordersStore.openCreateModal;
  const closeCreateModal = ordersStore.closeCreateModal;

  const userType = useAuthStore((s) => s.userType);
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);

  //  Hook de notifications
  const { notifyStatusChange, notifySuccess, notifyError, notifyNewOrder } = useOrderNotifications();

  const forcedMode =
    modeProp === "restaurant" ? "restaurant" : modeProp === "admin" ? "admin" : null;

  const isRestaurantMode =
    forcedMode === "restaurant" || userType === "restaurant" || Boolean(restaurantIdProp);

  const mode = forcedMode ?? (isRestaurantMode ? "restaurant" : "admin");

  const restaurantIdForHook = useMemo(() => {
    if (mode !== "restaurant") return null;
    return restaurantIdProp || storeRestaurantId || null;
  }, [mode, restaurantIdProp, storeRestaurantId]);

  const { initialFilters, initialPagination } = useMemo(() => {
    if (disableUrlSync || mode === "restaurant") {
      return {
        initialFilters: DEFAULT_FILTERS,
        initialPagination: { currentPage: 1, itemsPerPage: 10 },
      };
    }
    return readOrdersSearchParams(searchParams, { defaults: DEFAULT_FILTERS, mode });
  }, [currentQS, mode, disableUrlSync, searchParams]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

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
    removeOrderLocally,
    restoreOrdersSnapshot,
  } = useOrders({
    restaurantId: restaurantIdForHook,
    mode,
    initialFilters,
    initialPagination,
  });

  const fetchOrdersRef = useRef(fetchOrders);

  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  //  Configuration WebSocket
  const { isConnected, subscribe } = useWebSocket({
    autoConnect: true,
    onConnected: () => {
      // console.log(' WebSocket connecté - Écoute des commandes en temps réel');
    },
    onDisconnected: () => {
      // console.log('🔌 WebSocket déconnecté');
    },
    onMessage: (data) => {
      // console.log('Message WebSocket reçu:', data);
    },
  });

  //  Écouter les événements WebSocket
  useEffect(() => {
    // Nouvelle commande
    const unsubNewOrder = subscribe('new_order', (data) => {
      // console.log('Nouvelle commande WebSocket:', data);
      fetchOrdersRef.current?.();
    });

    // Changement de statut
    const unsubStatusUpdate = subscribe('order_status_updated', (data) => {
      // console.log(' Mise à jour statut WebSocket:', data);
      fetchOrdersRef.current?.();
    });

    // Commande supprimée
    const unsubOrderDeleted = subscribe('order_deleted', (data) => {
      // console.log(' Commande supprimée WebSocket:', data);
      fetchOrdersRef.current?.();
    });

    // Paiement mis à jour
    const unsubPaymentUpdate = subscribe('payment_status_updated', (data) => {
      // console.log('Paiement mis à jour WebSocket:', data);
      fetchOrdersRef.current?.();
    });

    return () => {
      unsubNewOrder();
      unsubStatusUpdate();
      unsubOrderDeleted();
      unsubPaymentUpdate();
    };
  }, [subscribe]);

  const setFiltersUI = useCallback(
    (updater) => {
      setFilters((prev) => (typeof updater === "function" ? updater(prev) : updater));
      setPagination((p) => ({ ...p, currentPage: 1 }));
    },
    [setFilters, setPagination]
  );

  useEffect(() => {
    if (disableUrlSync || mode === "restaurant") return;
    if (lastWrittenQSRef.current === currentQS) return;

    const { initialFilters: fFromUrl, initialPagination: pFromUrl } =
      readOrdersSearchParams(searchParams, {
        defaults: DEFAULT_FILTERS,
        mode,
      });

    setFilters(fFromUrl);
    setPagination((p) => ({
      ...p,
      currentPage: pFromUrl.currentPage,
      itemsPerPage: pFromUrl.itemsPerPage,
    }));
  }, [currentQS, mode, disableUrlSync, searchParams, setFilters, setPagination]);

  useEffect(() => {
    if (disableUrlSync || mode === "restaurant") return;

    const nextQS = writeOrdersSearchParams({
      filters,
      pagination: { page: pagination.currentPage, limit: pagination.itemsPerPage },
      mode,
    });

    if (nextQS !== currentQS) {
      lastWrittenQSRef.current = nextQS;
      setSearchParams(nextQS, { replace: true });
    }
  }, [
    filters,
    pagination.currentPage,
    pagination.itemsPerPage,
    mode,
    currentQS,
    setSearchParams,
    disableUrlSync,
  ]);

  useEffect(() => {
    if (!selectedOrder) return;
    const id = getOrderId(selectedOrder);
    if (!id) return;
    const fresh = orders.find((o) => eqId(getOrderId(o), id));
    if (fresh && fresh !== selectedOrder) setSelectedOrder(fresh);
  }, [orders, selectedOrder]);

  useEffect(() => {
    ordersStore.setOrders(orders);

    const idsSet = new Set(orders.map(getOrderId).filter(Boolean));
    ordersStore.setSelectedOrders((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter((id) => idsSet.has(id));
    });
  }, [orders]);

  const handleViewDetails = useCallback((order) => {
    setActionError("");
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
    setIsModalOpen(false);
    setActionBusy(false);
    setActionError("");
  }, []);

  const handleSelectOrder = useCallback(
    (orderId) => {
      const id = String(orderId || "");
      if (!id) return;
      setSelectedOrders((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      });
    },
    [setSelectedOrders]
  );

  const handleSelectAll = useCallback(() => {
    const ids = orders.map(getOrderId).filter(Boolean);

    setSelectedOrders((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const prevSet = new Set(arr);
      const allSelected =
        ids.length > 0 && ids.every((id) => prevSet.has(id)) && arr.length === ids.length;
      return allSelected ? [] : ids;
    });
  }, [orders, setSelectedOrders]);

  const resetFilters = useCallback(() => {
    setFiltersUI((prev) => ({ ...prev, ...DEFAULT_FILTERS }));
  }, [setFiltersUI]);

  const handleRefresh = useCallback(() => {
    fetchOrdersRef.current?.();
    emitDashboardRefresh({ reason: "orders_manual_refresh" });
  }, []);

  const handleExport = useCallback((format) => {
    // console.log(`Exporting as ${format}`);
    notifySuccess(`Export ${format} en cours...`);
  }, [notifySuccess]);

  const handleBulkAction = useCallback((action) => {
    const ids = ordersStore.getState()?.selectedOrders ?? [];
    // console.log(`Bulk action: ${action}`, ids);
    notifySuccess(`Action ${action} appliquée à ${ids.length} commandes`);
    ordersStore.clearSelection();
  }, [notifySuccess]);

  const handleNewOrder = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  const handleCreateSuccess = useCallback(() => {
    closeCreateModal();
    fetchOrdersRef.current?.();
    notifySuccess("Commande créée avec succès");
    emitDashboardRefresh({ reason: "order_created" });
  }, [closeCreateModal, notifySuccess]);

  useEffect(() => {
    ordersStore.setHandlers({
      onRefresh: handleRefresh,
      onExport: handleExport,
      onBulkAction: handleBulkAction,
      onNewOrder: handleNewOrder,
    });

    return () => {
      ordersStore.reset();
    };
  }, [handleRefresh, handleExport, handleBulkAction, handleNewOrder]);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const id = String(orderId || "");
      if (!id) return;

      setActionBusy(true);
      setActionError("");

      const order = orders.find((o) => eqId(getOrderId(o), id)) || selectedOrder;
      const rid = resolveRestaurantIdForOrder({
        order,
        mode,
        restaurantIdForHook,
        storeRestaurantId,
        filters,
      });

      if (!rid) {
        setActionBusy(false);
        const errorMsg = "RestaurantId introuvable pour cette commande.";
        setActionError(errorMsg);
        notifyError(errorMsg);
        return;
      }

      try {
        await ordersApi.updateOrder(rid, id, { status: newStatus });
        await fetchOrdersRef.current?.();

        //  Notifier le changement de statut
        const updatedOrder = {
          orderNumber: order?.orderNumber || id,
          restaurant: order?.restaurant?.name || order?.restaurantName,
          items: order?.items || [],
          total: order?.total || order?.totalAmount,
          status: newStatus,
        };
        
        notifyStatusChange(updatedOrder, newStatus);

        emitDashboardRefresh({
          reason: "order_status_updated",
          orderId: id,
          status: newStatus,
          restaurantId: rid,
        });
      } catch (e) {
        const errorMsg = e?.message || "Erreur mise à jour statut";
        setActionError(errorMsg);
        notifyError(errorMsg);
      } finally {
        setActionBusy(false);
      }
    },
    [
      orders,
      selectedOrder,
      mode,
      restaurantIdForHook,
      storeRestaurantId,
      filters,
      notifyStatusChange,
      notifyError,
    ]
  );

  const handleUpdatePaymentStatus = useCallback(
    async (orderId, newStatus) => {
      const id = String(orderId || "");
      if (!id) return;

      setActionBusy(true);
      setActionError("");

      const order = orders.find((o) => eqId(getOrderId(o), id)) || selectedOrder;
      const rid = resolveRestaurantIdForOrder({
        order,
        mode,
        restaurantIdForHook,
        storeRestaurantId,
        filters,
      });

      if (!rid) {
        setActionBusy(false);
        const errorMsg = "RestaurantId introuvable pour cette commande.";
        setActionError(errorMsg);
        notifyError(errorMsg);
        return;
      }

      try {
        await ordersApi.updateOrder(rid, id, { payment_status: newStatus });
        await fetchOrdersRef.current?.();

        //  Notifier le succès
        notifySuccess(`Statut de paiement mis à jour : ${newStatus}`);

        emitDashboardRefresh({
          reason: "payment_status_updated",
          orderId: id,
          paymentStatus: newStatus,
          restaurantId: rid,
        });
      } catch (e) {
        const errorMsg = e?.message || "Erreur mise à jour paiement";
        setActionError(errorMsg);
        notifyError(errorMsg);
      } finally {
        setActionBusy(false);
      }
    },
    [
      orders,
      selectedOrder,
      mode,
      restaurantIdForHook,
      storeRestaurantId,
      filters,
      notifySuccess,
      notifyError,
    ]
  );

  const handleDeleteOrder = useCallback(
    async (orderOrObj) => {
      const id = typeof orderOrObj === "string" ? orderOrObj : getOrderId(orderOrObj);
      const order =
        typeof orderOrObj === "object"
          ? orderOrObj
          : orders.find((o) => eqId(getOrderId(o), id));

      if (!id) return;

      const rid = resolveRestaurantIdForOrder({
        order,
        mode,
        restaurantIdForHook,
        storeRestaurantId,
        filters,
      });

      if (!rid) {
        const errorMsg = "RestaurantId introuvable pour suppression.";
        setActionError(errorMsg);
        notifyError(errorMsg);
        return;
      }

      const ordersSnapshot = [...orders];
      const statsSnapshot = { ...stats };
      const paginationSnapshot = { ...pagination };

      setActionError("");
      removeOrderLocally(id);

      if (selectedOrder && eqId(getOrderId(selectedOrder), id)) {
        handleCloseModal();
      }

      try {
        await ordersApi.deleteOrder(rid, id);

        //  Notifier la suppression
        notifySuccess(`Commande #${id} supprimée avec succès`);

        emitDashboardRefresh({
          reason: "order_deleted",
          orderId: id,
          restaurantId: rid,
        });
      } catch (e) {
        restoreOrdersSnapshot(ordersSnapshot, statsSnapshot, paginationSnapshot);
        const errorMsg = e?.message || "Erreur suppression commande";
        setActionError(errorMsg);
        notifyError(errorMsg);
      }
    },
    [
      orders,
      stats,
      pagination,
      selectedOrder,
      mode,
      restaurantIdForHook,
      storeRestaurantId,
      filters,
      handleCloseModal,
      removeOrderLocally,
      restoreOrdersSnapshot,
      notifySuccess,
      notifyError,
    ]
  );

  const handlePrintOrder = useCallback((order) => {
    // console.log("PRINT ORDER", order);
    notifySuccess("Impression en cours...");
    window.print();
  }, [notifySuccess]);

  return (
    <div className={`orders-page ${isRestaurantMode ? "restaurant-mode" : "admin-mode"}`}>
      {/* Indicateur de connexion WebSocket */}
      {isConnected && (
        <div className="websocket-indicator">
          <span className="ws-dot"></span>
          <span>Temps réel activé</span>
        </div>
      )}

      <OrdersStats stats={stats} loading={loading} isRestaurantMode={isRestaurantMode} />

      <OrdersFilters
        filters={filters}
        onFiltersChange={setFiltersUI}
        isRestaurantMode={isRestaurantMode}
      />

      <div className="orders-content">
        {loading ? (
          <OrdersLoadingSkeleton />
        ) : error ? (
          <div className="orders-error">
            <p>
              {t("common.error")}: {error}
            </p>
            <button
              className="orders-btn orders-btn-primary"
              onClick={handleRefresh}
              type="button"
            >
              {t("common.retry")}
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
              onDelete={handleDeleteOrder}
              onPrint={handlePrintOrder}
              isRestaurantMode={isRestaurantMode}
            />

            <OrdersPagination
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={loading}
            />
          </>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onDelete={handleDeleteOrder}
          onPrint={handlePrintOrder}
          busy={actionBusy}
          errorMessage={actionError}
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={t("orders.createOrder", "Nouvelle Commande")}
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