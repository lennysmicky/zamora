// src/hooks/useTables.js
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { tablesApi } from "../api/tables";
import useAuthStore from "../stores/authStore";

const EMPTY_STATS = { total: 0, libre: 0, occupee: 0, reservee: 0 };

// IMPORTANT: préférer _id (Mongo) à id (souvent ambigu)
const idOf = (x) => x?._id ?? x?.id ?? null;

const numOf = (t) =>
  t?.numero_table ??
  t?.numero ??
  t?.number ??
  t?.numeroTable ??
  t?.tableNumber ??
  null;

const statusRawOf = (t) => t?.status ?? t?.etat ?? t?.state ?? null;

const normStatus = (s) => {
  const v = String(s ?? "").toLowerCase().trim();
  if (["libre", "free", "available", "disponible"].includes(v)) return "libre";
  if (["occupee", "occupée", "occupe", "occupied", "busy"].includes(v)) return "occupee";
  if (["reservee", "réservée", "reserve", "reserved"].includes(v)) return "reservee";
  return "libre";
};

const toInt = (v, def = 0) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
};

const computeStats = (arr = []) => {
  const t = Array.isArray(arr) ? arr : [];
  const s = { ...EMPTY_STATS, total: t.length };
  for (const row of t) {
    const st = normStatus(statusRawOf(row));
    s[st] += 1;
  }
  return s;
};

// accepte string OU objet table/id, bloque "[object Object]"
const resolveId = (tableIdOrObj) => {
  if (!tableIdOrObj) return null;
  if (typeof tableIdOrObj === "object") return resolveId(idOf(tableIdOrObj));
  const id = String(tableIdOrObj);
  if (!id || id === "[object Object]") return null;
  return id;
};

// stats backend parfois avec clés différentes -> normaliser + valider
const normalizeStatsFromApi = (raw, tablesFallback = []) => {
  if (!raw || typeof raw !== "object") return computeStats(tablesFallback);

  const libre = raw.libre ?? raw.libres ?? raw.free ?? raw.available ?? raw.disponible;
  const occupee = raw.occupee ?? raw.occupees ?? raw.occupied ?? raw.busy;
  const reservee = raw.reservee ?? raw.reservees ?? raw.reserved;

  const out = {
    total: toInt(raw.total ?? raw.count ?? raw.nb ?? tablesFallback.length, tablesFallback.length),
    libre: toInt(libre, 0),
    occupee: toInt(occupee, 0),
    reservee: toInt(reservee, 0),
  };

  const sum = out.libre + out.occupee + out.reservee;

  // si API renvoie des champs non mappés -> on tombe à 0 : fallback fiable
  if (sum === 0 && (tablesFallback?.length ?? 0) > 0) return computeStats(tablesFallback);

  // cohérence total
  if (out.total === 0 && sum > 0) out.total = sum;

  return out;
};

export const useTables = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // anti-race: ignore les réponses hors-ordre
  const fetchSeqRef = useRef(0);

  const existingNumbers = useMemo(() => {
    return (tables || [])
      .map((t) => Number(numOf(t)))
      .filter((n) => Number.isFinite(n));
  }, [tables]);

  const fetchTables = useCallback(async () => {
    const seq = ++fetchSeqRef.current;

    if (!restaurantId) {
      setTables([]);
      setStats(EMPTY_STATS);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [tablesRes, statsRes] = await Promise.allSettled([
        tablesApi.getTables(restaurantId),
        tablesApi.getStats(restaurantId),
      ]);

      if (seq !== fetchSeqRef.current) return;

      const t = tablesRes.status === "fulfilled" ? (tablesRes.value || []) : [];
      setTables(t);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(normalizeStatsFromApi(statsRes.value, t));
      } else {
        setStats(computeStats(t));
      }

      if (tablesRes.status === "rejected" && statsRes.status === "rejected") {
        const err = tablesRes.reason ?? statsRes.reason;
        setError(err?.response?.data?.message || err?.message || "Erreur de chargement");
      }
    } catch (err) {
      if (seq !== fetchSeqRef.current) return;
      setError(err?.response?.data?.message || err?.message || "Erreur de chargement");
      setTables([]);
      setStats(EMPTY_STATS);
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const createTable = useCallback(
    async (data) => {
      if (!restaurantId) return { success: false, error: "Restaurant non trouvé" };

      setSaving(true);
      try {
        const created = await tablesApi.createTable(restaurantId, data);
        await fetchTables();
        return { success: true, table: created };
      } catch (err) {
        return {
          success: false,
          error: err?.response?.data?.message || err?.message || "Erreur de création",
        };
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, fetchTables]
  );

  const createMultipleTables = useCallback(
    async (count) => {
      if (!restaurantId) return { success: false, error: "Restaurant non trouvé" };

      const n = Number.parseInt(String(count ?? ""), 10);
      if (!Number.isFinite(n) || n < 1 || n > 50) {
        return { success: false, error: "Le nombre doit être entre 1 et 50" };
      }

      setSaving(true);
      try {
        if (typeof tablesApi.createMultipleTables === "function") {
          await tablesApi.createMultipleTables(restaurantId, n);
          await fetchTables();
          return { success: true };
        }

        // Fallback: création séquentielle
        const used = new Set(existingNumbers);
        let start = used.size ? Math.max(...existingNumbers) + 1 : 1;

        const createdIds = [];
        for (let i = 0; i < n; i++) {
          while (used.has(start)) start++;
          const payload = { numero_table: start, capacite: 4, status: "libre" };
          const created = await tablesApi.createTable(restaurantId, payload);
          createdIds.push(resolveId(created));
          used.add(start);
          start++;
        }

        await fetchTables();
        return { success: true, createdIds };
      } catch (err) {
        return {
          success: false,
          error: err?.response?.data?.message || err?.message || "Erreur de création",
        };
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, existingNumbers, fetchTables]
  );

  const updateTable = useCallback(
    async (tableId, data) => {
      if (!restaurantId) return { success: false, error: "Restaurant non trouvé" };

      const id = resolveId(tableId);
      if (!id) return { success: false, error: "ID table invalide" };

      const { _id, id: _id2, ...payload } = data || {};

      setSaving(true);
      try {
        const updated = await tablesApi.updateTable(restaurantId, id, payload);

        setTables((prev) => {
          const next = (prev || []).map((t) =>
            String(resolveId(t)) === String(id) ? { ...t, ...updated } : t
          );
          setStats(computeStats(next));
          return next;
        });

        return { success: true, table: updated };
      } catch (err) {
        return {
          success: false,
          error: err?.response?.data?.message || err?.message || "Erreur de mise à jour",
        };
      } finally {
        setSaving(false);
      }
    },
    [restaurantId]
  );

  const updateStatus = useCallback(
    async (tableId, status) => updateTable(tableId, { status: normStatus(status) }),
    [updateTable]
  );

  const deleteTable = useCallback(
    async (tableIdOrObj) => {
      if (!restaurantId) return { success: false, error: "Restaurant non trouvé" };

      const id = resolveId(tableIdOrObj);
      if (!id) return { success: false, error: "ID table invalide" };

      // Optimiste: enlève exactement la table cliquée côté UI
      let snapshot = null;
      setTables((prev) => {
        snapshot = prev;
        const next = (prev || []).filter((t) => String(resolveId(t)) !== String(id));
        setStats(computeStats(next));
        return next;
      });

      setSaving(true);
      try {
        await tablesApi.deleteTable(restaurantId, id);
        // refresh pour être sûr
        await fetchTables();
        return { success: true };
      } catch (err) {
        // rollback si erreur
        if (snapshot) {
          setTables(snapshot);
          setStats(computeStats(snapshot));
        }
        return {
          success: false,
          error: err?.response?.data?.message || err?.message || "Erreur de suppression",
        };
      } finally {
        setSaving(false);
      }
    },
    [restaurantId, fetchTables]
  );

  const regenerateQR = useCallback(async (tableId) => {
    if (typeof tablesApi.regenerateQR !== "function") {
      return {
        success: false,
        error: "Route regenerate-qr non disponible (backend).",
      };
    }

    const id = resolveId(tableId);
    if (!id) return { success: false, error: "ID table invalide" };

    setSaving(true);
    try {
      const updated = await tablesApi.regenerateQR(id);
      setTables((prev) => {
        const next = (prev || []).map((t) =>
          String(resolveId(t)) === String(id) ? { ...t, ...updated } : t
        );
        setStats(computeStats(next));
        return next;
      });
      return { success: true, table: updated };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || err?.message || "Erreur régénération QR",
      };
    } finally {
      setSaving(false);
    }
  }, []);

  const getMenuUrl = useCallback(
    (tableId, tableNumber) => {
      if (!restaurantId) return "";
      return tablesApi.getMenuUrl(restaurantId, tableId, tableNumber);
    },
    [restaurantId]
  );

  return {
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
    getMenuUrl,
  };
};

export default useTables;