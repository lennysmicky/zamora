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

const idOf = (x) => String(x?._id ?? x?.id ?? "").trim();

const numOfTable = (t) =>
  t?.numero_table ??
  t?.numeroTable ??
  t?.numero ??
  t?.tableNumber ??
  t?.number ??
  t?.num ??
  null;

const nameOfTable = (t) =>
  t?.nom_table ??
  t?.table_name ??
  t?.tableName ??
  t?.nom ??
  t?.name ??
  "";

const labelOfTable = (t) => {
  const name = String(nameOfTable(t) || "").trim();
  if (name) return name;

  const n = numOfTable(t);
  const nn = Number(n);
  if (Number.isFinite(nn) && nn > 0) return `Table ${nn}`;

  // ✅ jamais afficher l'ID restaurant / ID table comme label
  return "Table";
};

const labelOfMeal = (m) => m?.nom ?? m?.name ?? "-";
const priceOfMeal = (m) => toNum(m?.prix ?? m?.price ?? 0);

const requiresTable = (source) => {
  const v = String(source ?? "").trim().toLowerCase();
  return v === "sur_place" || v === "qrcode" || v === "qr_code" || v === "qrcode" || v === "qrcode" || v === "qr" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrcode" || v === "qrCode".toLowerCase();
};

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
    restaurent: restaurantId || "",
    source: "sur_place", // sur_place | a_emporter | livraison | web | qrCode
    table: "",
    payment_method: "espece", // espece | virement | tmoney | flooz
    items: [emptyItem()],
  });

  const [tables, setTables] = useState([]);
  const [repas, setRepas] = useState([]);

  const [loadingMeals, setLoadingMeals] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const rid = form.restaurent || restaurantId || "";
  const needsTable = requiresTable(form.source);

  // ================================
  // LOAD REPAS (toujours)
  // ================================
  useEffect(() => {
    if (!rid) return;

    let mounted = true;
    const loadMeals = async () => {
      setLoadingMeals(true);
      try {
        const list = await ordersApi.getRepas(rid);
        if (!mounted) return;
        setRepas(Array.isArray(list) ? list : []);
      } catch {
        if (!mounted) return;
        setRepas([]);
      } finally {
        if (mounted) setLoadingMeals(false);
      }
    };

    loadMeals();
    return () => {
      mounted = false;
    };
  }, [rid]);

  // ================================
  // LOAD TABLES (si sur_place OU qrCode)
  // ================================
  useEffect(() => {
    if (!rid) return;

    // si source ne nécessite pas de table: reset
    if (!needsTable) {
      setTables([]);
      if (form.table) setForm((s) => ({ ...s, table: "" }));
      setLoadingTables(false);
      return;
    }

    let mounted = true;
    const loadTables = async () => {
      setLoadingTables(true);
      try {
        const list = await ordersApi.getTables(rid);
        if (!mounted) return;
        setTables(Array.isArray(list) ? list : []);
      } catch {
        if (!mounted) return;
        setTables([]);
      } finally {
        if (mounted) setLoadingTables(false);
      }
    };

    loadTables();
    return () => {
      mounted = false;
    };
    // ✅ ne pas dépendre de form.table (sinon refetch à chaque sélection -> glitches)
  }, [rid, needsTable]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedTables = useMemo(() => {
    const arr = Array.isArray(tables) ? [...tables] : [];
    arr.sort((a, b) => {
      const na = Number(numOfTable(a));
      const nb = Number(numOfTable(b));
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return labelOfTable(a).localeCompare(labelOfTable(b), "fr");
    });
    return arr;
  }, [tables]);

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
  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setError("");
  };

  const setItem = (idx, patch) =>
    setForm((s) => ({
      ...s,
      items: s.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));

  const addItem = () => setForm((s) => ({ ...s, items: [...s.items, emptyItem()] }));

  const removeItem = (idx) =>
    setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));

  const handleRepasSelect = (idx, repasId) => {
    const ridStr = String(repasId ?? "");
    const selected = repas.find((r) => idOf(r) === ridStr);
    if (selected) {
      setItem(idx, {
        repas: ridStr,
        nom_repas: labelOfMeal(selected),
        prix_unitaire: priceOfMeal(selected),
      });
    } else {
      setItem(idx, { repas: ridStr, nom_repas: "", prix_unitaire: 0 });
    }
  };

  // ================================
  // VALIDATION
  // ================================
  const validate = () => {
    if (!rid) return t("orders.form.errors.restaurantRequired", "Restaurant requis");

    if (!form.customer_name?.trim())
      return t("orders.form.errors.customerNameRequired", "Nom client requis");

    if (!form.customer_phone?.trim())
      return t("orders.form.errors.customerPhoneRequired", "Téléphone requis");

    if (!form.items?.length)
      return t("orders.form.errors.itemsRequired", "Ajoutez au moins 1 article");

    if (repas.length === 0)
      return t("orders.form.errors.noMeals", "Aucun repas disponible. Créez un repas d'abord.");

    if (needsTable) {
      if (loadingTables)
        return t("orders.form.errors.tablesLoading", "Chargement des tables...");
      if (sortedTables.length === 0)
        return t("orders.form.errors.noTables", "Aucune table disponible.");
      if (!form.table)
        return t("orders.form.errors.tableRequired", "Table requise pour cette source");

      // ✅ sécurité: table sélectionnée doit exister dans la liste
      const ok = sortedTables.some((tb) => idOf(tb) === String(form.table));
      if (!ok) return t("orders.form.errors.tableInvalid", "Table sélectionnée invalide");
    }

    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i];
      if (!it.repas) return `Article #${i + 1}: repas requis`;
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

    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        payment_method: form.payment_method,
        source: form.source,
        table: needsTable ? String(form.table) : undefined,
        items: form.items.map((it) => ({
          repas: String(it.repas),
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
        <h4 className="ocf-section-title">
          {t("orders.form.customerInfo", "Informations client")}
        </h4>

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
        <h4 className="ocf-section-title">
          {t("orders.form.orderInfo", "Détails commande")}
        </h4>

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

          {/* Source */}
          <div className="ocf-field">
            <label>{t("orders.form.source", "Source")} *</label>
            <select
              value={form.source}
              onChange={(e) => {
                const next = e.target.value;
                setForm((s) => ({
                  ...s,
                  source: next,
                  table: requiresTable(next) ? s.table : "", // ✅ clear si plus requis
                }));
                setError("");
              }}
            >
              <option value="sur_place">{t("orders.source.onSite", "Sur place")}</option>
              <option value="a_emporter">{t("orders.source.takeaway", "À emporter")}</option>
              <option value="livraison">{t("orders.source.delivery", "Livraison")}</option>
              <option value="web">{t("orders.source.web", "Web")}</option>
              <option value="qrCode">{t("orders.source.qrcode", "QR Code")}</option>
            </select>
          </div>

          {/* Table: affichée UNIQUEMENT si sur_place OU qrCode */}
          {needsTable && (
            <div className="ocf-field">
              <label>{t("orders.form.table", "Table")} *</label>
              <select
                value={form.table}
                onChange={(e) => setField("table", e.target.value)}
                required
                disabled={loadingTables || sortedTables.length === 0}
              >
                <option value="">
                  {loadingTables
                    ? t("common.loading", "Chargement...")
                    : sortedTables.length === 0
                    ? t("orders.form.noTables", "-- Aucune table --")
                    : t("orders.form.selectTable", "-- Sélectionner une table --")}
                </option>

                {sortedTables.map((tb) => {
                  const id = idOf(tb);
                  if (!id) return null;
                  return (
                    <option key={id} value={id}>
                      {labelOfTable(tb)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Méthode paiement */}
          <div className="ocf-field">
            <label>{t("orders.form.paymentMethod", "Méthode paiement")} *</label>
            <select
              value={form.payment_method}
              onChange={(e) => setField("payment_method", e.target.value)}
            >
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

          <button
            type="button"
            className="ocf-btn ocf-btn-add"
            onClick={addItem}
            disabled={loadingMeals || repas.length === 0}
          >
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
                  <div className="ocf-field ocf-field-repas">
                    <label>{t("orders.form.meal", "Repas")} *</label>
                    <select
                      value={it.repas}
                      onChange={(e) => handleRepasSelect(idx, e.target.value)}
                      required
                      disabled={loadingMeals || repas.length === 0}
                    >
                      <option value="">
                        {loadingMeals
                          ? t("common.loading", "Chargement...")
                          : repas.length === 0
                          ? t("orders.form.noMeals", "-- Aucun repas --")
                          : t("orders.form.selectMeal", "-- Choisir --")}
                      </option>
                      {repas.map((r) => (
                        <option key={idOf(r)} value={idOf(r)}>
                          {labelOfMeal(r)} - {priceOfMeal(r).toLocaleString()} FCFA
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ocf-field ocf-field-nom">
                    <label>{t("orders.form.mealName", "Nom")}</label>
                    <input type="text" value={it.nom_repas} readOnly placeholder="(auto)" />
                  </div>

                  <div className="ocf-field ocf-field-prix">
                    <label>{t("orders.form.unitPrice", "Prix")}</label>
                    <input
                      type="text"
                      value={toNum(it.prix_unitaire).toLocaleString("fr-FR")}
                      readOnly
                      placeholder="(auto)"
                    />
                  </div>

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

                  <div className="ocf-field ocf-field-total">
                    <label>{t("orders.form.total", "Total")}</label>
                    <div className="ocf-total-value">{total.toLocaleString("fr-FR")} FCFA</div>
                  </div>

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

        <div className="ocf-grand-total">
          <span>{t("orders.form.grandTotal", "Total commande")}</span>
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
          {t("common.cancel", "Annuler")}
        </button>

        <button type="submit" className="ocf-btn ocf-btn-submit" disabled={submitting}>
          {submitting ? t("common.creating", "Création...") : t("orders.form.create", "Créer la commande")}
        </button>
      </div>
    </form>
  );
}