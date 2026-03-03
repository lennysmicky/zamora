// src/pages/Orders/OrdersPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { ordersStore } from "../../stores/ordersStore";
import { useSelectedOrders, useIsCreateModalOpen } from "../../hooks/useOrdersStore";
import useAuthStore from "../../stores/authStore";

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

import { ordersApi } from "../../api/orders"; //  AJOUT
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

const resolveRestaurantIdForOrder = ({ order, mode, restaurantIdForHook, storeRestaurantId, filters }) => {
  if (mode === "restaurant") return restaurantIdForHook || storeRestaurantId || null;

  // admin: on tente dans la commande, sinon dans le filtre restaurant
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

  const forcedMode = modeProp === "restaurant" ? "restaurant" : modeProp === "admin" ? "admin" : null;

  const isRestaurantMode =
    forcedMode === "restaurant" || userType === "restaurant" || Boolean(restaurantIdProp);

  const mode = forcedMode ?? (isRestaurantMode ? "restaurant" : "admin");

  const restaurantIdForHook = useMemo(() => {
    if (mode !== "restaurant") return null;
    return restaurantIdProp || storeRestaurantId || null;
  }, [mode, restaurantIdProp, storeRestaurantId]);

  const { initialFilters, initialPagination } = useMemo(() => {
    if (disableUrlSync || mode === "restaurant") {
      return { initialFilters: DEFAULT_FILTERS, initialPagination: { currentPage: 1, itemsPerPage: 10 } };
    }
    return readOrdersSearchParams(searchParams, { defaults: DEFAULT_FILTERS, mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQS, mode, disableUrlSync]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //  feedback actions modal (update/delete)
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
  } = useOrders({
    restaurantId: restaurantIdForHook,
    mode,
    initialFilters,
    initialPagination,
  });

  const setFiltersUI = useCallback(
    (updater) => {
      setFilters((prev) => (typeof updater === "function" ? updater(prev) : updater));
      setPagination((p) => ({ ...p, currentPage: 1 }));
    },
    [setFilters, setPagination]
  );

  // URL -> State (admin only)
  useEffect(() => {
    if (disableUrlSync || mode === "restaurant") return;
    if (lastWrittenQSRef.current === currentQS) return;

    const { initialFilters: fFromUrl, initialPagination: pFromUrl } = readOrdersSearchParams(searchParams, {
      defaults: DEFAULT_FILTERS,
      mode,
    });

    setFilters(fFromUrl);
    setPagination((p) => ({
      ...p,
      currentPage: pFromUrl.currentPage,
      itemsPerPage: pFromUrl.itemsPerPage,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQS, mode, disableUrlSync]);

  // State -> URL (admin only)
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
  }, [filters, pagination.currentPage, pagination.itemsPerPage, mode, currentQS, setSearchParams, disableUrlSync]);

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

  //  IMPORTANT: garder le modal synchro avec la liste (sinon stale)
  useEffect(() => {
    if (!selectedOrder) return;
    const id = getOrderId(selectedOrder);
    if (!id) return;
    const fresh = orders.find((o) => eqId(getOrderId(o), id));
    if (fresh && fresh !== selectedOrder) setSelectedOrder(fresh);
  }, [orders, selectedOrder]);

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
      const allSelected = ids.length > 0 && ids.every((id) => prevSet.has(id)) && arr.length === ids.length;
      return allSelected ? [] : ids;
    });
  }, [orders, setSelectedOrders]);

  const resetFilters = useCallback(() => {
    setFiltersUI((prev) => ({ ...prev, ...DEFAULT_FILTERS }));
  }, [setFiltersUI]);

  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  const handleRefresh = useCallback(() => {
    fetchOrdersRef.current?.();
  }, []);

  const handleExport = useCallback((format) => {
    console.log(`Exporting as ${format}`);
  }, []);

  const handleBulkAction = useCallback((action) => {
    const ids = ordersStore.getState()?.selectedOrders ?? [];
    console.log(`Bulk action: ${action}`, ids);
    ordersStore.clearSelection();
  }, []);

  const handleNewOrder = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  const handleCreateSuccess = useCallback(() => {
    closeCreateModal();
    fetchOrdersRef.current?.();
  }, [closeCreateModal]);

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

  useEffect(() => {
    ordersStore.setOrders(orders);

    const idsSet = new Set(orders.map(getOrderId).filter(Boolean));
    ordersStore.setSelectedOrders((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter((id) => idsSet.has(id));
    });
  }, [orders]);

  //  UPDATE status (fonctionne en restaurant ET admin)
  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const id = String(orderId || "");
      if (!id) return;

      setActionBusy(true);
      setActionError("");

      const order = orders.find((o) => eqId(getOrderId(o), id)) || selectedOrder;
      const rid = resolveRestaurantIdForOrder({ order, mode, restaurantIdForHook, storeRestaurantId, filters });

      if (!rid) {
        setActionBusy(false);
        setActionError("RestaurantId introuvable pour cette commande.");
        return;
      }

      try {
        await ordersApi.updateOrder(rid, id, { status: newStatus });
        await fetchOrdersRef.current?.();
      } catch (e) {
        setActionError(e?.message || "Erreur mise à jour statut");
      } finally {
        setActionBusy(false);
      }
    },
    [orders, selectedOrder, mode, restaurantIdForHook, storeRestaurantId, filters]
  );

  const handleUpdatePaymentStatus = useCallback(
    async (orderId, newStatus) => {
      const id = String(orderId || "");
      if (!id) return;

      setActionBusy(true);
      setActionError("");

      const order = orders.find((o) => eqId(getOrderId(o), id)) || selectedOrder;
      const rid = resolveRestaurantIdForOrder({ order, mode, restaurantIdForHook, storeRestaurantId, filters });

      if (!rid) {
        setActionBusy(false);
        setActionError("RestaurantId introuvable pour cette commande.");
        return;
      }

      try {
        await ordersApi.updateOrder(rid, id, { payment_status: newStatus });
        await fetchOrdersRef.current?.();
      } catch (e) {
        setActionError(e?.message || "Erreur mise à jour paiement");
      } finally {
        setActionBusy(false);
      }
    },
    [orders, selectedOrder, mode, restaurantIdForHook, storeRestaurantId, filters]
  );

  //  DELETE (depuis table OU modal)
  const handleDeleteOrder = useCallback(
    async (orderOrObj) => {
      const id = typeof orderOrObj === "string" ? orderOrObj : getOrderId(orderOrObj);
      const order = typeof orderOrObj === "object" ? orderOrObj : orders.find((o) => eqId(getOrderId(o), id));

      if (!id) return;

      setActionBusy(true);
      setActionError("");

      const rid = resolveRestaurantIdForOrder({ order, mode, restaurantIdForHook, storeRestaurantId, filters });
      if (!rid) {
        setActionBusy(false);
        setActionError("RestaurantId introuvable pour suppression.");
        return;
      }

      try {
        await ordersApi.deleteOrder(rid, id);
        if (selectedOrder && eqId(getOrderId(selectedOrder), id)) handleCloseModal();
        await fetchOrdersRef.current?.();
      } catch (e) {
        setActionError(e?.message || "Erreur suppression commande");
      } finally {
        setActionBusy(false);
      }
    },
    [orders, selectedOrder, mode, restaurantIdForHook, storeRestaurantId, filters, handleCloseModal]
  );

  const handlePrintOrder = useCallback((order) => {
    // Simple fallback (à remplacer par une vraie facture si tu veux)
    console.log("PRINT ORDER", order);
    window.print();
  }, []);

  return (
    <div className={`orders-page ${isRestaurantMode ? "restaurant-mode" : "admin-mode"}`}>
      <OrdersStats stats={stats} loading={loading} isRestaurantMode={isRestaurantMode} />

      <OrdersFilters filters={filters} onFiltersChange={setFiltersUI} isRestaurantMode={isRestaurantMode} />

      <div className="orders-content">
        {loading ? (
          <OrdersLoadingSkeleton />
        ) : error ? (
          <div className="orders-error">
            <p>
              {t("common.error")}: {error}
            </p>
            <button className="orders-btn orders-btn-primary" onClick={handleRefresh} type="button">
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
              onDelete={handleDeleteOrder}   //  AJOUT
              onPrint={handlePrintOrder}     //  AJOUT
              isRestaurantMode={isRestaurantMode}
            />

            <OrdersPagination pagination={pagination} onPaginationChange={setPagination} isLoading={loading} />
          </>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}                 //  remplacé par wrapper robuste
          onUpdatePaymentStatus={handleUpdatePaymentStatus}   //  remplacé par wrapper robuste
          onDelete={handleDeleteOrder}                         //  AJOUT
          onPrint={handlePrintOrder}                           //  AJOUT
          busy={actionBusy}                                    //  AJOUT
          errorMessage={actionError}                            //  AJOUT
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