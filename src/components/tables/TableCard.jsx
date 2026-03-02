// src/components/tables/TableCard.jsx
import React, { useState } from 'react';
import {
  RiQrCodeLine,
  RiDeleteBinLine,
  RiMoreLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCalendarCheckLine
} from 'react-icons/ri';
import './css/TableComponents.css';

const STATUS_CONFIG = {
  libre: {
    label: 'Libre',
    icon: RiCheckboxCircleLine,
    color: 'success'
  },
  occupee: {
    label: 'Occupée',
    icon: RiTimeLine,
    color: 'warning'
  },
  reservee: {
    label: 'Réservée',
    icon: RiCalendarCheckLine,
    color: 'info'
  }
};

const TableCard = ({ table, onStatusChange, onShowQR, onDelete, getMenuUrl }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = table.status || 'libre';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.libre;
  const StatusIcon = config.icon;

  const handleStatusSelect = (newStatus) => {
    onStatusChange(table._id, newStatus);
    setShowStatusMenu(false);
  };

  return (
    <div className={`table-card table-card-${config.color}`}>
      {/* Header */}
      <div className="table-card-header">
        <div className="table-card-number">
          <span className="table-number-label">Table</span>
          <span className="table-number-value">{table.numero || table.number || '?'}</span>
        </div>
        
        <div className="table-card-actions">
          <button 
            className="table-action-btn"
            onClick={() => onShowQR(table)}
            title="Voir QR Code"
          >
            <RiQrCodeLine />
          </button>
          
          <div className="table-menu-wrapper">
            <button 
              className="table-action-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <RiMoreLine />
            </button>
            
            {showMenu && (
              <div className="table-dropdown">
                <button onClick={() => { onShowQR(table); setShowMenu(false); }}>
                  <RiQrCodeLine />
                  <span>Voir QR Code</span>
                </button>
                <button 
                  className="danger" 
                  onClick={() => { onDelete(table._id); setShowMenu(false); }}
                >
                  <RiDeleteBinLine />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="table-card-status">
        <div className="status-selector-wrapper">
          <button 
            className={`status-badge status-badge-${config.color}`}
            onClick={() => setShowStatusMenu(!showStatusMenu)}
          >
            <StatusIcon />
            <span>{config.label}</span>
          </button>
          
          {showStatusMenu && (
            <div className="status-dropdown">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`status-option ${status === key ? 'active' : ''}`}
                  onClick={() => handleStatusSelect(key)}
                >
                  <cfg.icon />
                  <span>{cfg.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      {table.nom && (
        <div className="table-card-info">
          <span className="table-info-label">Nom:</span>
          <span className="table-info-value">{table.nom}</span>
        </div>
      )}

      {table.capacite && (
        <div className="table-card-info">
          <span className="table-info-label">Capacité:</span>
          <span className="table-info-value">{table.capacite} personnes</span>
        </div>
      )}

      {/* QR Preview */}
      <div className="table-card-qr" onClick={() => onShowQR(table)}>
        {table.qrCode ? (
          <img src={table.qrCode} alt={`QR Table ${table.numero}`} />
        ) : (
          <div className="qr-placeholder">
            <RiQrCodeLine />
            <span>Générer QR</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCard;