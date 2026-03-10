import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  RiQrCodeLine,
  RiDeleteBinLine,
  RiEditLine,
  RiDownloadLine,
  RiPrinterLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCalendarCheckLine,
  RiEyeLine
} from 'react-icons/ri';
import './css/TableComponents.css';

const STATUS_CONFIG = {
  libre: { label: 'Libre', icon: RiCheckboxCircleLine, color: 'success' },
  occupee: { label: 'Occupée', icon: RiTimeLine, color: 'warning' },
  reservee: { label: 'Réservée', icon: RiCalendarCheckLine, color: 'info' }
};

const normalizeStatus = (value) => {
  const v = String(value ?? '').toLowerCase().trim();

  if (['libre', 'free', 'available', 'disponible'].includes(v)) return 'libre';
  if (['occupee', 'occupée', 'occupe', 'occupied', 'busy'].includes(v)) return 'occupee';
  if (['reservee', 'réservée', 'reserve', 'reserved'].includes(v)) return 'reservee';

  return 'libre';
};

const TableCard = ({
  table,
  onStatusChange,
  onShowQR,
  onEdit,
  onDelete,
  onDownloadQR,
  onPrintQR,
  getMenuUrl,
  viewMode = 'grid'
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = normalizeStatus(
    table?.statut ?? table?.status ?? table?.etat ?? table?.state
  );

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.libre;
  const StatusIcon = config.icon;

  const tableNumber =
    table?.numero_table ??
    table?.numero ??
    table?.number ??
    table?.numeroTable ??
    table?.tableNumber ??
    '?';

  const tableName =
    table?.nom_table ??
    table?.nom ??
    table?.name ??
    `Table ${tableNumber}`;

  const tableId = table?._id || table?.id;

  const menuUrl =
    table?.qrLink ??
    table?.qr_link ??
    table?.qr?.link ??
    (getMenuUrl ? getMenuUrl(table) : '');

  const handleStatusSelect = (newStatus) => {
    onStatusChange(tableId, newStatus);
    setShowStatusMenu(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (onDownloadQR) {
      onDownloadQR(table, menuUrl);
    }
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    if (onPrintQR) {
      onPrintQR(table, menuUrl);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className={`table-row table-row-${config.color}`}>
        <div className="table-row-number">
          <span className="table-number-badge">{tableNumber}</span>
        </div>

        <div className="table-row-name">
          {tableName}
        </div>

        <div className="table-row-capacity">
          {table?.capacite ? `${table.capacite} pers.` : '-'}
        </div>

        <div className="table-row-status">
          <div className="status-selector-wrapper">
            <button
              className={`status-badge status-badge-${config.color}`}
              onClick={() => setShowStatusMenu(!showStatusMenu)}
            >
              <StatusIcon />
              <span>{config.label}</span>
            </button>

            {showStatusMenu && (
              <>
                <div className="dropdown-backdrop" onClick={() => setShowStatusMenu(false)} />
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
              </>
            )}
          </div>
        </div>

        <div className="table-row-qr">
          {menuUrl && (
            <QRCodeSVG
              value={menuUrl}
              size={32}
              level="M"
              bgColor="transparent"
              fgColor="currentColor"
            />
          )}
        </div>

        <div className="table-row-actions">
          <button
            className="table-action-btn"
            onClick={() => onShowQR(table)}
            title="Voir QR"
          >
            <RiEyeLine />
          </button>
          <button
            className="table-action-btn"
            onClick={handleDownload}
            title="Télécharger"
          >
            <RiDownloadLine />
          </button>
          <button
            className="table-action-btn"
            onClick={handlePrint}
            title="Imprimer"
          >
            <RiPrinterLine />
          </button>
          <button
            className="table-action-btn"
            onClick={() => onEdit(table)}
            title="Modifier"
          >
            <RiEditLine />
          </button>
          <button
            className="table-action-btn danger"
            onClick={() => onDelete(tableId)}
            title="Supprimer"
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-card table-card-${config.color}`}>
      <div className="table-card-header">
        <div className="table-card-number">
          <span className="table-number-label">Table</span>
          <span className="table-number-value">{tableNumber}</span>
        </div>

        <button
          className="table-action-btn"
          onClick={() => onEdit(table)}
          title="Modifier"
        >
          <RiEditLine />
        </button>
      </div>

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
            <>
              <div className="dropdown-backdrop" onClick={() => setShowStatusMenu(false)} />
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
            </>
          )}
        </div>
      </div>

      <div className="table-card-info">
        <span className="table-info-label">Nom:</span>
        <span className="table-info-value">{tableName}</span>
      </div>

      {table?.capacite && (
        <div className="table-card-info">
          <span className="table-info-label">Capacité:</span>
          <span className="table-info-value">{table.capacite} pers.</span>
        </div>
      )}

      <div className="table-card-qr" onClick={() => onShowQR(table)}>
        {menuUrl ? (
          <QRCodeSVG
            value={menuUrl}
            size={60}
            level="M"
            bgColor="transparent"
            fgColor="currentColor"
          />
        ) : (
          <div className="qr-placeholder">
            <RiQrCodeLine />
          </div>
        )}
      </div>

      <div className="table-card-quick-actions">
        <button
          className="quick-action-btn"
          onClick={handleDownload}
          title="Télécharger QR"
        >
          <RiDownloadLine />
        </button>
        <button
          className="quick-action-btn"
          onClick={handlePrint}
          title="Imprimer QR"
        >
          <RiPrinterLine />
        </button>
        <button
          className="quick-action-btn"
          onClick={() => onShowQR(table)}
          title="Voir QR"
        >
          <RiQrCodeLine />
        </button>
        <button
          className="quick-action-btn danger"
          onClick={() => onDelete(tableId)}
          title="Supprimer"
        >
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  );
};

export default TableCard;