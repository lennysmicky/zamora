import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiEditLine,
  RiDeleteBinLine,
  RiToggleLine,
  RiToggleFill,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiStore2Line
} from 'react-icons/ri';
import './css/RestaurantsTable.css';

const RestaurantsTable = ({ restaurants = [], onEdit, onDelete, onToggleStatus }) => {
  const { t } = useTranslation();

  const formatPhone = (phone) => {
    if (!phone) return '-';
    return String(phone).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  const getId = (r) => r._id || r.id;

  // Map backend status → CSS class
  const mapStatusToClass = (status) => (status === 'Ouvert' ? 'active' : 'inactive');

  return (
    <div className="restaurants-table-wrapper">
      <table className="restaurants-table">
        <thead>
          <tr>
            <th>{t('restaurants.table.name', 'Restaurant')}</th>
            <th>{t('restaurants.table.contact', 'Contact')}</th>
            <th>{t('restaurants.table.status', 'Statut')}</th>
            <th>{t('restaurants.table.actions', 'Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => {
            const statusClass = mapStatusToClass(restaurant.status);
            const isOpen = restaurant.status === 'Ouvert';

            return (
              <tr key={getId(restaurant)}>
                <td>
                  <div className="restaurant-cell">
                    <div className="restaurant-avatar">
                      <RiStore2Line />
                    </div>
                    <div className="restaurant-info">
                      <span className="restaurant-name">{restaurant.name}</span>
                      <span className="restaurant-address">
                        <RiMapPinLine />
                        {restaurant.address || '-'}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="contact-cell">
                    <div className="contact-item">
                      <RiPhoneLine />
                      <span>{formatPhone(restaurant.phone)}</span>
                    </div>
                    <div className="contact-item">
                      <RiMailLine />
                      <span>{restaurant.email || '-'}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <button
                    className={`status-toggle ${statusClass}`}
                    onClick={() => onToggleStatus(restaurant)}
                  >
                    {isOpen ? (
                      <>
                        <RiToggleFill />
                        <span>{t('restaurants.active', 'Ouvert')}</span>
                      </>
                    ) : (
                      <>
                        <RiToggleLine />
                        <span>{t('restaurants.inactive', 'Fermé')}</span>
                      </>
                    )}
                  </button>
                </td>

                <td>
                  <div className="actions-cell">
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(restaurant)}
                      title={t('common.edit', 'Modifier')}
                    >
                      <RiEditLine />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(restaurant)}
                      title={t('common.delete', 'Supprimer')}
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
  );
};

export default RestaurantsTable;
