// src/hooks/useTables.js
import { useState, useEffect, useCallback } from 'react';
import { tablesApi } from '../api/tables';
import useAuthStore from '../stores/authStore';

export const useTables = () => {
  const { restaurantId } = useAuthStore();
  
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({ total: 0, libre: 0, occupee: 0, reservee: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Charger les tables
  const fetchTables = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [tablesData, statsData] = await Promise.allSettled([
        tablesApi.getTables(restaurantId),
        tablesApi.getStats(restaurantId)
      ]);

      if (tablesData.status === 'fulfilled') {
        setTables(tablesData.value || []);
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value || { total: 0, libre: 0, occupee: 0, reservee: 0 });
      } else {
        // Calculer les stats depuis les tables
        const t = tablesData.value || [];
        setStats({
          total: t.length,
          libre: t.filter(x => x.status === 'libre' || !x.status).length,
          occupee: t.filter(x => x.status === 'occupee').length,
          reservee: t.filter(x => x.status === 'reservee').length,
        });
      }
    } catch (err) {
      console.error('Erreur chargement tables:', err);
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Créer une table
  const createTable = async (data) => {
    if (!restaurantId) return { success: false, error: 'Restaurant non trouvé' };

    setSaving(true);
    try {
      const newTable = await tablesApi.createTable(restaurantId, data);
      setTables(prev => [...prev, newTable]);
      await fetchTables(); // Refresh pour avoir les stats à jour
      return { success: true, table: newTable };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de création' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Créer plusieurs tables
  const createMultipleTables = async (count) => {
    if (!restaurantId) return { success: false, error: 'Restaurant non trouvé' };

    setSaving(true);
    try {
      await tablesApi.createMultipleTables(restaurantId, count);
      await fetchTables();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de création' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour une table
  const updateTable = async (tableId, data) => {
    setSaving(true);
    try {
      const updated = await tablesApi.updateTable(tableId, data);
      setTables(prev => prev.map(t => t._id === tableId ? { ...t, ...updated } : t));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de mise à jour' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Changer le statut
  const updateStatus = async (tableId, status) => {
    try {
      await tablesApi.updateStatus(tableId, status);
      setTables(prev => prev.map(t => t._id === tableId ? { ...t, status } : t));
      // Recalculer stats
      setStats(prev => {
        const newStats = { ...prev };
        const oldTable = tables.find(t => t._id === tableId);
        if (oldTable?.status) newStats[oldTable.status]--;
        newStats[status]++;
        return newStats;
      });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de mise à jour' 
      };
    }
  };

  // Supprimer une table
  const deleteTable = async (tableId) => {
    setSaving(true);
    try {
      await tablesApi.deleteTable(tableId);
      setTables(prev => prev.filter(t => t._id !== tableId));
      await fetchTables();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur de suppression' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Régénérer QR
  const regenerateQR = async (tableId) => {
    setSaving(true);
    try {
      const updated = await tablesApi.regenerateQR(tableId);
      setTables(prev => prev.map(t => t._id === tableId ? { ...t, ...updated } : t));
      return { success: true, table: updated };
    } catch (err) {
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Erreur régénération QR' 
      };
    } finally {
      setSaving(false);
    }
  };

  // Obtenir l'URL du menu
  const getMenuUrl = (tableId, tableNumber) => {
    return tablesApi.getMenuUrl(restaurantId, tableId, tableNumber);
  };

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