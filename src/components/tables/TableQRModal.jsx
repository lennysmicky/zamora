import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const qrRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !table) return null;

  const tableNumber =
    table.numero_table ??
    table.numero ??
    table.number ??
    table.numeroTable ??
    table.tableNumber ??
    '?';

  // priorité au lien backend renvoyé à la création / régénération
  const effectiveMenuUrl =
    table.qrLink ??
    table.qr_link ??
    table.qr?.link ??
    menuUrl ??
    '';

  // Télécharger le QR en PNG
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !effectiveMenuUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    canvas.width = 400;
    canvas.height = 500;

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 50, 50, 300, 300);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${t('tables.qr.tableTitle')} ${tableNumber}`, 200, 400);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(t('tables.qr.scanToOrder'), 200, 430);

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
    if (!svg || !printWindow || !effectiveMenuUrl) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const titleText = `${t('tables.qr.tableTitle')} ${tableNumber}`;
    const scanText = t('tables.qr.scanToOrder');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titleText} - ${t('tables.qr.title')}</title>
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
            <h1>${titleText}</h1>
            <p>${scanText}</p>
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
    if (!effectiveMenuUrl) return;

    try {
      await navigator.clipboard.writeText(effectiveMenuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>{t('tables.qr.title')} - {t('tables.qr.tableTitle')} {tableNumber}</h3>
          <button className="qr-modal-close" onClick={onClose} aria-label={t('common.close')}>
            <RiCloseLine />
          </button>
        </div>

        <div className="qr-modal-content">
          <div className="qr-display" ref={qrRef}>
            <QRCodeSVG
              value={effectiveMenuUrl || ' '}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="qr-info">
            <div className="qr-table-number">{t('tables.qr.tableTitle')} {tableNumber}</div>
            <p className="qr-instruction">{t('tables.qr.scanToOrder')}</p>
          </div>

          <div className="qr-url">
            <input
              type="text"
              value={effectiveMenuUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button
              className={`qr-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              disabled={!effectiveMenuUrl}
              title={copied ? t('tables.qr.linkCopied') : t('tables.qr.copyLink')}
            >
              {copied ? <RiCheckLine /> : <RiFileCopyLine />}
            </button>
          </div>
        </div>

        <div className="qr-modal-actions">
          <button
            className="qr-action-btn"
            onClick={onRegenerate}
            disabled={saving}
          >
            {saving ? <RiLoader4Line className="spin" /> : <RiRefreshLine />}
            <span>{t('tables.qr.regenerate')}</span>
          </button>
          <button
            className="qr-action-btn"
            onClick={handleDownload}
            disabled={!effectiveMenuUrl}
          >
            <RiDownloadLine />
            <span>{t('tables.qr.download')}</span>
          </button>
          <button
            className="qr-action-btn primary"
            onClick={handlePrint}
            disabled={!effectiveMenuUrl}
          >
            <RiPrinterLine />
            <span>{t('tables.qr.print')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableQRModal;