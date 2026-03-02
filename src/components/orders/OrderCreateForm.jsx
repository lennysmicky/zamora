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
  prix_unitaire: 0,
  quantite: 1,
});

const toNum = (v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const idOf = (x) => String(x?._id ?? x?.id ?? "");

const labelOfTable = (t) =>
  t?.nom ?? t?.name ?? t?.numero ?? (t?.number != null ? `Table ${t.number}` : `Table ${idOf(t)}`);

const labelOfMeal = (m) => m?.nom ?? m?.name ?? "-";

const priceOfMeal = (m) => toNum(m?.prix ?? m?.price ?? 0);

// ================================
// COMPONENT
// ================================
export default function OrderCreateForm({
  restaurantId,
  isRestaurantMode = false,
  onCancel,
  onSuccess,
}) {
  const { t } = useTranslation();

  // ================================
  // STATE
  // ================================
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    restaurent: restaurantId || "", // utilisé uniquement pour déterminer :restaurentId (URL)
    table: "",

    payment_method: "espece", // espece | virement | tmoney | flooz
    source: "sur_place", // sur_place | a_emporter | livraison | web | qrCode

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
          ordersApi.getRepas(rid),
        ]);

        if (tablesRes.status === "fulfilled") setTables(Array.isArray(tablesRes.value) ? tablesRes.value : []);
        if (repasRes.status === "fulfilled") setRepas(Array.isArray(repasRes.value) ? repasRes.value : []);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [form.restaurent, restaurantId]);

  // ================================
  // COMPUTED (UI)
  // ================================
  const computed = useMemo(() => {
    const items = form.items.map((it) => {
      const qte = Math.max(1, toNum(it.quantite));
      const prix = toNum(it.prix_unitaire);
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

  // Selection repas => auto fill nom + prix
  const handleRepasSelect = (idx, repasId) => {
    const selected = repas.find((r) => idOf(r) === String(repasId));
    if (selected) {
      setItem(idx, {
        repas: repasId,
        nom_repas: labelOfMeal(selected),
        prix_unitaire: priceOfMeal(selected),
      });
    } else {
      setItem(idx, { repas: repasId, nom_repas: "", prix_unitaire: 0 });
    }
  };

  // ================================
  // VALIDATION
  // ================================
  const validate = () => {
    const rid = form.restaurent || restaurantId;
    if (!rid) return t("orders.form.errors.restaurantRequired", "Restaurant requis");

    if (!form.customer_name?.trim())
      return t("orders.form.errors.customerNameRequired", "Nom client requis");

    if (!form.customer_phone?.trim())
      return t("orders.form.errors.customerPhoneRequired", "Téléphone requis");

    if (!form.items?.length)
      return t("orders.form.errors.itemsRequired", "Ajoutez au moins 1 article");

    // si QR Code => table obligatoire et doit exister
    if (String(form.source) === "qrCode") {
      if (tables.length === 0)
        return t("orders.form.errors.noTables", "Aucune table disponible. Créez une table d'abord.");
      if (!form.table)
        return t("orders.form.errors.tableRequiredForQr", "Table requise pour QR Code");
    }

    // repas doit exister dans la liste (dropdown only)
    if (repas.length === 0)
      return t("orders.form.errors.noMeals", "Aucun repas disponible. Créez un repas d'abord.");

    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i];
      if (!it.repas)
        return t("orders.form.errors.repasRequired", { index: i + 1 }) || `Article #${i + 1}: repas requis`;
      if (toNum(it.quantite) <= 0) return `Article #${i + 1}: quantité invalide`;
      if (toNum(it.prix_unitaire) <= 0) return `Article #${i + 1}: prix invalide`;
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

    const rid = form.restaurent || restaurantId;

    setSubmitting(true);
    try {
      // ✅ contrat backend:
      // POST /api/commande/:restaurentId
      // body: customer_name, customer_phone, payment_method, source, table?, items[{repas,quantite}]
      const payload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        payment_method: form.payment_method,
        source: form.source,
        table: form.table || undefined,
        items: form.items.map((it) => ({
          repas: it.repas,
          quantite: Math.max(1, toNum(it.quantite)),
        })),
      };

      await ordersApi.createCommande(rid, payload);
      onSuccess?.();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t("orders.form.errors.createFailed", "Erreur lors de la création");
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
        <h4 className="ocf-section-title">{t("orders.form.customerInfo", "Informations client")}</h4>

        <div className="ocf-grid">
          <div className="ocf-field">
            <label>{t("orders.form.customerName", "Nom client")} *</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => setField("customer_name", e.target.value)}
              placeholder={t("orders.form.customerNamePlaceholder", "Ex: Kelly")}
            />
          </div>

          <div className="ocf-field">
            <label>{t("orders.form.customerPhone", "Téléphone")} *</label>
            <input
              type="tel"
              value={form.customer_phone}
              onChange={(e) => setField("customer_phone", e.target.value)}
              placeholder={t("orders.form.customerPhonePlaceholder", "Ex: 90000000")}
            />
          </div>
        </div>
      </div>

      {/* INFOS COMMANDE */}
      <div className="ocf-section">
        <h4 className="ocf-section-title">{t("orders.form.orderInfo", "Détails commande")}</h4>

        <div className="ocf-grid">
          {/* Restaurant id: visible seulement si admin ET restaurantId absent */}
          {!isRestaurantMode && !restaurantId && (
            <div className="ocf-field">
              <label>{t("orders.form.restaurant", "Restaurant")} *</label>
              <input
                type="text"
                value={form.restaurent}
                onChange={(e) => setField("restaurent", e.target.value)}
                placeholder="ID Restaurant"
                required
              />
            </div>
          )}

          {/* Source (enum backend) */}
          <div className="ocf-field">
            <label>{t("orders.form.source", "Source")} *</label>
            <select
              value={form.source}
              onChange={(e) => {
                const next = e.target.value;
                setField("source", next);
                // si on quitte qrCode, table optionnelle => reset
                if (next !== "qrCode") setField("table", "");
              }}
            >
              <option value="sur_place">{t("orders.source.onSite", "Sur place")}</option>
              <option value="a_emporter">{t("orders.source.takeaway", "À emporter")}</option>
              <option value="livraison">{t("orders.source.delivery", "Livraison")}</option>
              <option value="web">{t("orders.source.web", "Web")}</option>
              <option value="qrCode">{t("orders.source.qrcode", "QR Code")}</option>
            </select>
          </div>

          {/* Table (dropdown only) - obligatoire si qrCode */}
          <div className="ocf-field">
            <label>
              {t("orders.form.table", "Table")}
              {form.source === "qrCode" ? " *" : ""}
            </label>

            <select
              value={form.table}
              onChange={(e) => setField("table", e.target.value)}
              required={form.source === "qrCode"}
              disabled={loadingData || tables.length === 0}
            >
              <option value="">
                {loadingData
                  ? t("common.loading", "Chargement...")
                  : tables.length === 0
                    ? t("orders.form.noTables", "-- Aucune table --")
                    : t("orders.form.selectTable", "-- Sélectionner une table --")}
              </option>

              {tables.map((tb) => (
                <option key={idOf(tb)} value={idOf(tb)}>
                  {labelOfTable(tb)}
                </option>
              ))}
            </select>
          </div>

          {/* Méthode paiement (enum backend) */}
          <div className="ocf-field">
            <label>{t("orders.form.paymentMethod", "Méthode paiement")} *</label>
            <select value={form.payment_method} onChange={(e) => setField("payment_method", e.target.value)}>
              <option value="espece">{t("orders.paymentMethod.cash", "Espèces")}</option>
              <option value="virement">{t("orders.paymentMethod.transfer", "Virement")}</option>
              <option value="tmoney">{t("orders.paymentMethod.tmoney", "TMoney")}</option>
              <option value="flooz">{t("orders.paymentMethod.flooz", "Flooz")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ARTICLES */}
      <div className="ocf-section">
        <div className="ocf-section-header">
          <h4 className="ocf-section-title">{t("orders.form.items", "Articles")}</h4>

          <button type="button" className="ocf-btn ocf-btn-add" onClick={addItem} disabled={repas.length === 0}>
            <RiAddLine />
            <span>{t("orders.form.addItem", "Ajouter")}</span>
          </button>
        </div>

        <div className="ocf-items-list">
          {form.items.map((it, idx) => {
            const total = computed.items[idx]?.total ?? 0;

            return (
              <div key={idx} className="ocf-item">
                <div className="ocf-item-grid">
                  {/* Repas dropdown only */}
                  <div className="ocf-field ocf-field-repas">
                    <label>{t("orders.form.meal", "Repas")} *</label>
                    <select
                      value={it.repas}
                      onChange={(e) => handleRepasSelect(idx, e.target.value)}
                      required
                      disabled={repas.length === 0}
                    >
                      <option value="">
                        {repas.length === 0 ? t("orders.form.noMeals", "-- Aucun repas --") : t("orders.form.selectMeal", "-- Choisir --")}
                      </option>
                      {repas.map((r) => (
                        <option key={idOf(r)} value={idOf(r)}>
                          {labelOfMeal(r)} - {priceOfMeal(r).toLocaleString()} FCFA
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nom repas (UI only) */}
                  <div className="ocf-field ocf-field-nom">
                    <label>{t("orders.form.mealName", "Nom")}</label>
                    <input type="text" value={it.nom_repas} readOnly placeholder="(auto)" />
                  </div>

                  {/* Prix unitaire (UI only) */}
                  <div className="ocf-field ocf-field-prix">
                    <label>{t("orders.form.unitPrice", "Prix")}</label>
                    <input type="text" value={toNum(it.prix_unitaire).toLocaleString("fr-FR")} readOnly placeholder="(auto)" />
                  </div>

                  {/* Quantité */}
                  <div className="ocf-field ocf-field-qte">
                    <label>{t("orders.form.quantity", "Qté")} *</label>
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
                    <label>{t("orders.form.total", "Total")}</label>
                    <div className="ocf-total-value">{total.toLocaleString("fr-FR")} FCFA</div>
                  </div>

                  {/* Supprimer */}
                  <div className="ocf-field ocf-field-action">
                    <button
                      type="button"
                      className="ocf-btn ocf-btn-delete"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                      title={t("common.delete", "Supprimer")}
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
          <span>{t("orders.form.grandTotal", "Total commande")}</span>
          <strong>{computed.total_amount.toLocaleString("fr-FR")} FCFA</strong>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="ocf-actions">
        <button type="button" className="ocf-btn ocf-btn-cancel" onClick={onCancel} disabled={submitting}>
          {t("common.cancel", "Annuler")}
        </button>

        <button type="submit" className="ocf-btn ocf-btn-submit" disabled={submitting}>
          {submitting ? t("common.creating", "Création...") : t("orders.form.create", "Créer la commande")}
        </button>
      </div>
    </form>
  );
}