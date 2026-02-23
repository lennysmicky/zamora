import { useCallback, useEffect, useMemo, useState } from "react";
import menusAPI from "../api/menus";

const normId = (x) => ({ ...x, id: x?.id ?? x?._id });

export const useRestaurantMenus = ({ restaurantId }) => {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedMenuId = useMemo(() => selectedMenu?.id ?? "", [selectedMenu]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await menusAPI.getMenus({ restaurantId });
      const list = payload?.menus ?? payload?.data ?? payload ?? [];
      const arr = (Array.isArray(list) ? list : []).map(normId);

      setMenus(arr);
      setSelectedMenu((prev) => {
        const prevId = prev?.id;
        if (prevId && arr.some((m) => m.id === prevId)) return prev;
        return arr.find((m) => m.isDefault) ?? arr[0] ?? null;
      });
    } catch (e) {
      setError(e?.message ?? "Erreur chargement menus");
      setMenus([]);
      setSelectedMenu(null);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  const selectById = useCallback(
    (id) => setSelectedMenu(menus.find((m) => String(m.id) === String(id)) ?? null),
    [menus]
  );

  const createMenu = useCallback(async (data) => {
    try {
      await menusAPI.createMenu({ ...data, restaurantId });
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur création menu" };
    }
  }, [restaurantId, refresh]);

  const updateMenu = useCallback(async (id, data) => {
    try {
      await menusAPI.updateMenu(id, { ...data, restaurantId });
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur modification menu" };
    }
  }, [restaurantId, refresh]);

  const deleteMenu = useCallback(async (id) => {
    try {
      await menusAPI.deleteMenu(id);
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message ?? "Erreur suppression menu" };
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { menus, selectedMenu, selectedMenuId, selectById, isLoading, error, createMenu, updateMenu, deleteMenu };
};

export default useRestaurantMenus;