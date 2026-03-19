import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  RiListCheck,
} from "react-icons/ri";

import { useTables } from "../../../hooks/useTables";
import TableCard from "../../../components/tables/TableCard";
import TableForm from "../../../components/tables/TableForm";
import TableQRModal from "../../../components/tables/TableQRModal";
import Modal from "../../../components/common/Modal";
import "./RestaurantTablesPage.css";

const idOf = (x) => x?._id ?? x?.id ?? null;

const numOf = (t) =>
  t?.numero_table ??
  t?.numero ??
  t?.number ??
  t?.numeroTable ??
  t?.tableNumber ??
  null;

const nameOf = (t) =>
  t?.nom_table ??
  t?.nom ??
  t?.name ??
  t?.table_name ??
  t?.tableName ??
  "";

const capOf = (t) =>
  t?.capacite ?? t?.capacity ?? t?.places ?? t?.nb_places ?? null;

const normalizeStatus = (value) => {
  const v = String(value ?? "").toLowerCase().trim();

  if (["libre", "free", "available", "disponible"].includes(v)) return "libre";
  if (["occupee", "occupée", "occupe", "occupied", "busy"].includes(v)) return "occupee";
  if (["reservee", "réservée", "reserve", "reserved"].includes(v)) return "reservee";

  return "libre";
};

const statusOf = (t) =>
  normalizeStatus(t?.statut ?? t?.status ?? t?.etat ?? t?.state ?? "libre");

const normalizeTable = (raw) => {
  const _id = idOf(raw);
  const normalizedStatus = statusOf(raw);

  return {
    ...(raw || {}),
    _id,
    id: raw?.id ?? undefined,
    numero: numOf(raw),
    nom: nameOf(raw),
    capacite: capOf(raw),
    status: normalizedStatus,
    statut: normalizedStatus,
    qrLink: raw?.qrLink ?? raw?.qr_link ?? raw?.qr?.link ?? null,
  };
};

const toApiPayload = (formLike) => {
  const n = Number(formLike?.numero_table ?? formLike?.numero ?? formLike?.number);
  const numero_table = Number.isFinite(n) ? n : undefined;

  const nomRaw =
    formLike?.nom ??
    formLike?.name ??
    formLike?.nom_table ??
    formLike?.table_name ??
    formLike?.tableName ??
    "";

  const nom = String(nomRaw || "").trim() || undefined;

  const c = Number(
    formLike?.capacite ?? formLike?.capacity ?? formLike?.places ?? formLike?.nb_places
  );
  const capacite = Number.isFinite(c) ? c : undefined;

  const status = normalizeStatus(
    formLike?.statut ?? formLike?.status ?? formLike?.etat ?? "libre"
  );

  return {
    numero_table,
    nom_table: nom,
    capacite,
    status,
    statut: status,
    numero: numero_table,
    nom,
    name: nom,
    capacity: capacite,
    etat: status,
  };
};

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
    getMenuUrl,
  } = useTables();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  const qrRef = useRef(null);

  const normalizedTables = useMemo(
    () => (tables || []).map(normalizeTable).filter((t) => t._id),
    [tables]
  );

  const existingNumbers = useMemo(() => {
    return normalizedTables
      .map((t) => Number(t.numero))
      .filter((n) => Number.isFinite(n));
  }, [normalizedTables]);

  const filteredTables = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();

    return normalizedTables.filter((t) => {
      const n = t.numero;
      const nom = String(t.nom || "").toLowerCase();
      const st = t.status || "libre";

      const matchSearch = !q || String(n ?? "").includes(q) || nom.includes(q);
      const matchStatus = statusFilter === "all" || st === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [normalizedTables, searchQuery, statusFilter]);

  const showToast = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleCreateTable = async (formData) => {
    const payload = toApiPayload(formData);
    const result = await createTable(payload);

    if (result?.success) {
      setShowCreateModal(false);
      showToast("success", t('tables.messages.created'));
      fetchTables?.();
    } else {
      showToast("error", result?.error || t('common.error'));
    }

    return result;
  };

  const handleCreateMultiple = async (count) => {
    const result = await createMultipleTables(count);

    if (result?.success) {
      setShowCreateModal(false);
      showToast("success", t('tables.messages.createdMultiple', { count }));
      fetchTables?.();
    } else {
      showToast("error", result?.error || t('common.error'));
    }

    return result;
  };

  const handleEditTable = async (formPayload) => {
    const id = formPayload?._id ?? formPayload?.id;
    if (!id) return { success: false, error: t('tables.errors.numberRequired') };

    const apiData = toApiPayload(formPayload);
    const result = await updateTable(id, apiData);

    if (result?.success) {
      setShowEditModal(false);
      setSelectedTable(null);
      showToast("success", t('tables.messages.updated'));
      fetchTables?.();
    } else {
      showToast("error", result?.error || t('common.error'));
    }

    return result;
  };

  const handleOpenEdit = (table) => {
    setSelectedTable(normalizeTable(table));
    setShowEditModal(true);
  };

  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateStatus(tableId, newStatus);
    if (!result?.success) showToast("error", result?.error || t('common.error'));
  };

  const handleAskDelete = (tableId) => {
    const foundTable = normalizedTables.find((x) => String(x._id) === String(tableId));
     setTableToDelete(foundTable || { _id: tableId, numero: "?" });
   setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const id = tableToDelete?._id ?? tableToDelete?.id;
    if (!id) return;

    const result = await deleteTable(id);

    if (result?.success) {
      showToast("success", t('tables.messages.deleted'));
      setShowDeleteModal(false);
      setTableToDelete(null);
      fetchTables?.();
    } else {
      showToast("error", result?.error || t('common.error'));
    }
  };

  const handleShowQR = (table) => {
    setSelectedTable(normalizeTable(table));
    setShowQRModal(true);
  };

  const handleRegenerateQR = async (tableId) => {
    const result = await regenerateQR(tableId);

    if (result?.success) {
      const next = normalizeTable(result.table || {});
      if (selectedTable && String(selectedTable._id) === String(tableId)) {
        setSelectedTable(next);
      }
      showToast("success", t('tables.messages.qrRegenerated'));
      fetchTables?.();
    } else {
      showToast("error", result?.error || t('common.error'));
    }

    return result;
  };

  const handleDownloadQR = (table, menuUrl) => {
    const tableNumber =
      table?.numero_table ??
      table?.numero ??
      table?.number ??
      "?";

    const effectiveMenuUrl =
      table?.qrLink ??
      table?.qr_link ??
      menuUrl ??
      (getMenuUrl ? getMenuUrl(table) : "") ??
      "";

    if (!effectiveMenuUrl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 380;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(
        canvas,
        effectiveMenuUrl,
        { width: 200, margin: 2, color: { dark: "#000000", light: "#ffffff" } },
        (err) => {
          if (err) return;

          ctx.fillStyle = "#000000";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`${t('tables.qr.tableTitle')} ${tableNumber}`, 150, 280);

          ctx.font = "14px Arial";
          ctx.fillStyle = "#666666";
          ctx.fillText(t('tables.qr.scanToOrder'), 150, 310);

          const link = document.createElement("a");
          link.download = `table-${tableNumber}-qr.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      );
    });
  };

  const handlePrintQR = (table, menuUrl) => {
    const tableNumber =
      table?.numero_table ??
      table?.numero ??
      table?.number ??
      "?";

    const effectiveMenuUrl =
      table?.qrLink ??
      table?.qr_link ??
      menuUrl ??
      (getMenuUrl ? getMenuUrl(table) : "") ??
      "";

    if (!effectiveMenuUrl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const safeUrl = JSON.stringify(effectiveMenuUrl);
    const titleText = `${t('tables.qr.tableTitle')} ${tableNumber}`;
    const scanText = t('tables.qr.scanToOrder');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titleText} - ${t('tables.qr.title')}</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
          <style>
            body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:Arial,sans-serif;}
            .container{text-align:center;padding:30px;border:2px solid #e5e7eb;border-radius:12px;}
            canvas{margin-bottom:20px;}
            h1{font-size:32px;margin:10px 0;}
            p{color:#666;margin:0;}
          </style>
        </head>
        <body>
          <div class="container">
            <canvas id="qr"></canvas>
            <h1>${titleText}</h1>
            <p>${scanText}</p>
          </div>
          <script>
            QRCode.toCanvas(document.getElementById('qr'), ${safeUrl}, { width: 200 }, function(err) {
              if (!err) { window.print(); window.close(); }
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="tables-page">
      <div className="tables-header">
        <div className="tables-header-info">
          <h1>
            <RiTableLine />
            {t('tables.title')}
          </h1>
          <p>{t('tables.subtitle')}</p>
        </div>

        <div className="tables-header-actions">
          <button
            className="tables-btn tables-btn-secondary"
            onClick={fetchTables}
            disabled={loading}
            title={t('tables.refresh')}
            type="button"
          >
            <RiRefreshLine className={loading ? "spin" : ""} />
          </button>

          <button
            className="tables-btn tables-btn-primary"
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            <RiAddLine />
            <span>{t('tables.add')}</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`tables-message tables-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tables-stats">
        <div className="tables-stat-card">
          <div className="tables-stat-icon total">
            <RiTableLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats?.total ?? 0}</span>
            <span className="tables-stat-label">{t('tables.stats.total')}</span>
          </div>
        </div>

        <div className="tables-stat-card">
          <div className="tables-stat-icon libre">
            <RiCheckboxCircleLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats?.libre ?? 0}</span>
            <span className="tables-stat-label">{t('tables.stats.libre')}</span>
          </div>
        </div>

        <div className="tables-stat-card">
          <div className="tables-stat-icon occupee">
            <RiTimeLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats?.occupee ?? 0}</span>
            <span className="tables-stat-label">{t('tables.stats.occupee')}</span>
          </div>
        </div>

        <div className="tables-stat-card">
          <div className="tables-stat-icon reservee">
            <RiCalendarCheckLine />
          </div>
          <div className="tables-stat-content">
            <span className="tables-stat-value">{stats?.reservee ?? 0}</span>
            <span className="tables-stat-label">{t('tables.stats.reservee')}</span>
          </div>
        </div>
      </div>

      <div className="tables-filters">
        <div className="tables-search">
          <RiSearchLine />
          <input
            type="text"
            placeholder={t('tables.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="tables-filter-buttons">
          {["all", "libre", "occupee", "reservee"].map((st) => (
            <button
              key={st}
              className={`filter-btn ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
              type="button"
            >
              {t(`tables.filters.${st}`)}
            </button>
          ))}
        </div>

        <div className="tables-view-toggle">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            type="button"
          >
            <RiGridLine />
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            <RiListCheck />
          </button>
        </div>
      </div>

      <div className="tables-content">
        {loading ? (
          <div className="tables-loading">
            <RiLoader4Line className="spin" />
            <span>{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="tables-error">
            <p>{error}</p>
            <button className="tables-btn tables-btn-primary" onClick={fetchTables} type="button">
              {t('common.retry')}
            </button>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="tables-empty">
            <div className="tables-empty-icon">
              <RiTableLine />
            </div>
            <h3>{t('tables.empty.title')}</h3>
            <p>
              {normalizedTables.length === 0
                ? t('tables.empty.message')
                : t('tables.empty.noResults')}
            </p>
            {normalizedTables.length === 0 && (
              <button
                className="tables-btn tables-btn-primary"
                onClick={() => setShowCreateModal(true)}
                type="button"
              >
                <RiAddLine /> {t('tables.add')}
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "list" && (
              <div className="tables-list-header">
                <div className="list-col">{t('tables.table.number')}</div>
                <div className="list-col">{t('tables.table.name')}</div>
                <div className="list-col">{t('tables.table.capacity')}</div>
                <div className="list-col">{t('tables.table.status')}</div>
                <div className="list-col">{t('tables.table.qr')}</div>
                <div className="list-col">{t('tables.table.actions')}</div>
              </div>
            )}

            <div className={`tables-grid ${viewMode}`}>
              {filteredTables.map((table) => (
                <TableCard
                  key={String(table._id)}
                  table={table}
                  viewMode={viewMode}
                  onStatusChange={handleStatusChange}
                  onShowQR={handleShowQR}
                  onEdit={handleOpenEdit}
                  onDelete={handleAskDelete}
                  onDownloadQR={handleDownloadQR}
                  onPrintQR={handlePrintQR}
                  getMenuUrl={getMenuUrl}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('tables.form.createTitle')}
        size="small"
      >
        <TableForm
          onSubmit={handleCreateTable}
          onCreateMultiple={handleCreateMultiple}
          onCancel={() => setShowCreateModal(false)}
          saving={saving}
          existingNumbers={existingNumbers}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTable(null);
        }}
        title={t('tables.form.editTitle')}
        size="small"
      >
        <TableForm
          table={selectedTable}
          onSubmit={handleEditTable}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTable(null);
          }}
          onRegenerateQR={handleRegenerateQR}
          saving={saving}
          existingNumbers={existingNumbers}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTableToDelete(null);
        }}
        title={t('tables.delete.title')}
        size="small"
      >
        <div className="delete-confirm">
          <p className="delete-confirm-text">
            {t('tables.delete.message')}{" "}
            <strong>{t('tables.qr.tableTitle')} {tableToDelete?.numero ?? tableToDelete?.number ?? "?"}</strong> ?
            <br />
            {t('common.confirm')}.
          </p>

          <div className="delete-confirm-actions">
            <button
              type="button"
              className="tables-btn tables-btn-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setTableToDelete(null);
              }}
              disabled={saving}
            >
              {t('common.cancel')}
            </button>

            <button
              type="button"
              className="tables-btn tables-btn-danger"
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>

      {selectedTable && (
        <TableQRModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          menuUrl={getMenuUrl(selectedTable)}
          onRegenerate={() => handleRegenerateQR(selectedTable._id)}
          saving={saving}
        />
      )}

      <div ref={qrRef} style={{ display: "none" }} />
    </div>
  );
};

export default RestaurantTablesPage;