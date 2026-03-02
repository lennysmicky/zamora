// src/components/tables/TableQRModal.jsx
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  RiCloseLine,
  RiDownloadLine,
  RiPrinterLine,
  RiRefreshLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiCheckLine
} from 'react-icons/ri';
import './css/TableComponents.css';

const TableQRModal = ({ isOpen, onClose, table, menuUrl, onRegenerate, saving }) => {
  const qrRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !table) return null;

  const tableNumber = table.numero || table.number || '?';

  // Télécharger le QR en PNG
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = 400;
    canvas.height = 500;
    
    img.onload = () => {
      // Background blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // QR Code centré
      ctx.drawImage(img, 50, 50, 300, 300);
      
      // Texte
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Table ${tableNumber}`, 200, 400);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scannez pour commander', 200, 430);
      
      // Download
      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };

  // Imprimer
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !printWindow) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${tableNumber} - QR Code</title>
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
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
            }
            h1 {
              font-size: 48px;
              margin: 20px 0 10px;
              color: #111827;
            }
            p {
              font-size: 18px;
              color: #6b7280;
              margin: 0;
            }
            svg {
              width: 250px;
              height: 250px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${svgData}
            <h1>Table ${tableNumber}</h1>
            <p>Scannez pour commander</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copier le lien
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="qr-modal-header">
          <h3>QR Code - Table {tableNumber}</h3>
          <button className="qr-modal-close" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        {/* Content */}
        <div className="qr-modal-content">
          <div className="qr-display" ref={qrRef}>
            <QRCodeSVG
              value={menuUrl}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="qr-info">
            <div className="qr-table-number">Table {tableNumber}</div>
            <p className="qr-instruction">Scannez ce QR code pour accéder au menu et commander</p>
          </div>

          <div className="qr-url">
            <input 
              type="text" 
              value={menuUrl} 
              readOnly 
              onClick={(e) => e.target.select()}
            />
            <button 
              className={`qr-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? <RiCheckLine /> : <RiFileCopyLine />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="qr-modal-actions">
          <button 
            className="qr-action-btn"
            onClick={onRegenerate}
            disabled={saving}
          >
            {saving ? <RiLoader4Line className="spin" /> : <RiRefreshLine />}
            <span>Régénérer</span>
          </button>
          <button className="qr-action-btn" onClick={handleDownload}>
            <RiDownloadLine />
            <span>Télécharger</span>
          </button>
          <button className="qr-action-btn primary" onClick={handlePrint}>
            <RiPrinterLine />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableQRModal;