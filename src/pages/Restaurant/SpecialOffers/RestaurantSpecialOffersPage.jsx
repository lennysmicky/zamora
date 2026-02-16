// src/pages/Restaurant/SpecialOffers/RestaurantSpecialOffersPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSpecialOffers from '../../../hooks/useSpecialOffers';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// Components
import SpecialOffersTabs from '../../../components/SpecialOffers/SpecialOffersTabs';
import SpecialOffersStats from '../../../components/SpecialOffers/SpecialOffersStats';
import SpecialOffersFilters from '../../../components/SpecialOffers/SpecialOffersFilters';
import SpecialOffersTable from '../../../components/SpecialOffers/SpecialOffersTable';
import SpecialOfferForm from '../../../components/SpecialOffers/SpecialOfferForm';
import SpecialOfferDetail from '../../../components/SpecialOffers/SpecialOfferDetail';

import './specialOffers.css';

const RestaurantSpecialOffersPage = () => {
  const { t } = useTranslation();

  // Hook - Utiliser le hook correctement
  const {
    offers,
    selectedOffer,
    setSelectedOffer,
    stats,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    changePage,
    fetchOffers,
    fetchOfferDetail,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    duplicateOffer,
    fetchOfferHistory,
    generatePromoCode,
    loading,
    error,
    success
  } = useSpecialOffers(false); // false = pas admin

  // Local states
  const [activeTab, setActiveTab] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerHistory, setOfferHistory] = useState([]);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    offer: null
  });

  // Handlers
  const handleCreateNew = () => {
    setEditingOffer(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (offer) => {
    const detail = await fetchOfferDetail(offer._id || offer.id);
    if (detail) {
      setEditingOffer(detail);
      setIsFormOpen(true);
    }
  };

  const handleView = async (offer) => {
    const detail = await fetchOfferDetail(offer._id || offer.id);
    if (detail) {
      const history = await fetchOfferHistory(offer._id || offer.id);
      setOfferHistory(history);
      setIsDetailOpen(true);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOffer(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOffer(null);
    setOfferHistory([]);
  };

  const handleSubmitForm = async (data) => {
    let result;
    if (editingOffer) {
      result = await updateOffer(editingOffer._id || editingOffer.id, data);
    } else {
      result = await createOffer(data);
    }
    
    if (result) {
      handleCloseForm();
    }
  };

  const handleToggleStatus = (offer) => {
    setConfirmDialog({
      isOpen: true,
      type: 'toggle',
      offer
    });
  };

  const handleDelete = (offer) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      offer
    });
  };

  const handleConfirmDialog = async () => {
    const { type, offer } = confirmDialog;
    
    if (type === 'delete') {
      await deleteOffer(offer._id || offer.id);
    } else if (type === 'toggle') {
      const newStatus = offer.status !== 'active';
      await toggleOfferStatus(offer._id || offer.id, newStatus);
    }
    
    setConfirmDialog({ isOpen: false, type: null, offer: null });
  };

  const handleDuplicate = async (offer) => {
    await duplicateOffer(offer._id || offer.id);
  };

  const handleRefresh = () => {
    fetchOffers();
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
      year: 'numeric'
    });
  };

  return (
    <div className="special-offers-page">
      {/* Tabs + Actions */}
      <SpecialOffersTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        onCreate={handleCreateNew}
        loading={loading}
        t={t}
      />

      {/* Success/Error Messages */}
      {success && (
        <div className="offers-toast success">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="offers-toast error">
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <SpecialOffersStats
        stats={stats}
        formatAmount={formatAmount}
        t={t}
      />

      {/* Filters */}
      <SpecialOffersFilters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        t={t}
      />

      {/* Table */}
      <SpecialOffersTable
        offers={offers}
        loading={loading}
        pagination={pagination}
        changePage={changePage}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        formatAmount={formatAmount}
        formatDate={formatDate}
        t={t}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingOffer 
          ? t('specialOffers.form.editTitle', 'Modifier l\'offre')
          : t('specialOffers.form.createTitle', 'Nouvelle offre spéciale')
        }
        size="large"
      >
        <SpecialOfferForm
          offer={editingOffer}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
          onGenerateCode={generatePromoCode}
          loading={loading.saving}
          t={t}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title={t('specialOffers.detail.title', 'Détail de l\'offre')}
        size="large"
      >
        {selectedOffer && (
          <SpecialOfferDetail
            offer={selectedOffer}
            history={offerHistory}
            onEdit={() => {
              handleCloseDetail();
              handleEdit(selectedOffer);
            }}
            onToggleStatus={() => handleToggleStatus(selectedOffer)}
            formatAmount={formatAmount}
            formatDate={formatDate}
            t={t}
          />
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, offer: null })}
        onConfirm={handleConfirmDialog}
        title={
          confirmDialog.type === 'delete'
            ? t('specialOffers.delete.title', 'Supprimer l\'offre')
            : t('specialOffers.toggle.title', 'Changer le statut')
        }
        message={
          confirmDialog.type === 'delete'
            ? t('specialOffers.delete.message', 'Êtes-vous sûr de vouloir supprimer cette offre ?')
            : confirmDialog.offer?.status === 'active'
              ? t('specialOffers.toggle.deactivate', 'Voulez-vous désactiver cette offre ?')
              : t('specialOffers.toggle.activate', 'Voulez-vous activer cette offre ?')
        }
        confirmText={t('common.confirm', 'Confirmer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  );
};

// ⬇️ IMPORTANT : Exporter le COMPOSANT, pas le hook !
export default RestaurantSpecialOffersPage;