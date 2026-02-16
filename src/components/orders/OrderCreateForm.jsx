// src/components/orders/OrderCreateForm.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ordersApi } from "../../api/orders";
import { RiAddLine, RiDeleteBinLine } from "react-icons/ri";
import "./css/OrderCreateForm.css";

// ================================
// HELPERS
// ================================
const emptyItem = () => ({
  repas: "",
  nom_repas: "",
  prix_unitaire: "",
  quantite: 1,
});

const toNum = (v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ================================
// COMPONENT
// ================================
export default function OrderCreateForm({ 
  restaurantId, 
  isRestaurantMode = false,
  onCancel, 
  onSuccess 
}) {
  const { t } = useTranslation();

  // ================================
  // STATE
  // ================================
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    restaurent: restaurantId || "",
    table: "",
    status: "en_attente",
    payment_status: "en_attente",
    payment_method: "espece",
    source: "sur_place",
    items: [emptyItem()],
  });

  const [tables, setTables] = useState([]);
  const [repas, setRepas] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // CHARGER TABLES & REPAS
  // ================================
  useEffect(() => {
    const rid = form.restaurent || restaurantId;
    if (!rid) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [tablesRes, repasRes] = await Promise.allSettled([
          ordersApi.getTables(rid),
          ordersApi.getRepas(rid)
        ]);

        if (tablesRes.status === "fulfilled") {
          setTables(tablesRes.value || []);
        }
        if (repasRes.status === "fulfilled") {
          setRepas(repasRes.value || []);
        }
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [form.restaurent, restaurantId]);

  // ================================
  // COMPUTED
  // ================================
  const computed = useMemo(() => {
    const items = form.items.map((it) => {
      const prix = toNum(it.prix_unitaire);
      const qte = Math.max(1, toNum(it.quantite));
      const total = prix * qte;
      return { ...it, quantite: qte, total };
    });
    const total_amount = items.reduce((acc, it) => acc + toNum(it.total), 0);
    return { items, total_amount };
  }, [form.items]);

  // ================================
  // HANDLERS
  // ================================
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const setItem = (idx, patch) =>
    setForm((s) => ({
      ...s,
      items: s.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));

  const addItem = () => setForm((s) => ({ ...s, items: [...s.items, emptyItem()] }));

  const removeItem = (idx) =>
    setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));

  // Quand on sélectionne un repas, auto-remplir nom et prix
  const handleRepasSelect = (idx, repasId) => {
    const selectedRepas = repas.find(r => (r._id || r.id) === repasId);
    if (selectedRepas) {
      setItem(idx, {
        repas: repasId,
        nom_repas: selectedRepas.nom || selectedRepas.name || "",
        prix_unitaire: selectedRepas.prix || selectedRepas.price || ""
      });
    } else {
      setItem(idx, { repas: repasId });
    }
  };

  // ================================
  // VALIDATION
  // ================================
  const validate = () => {
    if (!form.restaurent) return t('orders.form.errors.restaurantRequired', 'Restaurant requis');
    if (!form.table) return t('orders.form.errors.tableRequired', 'Table requise');
    if (!form.items?.length) return t('orders.form.errors.itemsRequired', 'Ajoutez au moins 1 article');

    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i];
      if (!it.repas) return t('orders.form.errors.repasRequired', { index: i + 1 }) || `Article #${i + 1}: repas requis`;
      if (!it.nom_repas) return `Article #${i + 1}: nom requis`;
      if (toNum(it.prix_unitaire) <= 0) return `Article #${i + 1}: prix invalide`;
      if (toNum(it.quantite) <= 0) return `Article #${i + 1}: quantité invalide`;
    }
    return "";
  };

  // ================================
  // SUBMIT
  // ================================
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        restaurent: form.restaurent,
        table: form.table,
        status: form.status,
        payment_status: form.payment_status,
        payment_method: form.payment_method,
        source: form.source,
        total_amount: computed.total_amount,
        items: computed.items.map((it) => ({
          repas: it.repas,
          nom_repas: it.nom_repas,
          prix_unitaire: toNum(it.prix_unitaire),
          quantite: toNum(it.quantite),
          total: toNum(it.total),
        })),
      };

      await ordersApi.createOrder(payload);
      onSuccess?.();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('orders.form.errors.createFailed', 'Erreur lors de la création');
      setError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ================================
  // RENDER
  // ================================
  return (
    <form className="ocf" onSubmit={onSubmit}>
      {error && <div className="ocf-alert">{error}</div>}

      {/* INFOS CLIENT */}
      <div className="ocf-section">
        <h4 className="ocf-section-title">
          {t('orders.form.customerInfo', 'Informations client')}
        </h4>
        <div className="ocf-grid">
          <div className="ocf-field">
            <label>{t('orders.form.customerName', 'Nom client')}</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => setField("customer_name", e.target.value)}
              placeholder={t('orders.form.customerNamePlaceholder', 'Ex: Jean Dupont')}
            />
          </div>

          <div className="ocf-field">
            <label>{t('orders.form.customerPhone', 'Téléphone')}</label>
            <input
              type="tel"
              value={form.customer_phone}
              onChange={(e) => setField("customer_phone", e.target.value)}
              placeholder={t('orders.form.customerPhonePlaceholder', 'Ex: +228 90 00 00 00')}
            />
          </div>
        </div>
      </div>

      {/* INFOS COMMANDE */}
      <div className="ocf-section">
        <h4 className="ocf-section-title">
          {t('orders.form.orderInfo', 'Détails commande')}
        </h4>
        <div className="ocf-grid">
          {/* Restaurant - seulement si admin */}
          {!isRestaurantMode && !restaurantId && (
            <div className="ocf-field">
              <label>{t('orders.form.restaurant', 'Restaurant')} *</label>
              <input
                type="text"
                value={form.restaurent}
                onChange={(e) => setField("restaurent", e.target.value)}
                placeholder="ID Restaurant"
                required
              />
            </div>
          )}

          {/* Table - Dropdown */}
          <div className="ocf-field">
            <label>{t('orders.form.table', 'Table')} *</label>
            {loadingData ? (
              <select disabled>
                <option>{t('common.loading', 'Chargement...')}</option>
              </select>
            ) : tables.length > 0 ? (
              <select
                value={form.table}
                onChange={(e) => setField("table", e.target.value)}
                required
              >
                <option value="">{t('orders.form.selectTable', '-- Sélectionner une table --')}</option>
                {tables.map((table) => (
                  <option key={table._id || table.id} value={table._id || table.id}>
                    {table.nom || table.name || table.numero || `Table ${table.number || table._id}`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.table}
                onChange={(e) => setField("table", e.target.value)}
                placeholder="ID Table"
                required
              />
            )}
          </div>

          {/* Source */}
          <div className="ocf-field">
            <label>{t('orders.form.source', 'Source')}</label>
            <select
              value={form.source}
              onChange={(e) => setField("source", e.target.value)}
            >
              <option value="sur_place">{t('orders.source.onSite', 'Sur place')}</option>
              <option value="web">{t('orders.source.web', 'Web')}</option>
              <option value="mobile">{t('orders.source.mobile', 'Mobile')}</option>
              <option value="telephone">{t('orders.source.phone', 'Téléphone')}</option>
            </select>
          </div>

          {/* Statut */}
          <div className="ocf-field">
            <label>{t('orders.form.status', 'Statut')}</label>
            <select 
              value={form.status} 
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="en_attente">{t('orders.status.pending', 'En attente')}</option>
              <option value="livres">{t('orders.status.delivered', 'Livré')}</option>
              <option value="annules">{t('orders.status.cancelled', 'Annulé')}</option>
            </select>
          </div>

          {/* Paiement statut */}
          <div className="ocf-field">
            <label>{t('orders.form.paymentStatus', 'Statut paiement')}</label>
            <select
              value={form.payment_status}
              onChange={(e) => setField("payment_status", e.target.value)}
            >
              <option value="en_attente">{t('orders.paymentStatus.pending', 'En attente')}</option>
              <option value="en_traitement">{t('orders.paymentStatus.processing', 'En traitement')}</option>
              <option value="paye">{t('orders.paymentStatus.paid', 'Payé')}</option>
              <option value="non_paye">{t('orders.paymentStatus.unpaid', 'Non payé')}</option>
            </select>
          </div>

          {/* Méthode paiement */}
          <div className="ocf-field">
            <label>{t('orders.form.paymentMethod', 'Méthode paiement')}</label>
            <select
              value={form.payment_method}
              onChange={(e) => setField("payment_method", e.target.value)}
            >
              <option value="espece">{t('orders.paymentMethod.cash', 'Espèces')}</option>
              <option value="virement">{t('orders.paymentMethod.transfer', 'Virement')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ARTICLES */}
      <div className="ocf-section">
        <div className="ocf-section-header">
          <h4 className="ocf-section-title">
            {t('orders.form.items', 'Articles')}
          </h4>
          <button type="button" className="ocf-btn ocf-btn-add" onClick={addItem}>
            <RiAddLine />
            <span>{t('orders.form.addItem', 'Ajouter')}</span>
          </button>
        </div>

        <div className="ocf-items-list">
          {form.items.map((it, idx) => {
            const total = computed.items[idx]?.total ?? 0;
            return (
              <div key={idx} className="ocf-item">
                <div className="ocf-item-grid">
                  {/* Repas - Dropdown ou Input */}
                  <div className="ocf-field ocf-field-repas">
                    <label>{t('orders.form.meal', 'Repas')} *</label>
                    {repas.length > 0 ? (
                      <select
                        value={it.repas}
                        onChange={(e) => handleRepasSelect(idx, e.target.value)}
                        required
                      >
                        <option value="">{t('orders.form.selectMeal', '-- Choisir --')}</option>
                        {repas.map((r) => (
                          <option key={r._id || r.id} value={r._id || r.id}>
                            {r.nom || r.name} - {(r.prix || r.price || 0).toLocaleString()} FCFA
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={it.repas}
                        onChange={(e) => setItem(idx, { repas: e.target.value })}
                        placeholder="ID Repas"
                        required
                      />
                    )}
                  </div>

                  {/* Nom repas (auto-rempli ou manuel) */}
                  <div className="ocf-field ocf-field-nom">
                    <label>{t('orders.form.mealName', 'Nom')} *</label>
                    <input
                      type="text"
                      value={it.nom_repas}
                      onChange={(e) => setItem(idx, { nom_repas: e.target.value })}
                      placeholder="Ex: Pizza"
                      required
                      readOnly={repas.length > 0 && it.repas}
                    />
                  </div>

                  {/* Prix unitaire */}
                  <div className="ocf-field ocf-field-prix">
                    <label>{t('orders.form.unitPrice', 'Prix')} *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={it.prix_unitaire}
                      onChange={(e) => setItem(idx, { prix_unitaire: e.target.value })}
                      placeholder="0"
                      required
                      readOnly={repas.length > 0 && it.repas}
                    />
                  </div>

                  {/* Quantité */}
                  <div className="ocf-field ocf-field-qte">
                    <label>{t('orders.form.quantity', 'Qté')} *</label>
                    <input
                      type="number"
                      min="1"
                      value={it.quantite}
                      onChange={(e) => setItem(idx, { quantite: e.target.value })}
                      required
                    />
                  </div>

                  {/* Total */}
                  <div className="ocf-field ocf-field-total">
                    <label>{t('orders.form.total', 'Total')}</label>
                    <div className="ocf-total-value">
                      {total.toLocaleString("fr-FR")}
                    </div>
                  </div>

                  {/* Supprimer */}
                  <div className="ocf-field ocf-field-action">
                    <button
                      type="button"
                      className="ocf-btn ocf-btn-delete"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                      title={t('common.delete', 'Supprimer')}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total commande */}
        <div className="ocf-grand-total">
          <span>{t('orders.form.grandTotal', 'Total commande')}</span>
          <strong>{computed.total_amount.toLocaleString("fr-FR")} FCFA</strong>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="ocf-actions">
        <button 
          type="button" 
          className="ocf-btn ocf-btn-cancel" 
          onClick={onCancel} 
          disabled={submitting}
        >
          {t('common.cancel', 'Annuler')}
        </button>
        <button 
          type="submit" 
          className="ocf-btn ocf-btn-submit" 
          disabled={submitting}
        >
          {submitting 
            ? t('common.creating', 'Création...') 
            : t('orders.form.create', 'Créer la commande')
          }
        </button>
      </div>
    </form>
  );
}