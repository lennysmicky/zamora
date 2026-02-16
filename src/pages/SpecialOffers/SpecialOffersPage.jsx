// src/pages/SpecialOffers/SpecialOffersPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSpecialOffers from '../../hooks/useSpecialOffers';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Components
import AdminSpecialOffersTabs from '../../components/SpecialOffers/AdminSpecialOffersTabs';
import AdminSpecialOffersStats from '../../components/SpecialOffers/AdminSpecialOffersStats';
import AdminSpecialOffersFilters from '../../components/SpecialOffers/AdminSpecialOffersFilters';
import SpecialOffersTable from '../../components/SpecialOffers/SpecialOffersTable';
import SpecialOfferForm from '../../components/SpecialOffers/SpecialOfferForm';
import SpecialOfferDetail from '../../components/SpecialOffers/SpecialOfferDetail';

import './SpecialOffersPage.css';

const SpecialOffersPage = () => {
  const { t } = useTranslation();

  // Hook (isAdmin = true)
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
  } = useSpecialOffers(true);

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
    <div className="admin-special-offers-page">
      {/* Tabs + Actions */}
      <AdminSpecialOffersTabs
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

      {/* Content based on tab */}
      {activeTab === 'list' && (
        <>
          {/* Stats */}
          <AdminSpecialOffersStats
            stats={stats}
            formatAmount={formatAmount}
            t={t}
          />

          {/* Filters */}
          <AdminSpecialOffersFilters
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
            isAdmin={true}
            t={t}
          />
        </>
      )}

      {activeTab === 'templates' && (
        <AdminTemplatesTab
          onCreateTemplate={handleCreateNew}
          t={t}
        />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalyticsTab
          stats={stats}
          formatAmount={formatAmount}
          t={t}
        />
      )}

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
          isAdmin={true}
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
            isAdmin={true}
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

// ============================================
// ADMIN TEMPLATES TAB
// ============================================
const AdminTemplatesTab = ({ onCreateTemplate, t }) => {
  const templates = [
    {
      id: 1,
      name: t('specialOffers.templates.happyHour', 'Happy Hour'),
      description: t('specialOffers.templates.happyHourDesc', 'Réduction sur les boissons de 16h à 19h'),
      type: 'percentage',
      value: 20,
      icon: '🍺'
    },
    {
      id: 2,
      name: t('specialOffers.templates.lunchMenu', 'Menu du midi'),
      description: t('specialOffers.templates.lunchMenuDesc', 'Prix spécial pour le déjeuner'),
      type: 'special_price',
      value: 3500,
      icon: '🍽️'
    },
    {
      id: 3,
      name: t('specialOffers.templates.freeDelivery', 'Livraison gratuite'),
      description: t('specialOffers.templates.freeDeliveryDesc', 'Livraison offerte dès 10 000 F'),
      type: 'free_delivery',
      value: 0,
      icon: '🚚'
    },
    {
      id: 4,
      name: t('specialOffers.templates.buyOneGetOne', '1 acheté = 1 offert'),
      description: t('specialOffers.templates.buyOneGetOneDesc', 'Le 2ème produit identique offert'),
      type: 'bogo',
      value: 0,
      icon: '🎁'
    },
    {
      id: 5,
      name: t('specialOffers.templates.weekendBundle', 'Bundle Weekend'),
      description: t('specialOffers.templates.weekendBundleDesc', 'Menu + boisson + dessert à prix réduit'),
      type: 'bundle',
      value: 0,
      icon: '📦'
    },
    {
      id: 6,
      name: t('specialOffers.templates.firstOrder', 'Première commande'),
      description: t('specialOffers.templates.firstOrderDesc', 'Réduction pour les nouveaux clients'),
      type: 'percentage',
      value: 15,
      icon: '🆕'
    }
  ];

  return (
    <div className="admin-templates">
      <div className="templates-header">
        <h3>{t('specialOffers.templates.title', 'Templates d\'offres')}</h3>
        <p>{t('specialOffers.templates.subtitle', 'Utilisez ces modèles pour créer rapidement des offres')}</p>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-icon">{template.icon}</div>
            <div className="template-content">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
            <button 
              className="template-use-btn"
              onClick={() => onCreateTemplate(template)}
            >
              {t('specialOffers.templates.use', 'Utiliser')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ADMIN ANALYTICS TAB
// ============================================
const AdminAnalyticsTab = ({ stats, formatAmount, t }) => {
  return (
    <div className="admin-analytics">
      {/* Top Performing Offers */}
      <div className="analytics-section">
        <h3>{t('specialOffers.analytics.topOffers', 'Offres les plus performantes')}</h3>
        
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-rank">1</span>
              <span className="analytics-title">Happy Hour -20%</span>
            </div>
            <div className="analytics-card-stats">
              <div className="mini-stat">
                <span className="mini-stat-value">{formatAmount(15420)}</span>
                <span className="mini-stat-label">{t('specialOffers.stats.revenue', 'CA')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">342</span>
                <span className="mini-stat-label">{t('specialOffers.stats.redemptions', 'Utilisations')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">12.5%</span>
                <span className="mini-stat-label">{t('specialOffers.stats.conversion', 'Conv.')}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-rank">2</span>
              <span className="analytics-title">Menu Weekend</span>
            </div>
            <div className="analytics-card-stats">
              <div className="mini-stat">
                <span className="mini-stat-value">{formatAmount(12800)}</span>
                <span className="mini-stat-label">{t('specialOffers.stats.revenue', 'CA')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">256</span>
                <span className="mini-stat-label">{t('specialOffers.stats.redemptions', 'Utilisations')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">10.2%</span>
                <span className="mini-stat-label">{t('specialOffers.stats.conversion', 'Conv.')}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-rank">3</span>
              <span className="analytics-title">Livraison gratuite</span>
            </div>
            <div className="analytics-card-stats">
              <div className="mini-stat">
                <span className="mini-stat-value">{formatAmount(9500)}</span>
                <span className="mini-stat-label">{t('specialOffers.stats.revenue', 'CA')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">189</span>
                <span className="mini-stat-label">{t('specialOffers.stats.redemptions', 'Utilisations')}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">8.7%</span>
                <span className="mini-stat-label">{t('specialOffers.stats.conversion', 'Conv.')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* By Restaurant */}
      <div className="analytics-section">
        <h3>{t('specialOffers.analytics.byRestaurant', 'Par restaurant')}</h3>
        
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>{t('specialOffers.analytics.restaurant', 'Restaurant')}</th>
                <th>{t('specialOffers.analytics.activeOffers', 'Offres actives')}</th>
                <th>{t('specialOffers.stats.redemptions', 'Utilisations')}</th>
                <th>{t('specialOffers.stats.revenue', 'CA généré')}</th>
                <th>{t('specialOffers.stats.conversion', 'Taux conv.')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Le Gourmet</td>
                <td>5</td>
                <td>342</td>
                <td>{formatAmount(45000)} F</td>
                <td>12.5%</td>
              </tr>
              <tr>
                <td>Pizza Express</td>
                <td>3</td>
                <td>256</td>
                <td>{formatAmount(32000)} F</td>
                <td>10.2%</td>
              </tr>
              <tr>
                <td>Burger House</td>
                <td>4</td>
                <td>189</td>
                <td>{formatAmount(28500)} F</td>
                <td>9.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="analytics-section">
        <h3>{t('specialOffers.analytics.summary', 'Résumé global')}</h3>
        
        <div className="summary-grid">
          <div className="summary-card primary">
            <span className="summary-value">{formatAmount(stats.totalRevenue || 0)}</span>
            <span className="summary-label">{t('specialOffers.analytics.totalRevenue', 'CA total généré')}</span>
            <span className="summary-suffix">F CFA</span>
          </div>
          <div className="summary-card success">
            <span className="summary-value">{stats.totalRedemptions || 0}</span>
            <span className="summary-label">{t('specialOffers.analytics.totalRedemptions', 'Utilisations totales')}</span>
          </div>
          <div className="summary-card warning">
            <span className="summary-value">{stats.activeOffers || 0}</span>
            <span className="summary-label">{t('specialOffers.analytics.activeOffers', 'Offres actives')}</span>
          </div>
          <div className="summary-card info">
            <span className="summary-value">{stats.conversionRate || 0}%</span>
            <span className="summary-label">{t('specialOffers.analytics.avgConversion', 'Conversion moyenne')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersPage;