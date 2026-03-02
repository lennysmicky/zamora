// src/pages/Restaurant/Tables/RestaurantTablesPage.jsx
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  RiAddLine,
  RiRefreshLine,
  RiLoader4Line,
  RiTableLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCalendarCheckLine,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Ref pour générer QR hors écran (téléchargement/impression)
  const qrRef = useRef(null);

  // Filtrer les tables
  const filteredTables = tables.filter(table => {
    const matchSearch = !searchQuery || 
      (table.numero?.toString().includes(searchQuery)) ||
      (table.nom?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || 
      (table.status || 'libre') === statusFilter;

    return matchSearch && matchStatus;
  });

  // ========== HANDLERS ==========

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Créer une table
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

  // Créer plusieurs tables
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

  // Modifier une table
  const handleEditTable = async (data) => {
    const result = await updateTable(data._id, data);
    if (result.success) {
      setShowEditModal(false);
      setSelectedTable(null);
      showMessage('success', 'Table modifiée !');
    } else {
      showMessage('error', result.error);
    }
    return result;
  };

  // Ouvrir modal édition
  const handleOpenEdit = (table) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  // Changer statut
  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateStatus(tableId, newStatus);
    if (!result.success) {
      showMessage('error', result.error);
    }
  };

  // Supprimer
  const handleDelete = async (tableId) => {
    if (!confirm('Supprimer cette table ?')) return;
    
    const result = await deleteTable(tableId);
    if (result.success) {
      showMessage('success', 'Table supprimée');
    } else {
      showMessage('error', result.error);
    }
  };

  // Afficher QR modal
  const handleShowQR = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  // Régénérer QR
  const handleRegenerateQR = async (tableId) => {
    const result = await regenerateQR(tableId);
    if (result.success) {
      if (selectedTable && selectedTable._id === tableId) {
        setSelectedTable(result.table);
      }
      showMessage('success', 'QR code régénéré !');
    } else {
      showMessage('error', result.error);
    }
    return result;
  };

  // Télécharger QR
  const handleDownloadQR = (table, menuUrl) => {
    const tableNumber = table.numero || table.number || '?';
    
    // Créer un canvas temporaire
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 380;
    
    // Background blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Créer QR en SVG puis convertir
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        ${document.querySelector('.qr-temp-container svg')?.innerHTML || ''}
      </svg>
    `;
    
    // Utiliser une approche plus simple avec QRCode lib
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvas, menuUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }, (err) => {
        if (err) {
          console.error('Erreur génération QR:', err);
          return;
        }
        
        // Ajouter le texte
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Table ${tableNumber}`, 150, 280);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Scannez pour commander', 150, 310);
        
        // Télécharger
        const link = document.createElement('a');
        link.download = `table-${tableNumber}-qr.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  // Imprimer QR
  const handlePrintQR = (table, menuUrl) => {
    const tableNumber = table.numero || table.number || '?';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${tableNumber} - QR Code</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 30px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
            }
            canvas { margin-bottom: 20px; }
            h1 { font-size: 32px; margin: 10px 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <canvas id="qr"></canvas>
            <h1>Table ${tableNumber}</h1>
            <p>Scannez pour commander</p>
          </div>
          <script>
            QRCode.toCanvas(document.getElementById('qr'), '${menuUrl}', { width: 200 }, function(err) {
              if (!err) {
                window.print();
                window.close();
              }
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ========== RENDER ==========
  return (
    <div className="tables-page">
      {/* Header */}
      <div className="tables-header">
        <div className="tables-header-info">
          <h1>
            <RiTableLine />
            Gestion des Tables
          </h1>
          <p>Gérez vos tables et QR codes</p>
        </div>
        <div className="tables-header-actions">
          <button 
            className="tables-btn tables-btn-secondary"
            onClick={fetchTables}
            disabled={loading}
          >
            <RiRefreshLine className={loading ? 'spin' : ''} />
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
          <div className="tables-stat-icon total"><RiTableLine /></div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.total}</span>
            <span className="tables-stat-label">Total</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon libre"><RiCheckboxCircleLine /></div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.libre}</span>
            <span className="tables-stat-label">Libres</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon occupee"><RiTimeLine /></div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats.occupee}</span>
            <span className="tables-stat-label">Occupées</span>
          </div>
        </div>
        <div className="tables-stat-card">
          <div className="tables-stat-icon reservee"><RiCalendarCheckLine /></div>
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
            placeholder="Rechercher..."
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
          >
            <RiGridLine />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
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
            <span>Chargement...</span>
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
            <div className="tables-empty-icon"><RiTableLine /></div>
            <h3>Aucune table</h3>
            <p>{tables.length === 0 ? "Créez vos tables pour générer des QR codes" : "Aucun résultat"}</p>
            {tables.length === 0 && (
              <button className="tables-btn tables-btn-primary" onClick={() => setShowCreateModal(true)}>
                <RiAddLine /> Créer des tables
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Liste Header (vue liste) */}
            {viewMode === 'list' && (
              <div className="tables-list-header">
                <div className="list-col">N°</div>
                <div className="list-col">Nom</div>
                <div className="list-col">Capacité</div>
                <div className="list-col">Statut</div>
                <div className="list-col">QR</div>
                <div className="list-col">Actions</div>
              </div>
            )}
            
            <div className={`tables-grid ${viewMode}`}>
              {filteredTables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  viewMode={viewMode}
                  onStatusChange={handleStatusChange}
                  onShowQR={handleShowQR}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onDownloadQR={handleDownloadQR}
                  onPrintQR={handlePrintQR}
                  getMenuUrl={getMenuUrl}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer des tables"
        size="small"
      >
        <TableForm
          onSubmit={handleCreateTable}
          onCreateMultiple={handleCreateMultiple}
          onCancel={() => setShowCreateModal(false)}
          saving={saving}
          existingNumbers={tables.map(t => t.numero || t.number)}
        />
      </Modal>

      {/* Modal Modification */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedTable(null); }}
        title="Modifier la table"
        size="small"
      >
        <TableForm
          table={selectedTable}
          onSubmit={handleEditTable}
          onCancel={() => { setShowEditModal(false); setSelectedTable(null); }}
          onRegenerateQR={handleRegenerateQR}
          saving={saving}
          existingNumbers={tables.map(t => t.numero || t.number)}
        />
      </Modal>

      {/* Modal QR Code */}
      {selectedTable && (
        <TableQRModal
          isOpen={showQRModal}
          onClose={() => { setShowQRModal(false); setSelectedTable(null); }}
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