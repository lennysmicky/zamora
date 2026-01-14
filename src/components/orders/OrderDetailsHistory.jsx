import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiHistoryLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiTruckLine,
  RiRestaurantLine,
  RiCloseCircleLine,
  RiBankCardLine
} from 'react-icons/ri';
import './css/OrderDetailsModal.css';

const OrderDetailsHistory = ({ history }) => {
  const { t } = useTranslation();

  const getEventIcon = (eventType) => {
    const icons = {
      created: RiTimeLine,
      confirmed: RiCheckboxCircleLine,
      preparing: RiRestaurantLine,
      out_for_delivery: RiTruckLine,
      delivered: RiCheckboxCircleLine,
      cancelled: RiCloseCircleLine,
      payment_received: RiBankCardLine,
      payment_failed: RiCloseCircleLine
    };
    return icons[eventType] || RiHistoryLine;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!history || history.length === 0) {
    return (
      <div className="order-details-section">
        <h3>
          <RiHistoryLine />
          {t('orders.details.history')}
        </h3>
        <p className="no-data">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="order-details-section">
      <h3>
        <RiHistoryLine />
        {t('orders.details.history')}
      </h3>

      <div className="order-timeline">
        {history.map((event, index) => {
          const Icon = getEventIcon(event.type);
          return (
            <div key={index} className="timeline-item">
              <div className="timeline-icon">
                <Icon />
              </div>
              <div className="timeline-content">
                <span className="timeline-event">{event.description}</span>
                <span className="timeline-date">{formatDate(event.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetailsHistory;