// src/pages/Restaurant/Tables/RestaurantTablesPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiAddLine,
  RiRefreshLine,
  RiLoader4Line,
  RiTableLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCalendarCheckLine,
  RiQrCodeLine,
  RiSearchLine,
  RiGridLine,
  RiListCheck
} from 'react-icons/ri';
import { useTables } from '../../../hooks/useTables';
import TableCard from '../../../components/tables/TableCard';
import TableForm from '../../../components/tables/TableForm';
import TableQRModal from '../../../components/tables/TableQRModal';
import Modal from '../../../components/common/Modal';
import './RestaurantTablesPage.css';

const RestaurantTablesPage = () => {
  const { t } = useTranslation();
  
  const {
    tables,
    stats,
    loading,
    error,
    saving,
    restaurantId,
    fetchTables,
    createTable,
    createMultipleTables,
    updateTable,
    updateStatus,
    deleteTable,
    regenerateQR,
    getMenuUrl
  } = useTables();

  // États locaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filtrer les tables
  const filteredTables = tables.filter(table => {
    const matchSearch = !searchQuery || 
      (table.numero?.toString().includes(searchQuery)) ||
      (table.nom?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || 
      (table.status || 'libre') === statusFilter;

    return matchSearch && matchStatus;
  });

  // Handlers
  const handleCreateTable = async (data) => {
    const result = await createTable(data);
    if (result.success) {
      setShowCreateModal(false);
      showMessage('success', 'Table créée avec succès !');
    } else {
      showMessage('error', result.error);
    }
    return result;
  };

  const handleCreateMultiple = async (count) => {
    const result = await createMultipleTables(count);
    if (result.success) {
      setShowCreateModal(false);
      showMessage('success', `${count} tables créées avec succès !`);
    } else {
      showMessage('error', result.error);
    }
    return result;
  };

  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateStatus(tableId, newStatus);
    if (!result.success) {
      showMessage('error', result.error);
    }
  };

  const handleDelete = async (tableId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) return;
    
    const result = await deleteTable(tableId);
    if (result.success) {
      showMessage('success', 'Table supprimée');
    } else {
      showMessage('error', result.error);
    }
  };

  const handleShowQR = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleRegenerateQR = async (tableId) => {
    const result = await regenerateQR(tableId);
    if (result.success) {
      setSelectedTable(result.table);
      showMessage('success', 'QR code régénéré !');
    } else {
      showMessage('error', result.error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="tables-page">
      {/* Header */}
      <div className="tables-header">
        <div className="tables-header-info">
          <h1>
            <RiTableLine />
            Gestion des Tables
          </h1>
          <p>Gérez vos tables et générez des QR codes pour les commandes</p>
        </div>
        <div className="tables-header-actions">
          <button 
            className="tables-btn tables-btn-secondary"
            onClick={fetchTables}
            disabled={loading}
          >
            <RiRefreshLine className={loading ? 'spin' : ''} />
            <span>Actualiser</span>
          </button>
          <button 
            className="tables-btn tables-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <RiAddLine />
            <span>Nouvelle Table</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`tables-message tables-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="tables-stats">
        <div className="tables-stat-card">
          <div className="tables-stat-icon total">
            <RiTableLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.total}</span>
            <span className="tables-stat-label">Total Tables</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon libre">
            <RiCheckboxCircleLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.libre}</span>
            <span className="tables-stat-label">Libres</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon occupee">
            <RiTimeLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.occupee}</span>
            <span className="tables-stat-label">Occupées</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon reservee">
            <RiCalendarCheckLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.reservee}</span>
            <span className="tables-stat-label">Réservées</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tables-filters">
        <div className="tables-search">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Rechercher une table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="tables-filter-buttons">
          {['all', 'libre', 'occupee', 'reservee'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Toutes' : 
               status === 'libre' ? 'Libres' : 
               status === 'occupee' ? 'Occupées' : 'Réservées'}
            </button>
          ))}
        </div>

        <div className="tables-view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vue grille"
          >
            <RiGridLine />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vue liste"
          >
            <RiListCheck />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="tables-content">
        {loading ? (
          <div className="tables-loading">
            <RiLoader4Line className="spin" />
            <span>Chargement des tables...</span>
          </div>
        ) : error ? (
          <div className="tables-error">
            <p>{error}</p>
            <button className="tables-btn tables-btn-primary" onClick={fetchTables}>
              Réessayer
            </button>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="tables-empty">
            <div className="tables-empty-icon">
              <RiTableLine />
            </div>
            <h3>Aucune table trouvée</h3>
            <p>
              {tables.length === 0 
                ? "Commencez par créer vos tables pour générer des QR codes"
                : "Aucune table ne correspond à vos filtres"
              }
            </p>
            {tables.length === 0 && (
              <button 
                className="tables-btn tables-btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <RiAddLine />
                Créer des tables
              </button>
            )}
          </div>
        ) : (
          <div className={`tables-grid ${viewMode}`}>
            {filteredTables.map((table) => (
              <TableCard
                key={table._id}
                table={table}
                onStatusChange={handleStatusChange}
                onShowQR={handleShowQR}
                onDelete={handleDelete}
                getMenuUrl={getMenuUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer des tables"
        size="medium"
      >
        <TableForm
          onSubmit={handleCreateTable}
          onCreateMultiple={handleCreateMultiple}
          onCancel={() => setShowCreateModal(false)}
          saving={saving}
          existingNumbers={tables.map(t => t.numero)}
        />
      </Modal>

      {/* Modal QR Code */}
      {selectedTable && (
        <TableQRModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          menuUrl={getMenuUrl(selectedTable._id, selectedTable.numero)}
          onRegenerate={() => handleRegenerateQR(selectedTable._id)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default RestaurantTablesPage;