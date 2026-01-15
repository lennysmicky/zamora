import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { 
  RiAddLine, 
  RiEditLine, 
  RiDeleteBinLine,
} from 'react-icons/ri';

const PromotionsTable = ({
  promotions = [],
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { t } = useTranslation();
  if (isLoading) {
    return <p>{t('common.loading')}</p>;
  }
  if (promotions.length === 0) {
    return <p>{t('promotions.empty')}</p>;
  }
  return (
    <table className="promotions-table">
      <thead>
        <tr>
          <th>{t('promotions.title')}</th>
          <th>{t('promotions.startDate')}</th>
          <th>{t('promotions.endDate')}</th>
          <th>Status</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {promotions.map((promo) => (
          <tr key={promo.id}>
            <td>{promo.title}</td>
            <td>{promo.startDate}</td>
            <td>{promo.endDate}</td>
            <td>
              <button
                className={`status-btn ${promo.active ? 'active' : 'inactive'}`}
                title='changer de status'
                onClick={() => onToggleStatus(promo.id)}
              >
                {promo.active ? t('active') : t('inactive')}
              </button>
            </td>
            <td className="actions">
              <button onClick={() => onEdit(promo)} title="Modifier">
                < RiEditLine />
              </button>
              <button
                className="danger"
                onClick={() => onDelete(promo.id)}
                title="Supprimer"
              >
                <RiDeleteBinLine />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PromotionsTable;
