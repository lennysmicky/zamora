import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCalendarLine } from "react-icons/ri";
import ConfirmDialog from "../common/ConfirmDialog";
import "./MealList.css"; // réutilise le design existant

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const safeId = (x) => x?.id ?? x?._id ?? null;

const formatDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("fr-FR");
};

const formatDays = (v) => {
  const arr = asArray(v).filter(Boolean);
  if (arr.length === 0) return "-";
  // si backend renvoie string unique, on l'affiche
  return arr.join(", ");
};

const MenuList = ({
  menus = [],
  onAddMenu,
  onEditMenu,
  onDeleteMenu,
  isLoading,
}) => {
  const { t } = useTranslation();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (menu) => {
    setMenuToDelete(menu);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;

    setIsDeleting(true);
    await onDeleteMenu?.(safeId(menuToDelete));
    setIsDeleting(false);
    setShowConfirmDelete(false);
    setMenuToDelete(null);
  };

  // Loading skeleton (réutilise skeleton table MealList)
  if (isLoading) {
    return (
      <div className="meal-list" style={{ marginTop: 16 }}>
        <div className="meal-list-header">
          <div className="meal-list-title">
            <h3>{t("menu.menus.title", { defaultValue: "Menus" })}</h3>
          </div>
        </div>

        <div className="meal-list-content">
          <div className="meal-table-container">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>{t("menu.menus.name", { defaultValue: "NOM DU MENU" })}</th>
                  <th>{t("menu.menus.period", { defaultValue: "PÉRIODE" })}</th>
                  <th>{t("menu.menus.days", { defaultValue: "JOURS" })}</th>
                  <th>{t("menu.menus.status", { defaultValue: "STATUT" })}</th>
                  <th>{t("common.actions", { defaultValue: "ACTIONS" })}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td>
                      <div className="skeleton-text" style={{ width: "160px" }}></div>
                      <div className="skeleton-text small" style={{ width: "220px" }}></div>
                    </td>
                    <td><div className="skeleton-text" style={{ width: "140px" }}></div></td>
                    <td><div className="skeleton-text" style={{ width: "180px" }}></div></td>
                    <td><div className="skeleton-text" style={{ width: "90px" }}></div></td>
                    <td><div className="skeleton-text" style={{ width: "100px" }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-list" style={{ marginTop: 16 }}>
      {/* Header */}
      <div className="meal-list-header">
        <div className="meal-list-title">
          <h3>{t("menu.menus.title", { defaultValue: "Menus" })}</h3>
        </div>

        <button
          className="meal-add-btn"
          onClick={onAddMenu}
          title={t("menu.menus.add", { defaultValue: "Ajouter un menu" })}
        >
          <RiAddLine />
          <span>{t("menu.menus.add", { defaultValue: "Ajouter un menu" })}</span>
        </button>
      </div>

      {/* Content */}
      <div className="meal-list-content">
        {menus.length === 0 ? (
          <div className="meal-list-empty">
            <RiCalendarLine className="empty-icon" />
            <p>{t("menu.menus.empty", { defaultValue: "Aucun menu" })}</p>
            <span>{t("menu.menus.emptyDesc", { defaultValue: "Créez votre premier menu (déjeuner, dîner, etc.)." })}</span>
          </div>
        ) : (
          <div className="meal-table-container">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>{t("menu.menus.name", { defaultValue: "NOM DU MENU" })}</th>
                  <th>{t("menu.menus.period", { defaultValue: "PÉRIODE" })}</th>
                  <th>{t("menu.menus.days", { defaultValue: "JOURS" })}</th>
                  <th>{t("menu.menus.status", { defaultValue: "STATUT" })}</th>
                  <th>{t("common.actions", { defaultValue: "ACTIONS" })}</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m) => {
                  const id = safeId(m);
                  const days = formatDays(m.validDays);
                  const period = `${formatDate(m.startTime)} → ${formatDate(m.endTime)}`;

                  return (
                    <tr key={id} className={!m.isActive ? "unavailable" : ""}>
                      <td className="meal-info-cell">
                        <div className="meal-info">
                          <div className="meal-details">
                            <span className="meal-name">{m.name || "-"}</span>
                            {m.description ? (
                              <span className="meal-description">{m.description}</span>
                            ) : (
                              <span className="meal-description" style={{ opacity: 0.6 }}>
                                {t("menu.menus.noDesc", { defaultValue: "Aucune description" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="meal-price-cell">
                        <span className="meal-price">{period}</span>
                      </td>

                      <td className="meal-price-cell">
                        <span className="meal-price">
                          {days}
                          {m.isDefault ? (
                            <span style={{ marginLeft: 8, opacity: 0.7 }}>
                              • {t("menu.menus.default", { defaultValue: "Défaut" })}
                            </span>
                          ) : null}
                        </span>
                      </td>

                      <td className="meal-availability-cell">
                        <span className={`availability-toggle ${m.isActive ? "available" : "unavailable"}`}>
                          <span>{m.isActive ? t("common.active", { defaultValue: "Actif" }) : t("common.inactive", { defaultValue: "Inactif" })}</span>
                        </span>
                      </td>

                      <td className="meal-actions-cell">
                        <div className="meal-actions">
                          <button
                            className="meal-action-btn edit"
                            onClick={() => onEditMenu?.(m)}
                            title={t("menu.actions.edit", { defaultValue: "Modifier" })}
                          >
                            <RiEditLine />
                          </button>
                          <button
                            className="meal-action-btn delete"
                            onClick={() => handleDeleteClick(m)}
                            title={t("menu.actions.delete", { defaultValue: "Supprimer" })}
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title={t("menu.menus.confirmDelete", { defaultValue: "Supprimer le menu ?" })}
        message={t("menu.menus.confirmDeleteMessage", { defaultValue: "Cette action est irréversible." })}
        type="danger"
        confirmText={t("common.delete", { defaultValue: "Supprimer" })}
        cancelText={t("common.cancel", { defaultValue: "Annuler" })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MenuList;