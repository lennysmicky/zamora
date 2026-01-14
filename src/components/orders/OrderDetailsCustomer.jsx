import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiUserLine, 
  RiPhoneLine, 
  RiMailLine, 
  RiMapPinLine 
} from 'react-icons/ri';
import './css/OrderDetailsModal.css';

const OrderDetailsCustomer = ({ customer }) => {
  const { t } = useTranslation();

  if (!customer) {
    return (
      <div className="order-details-section">
        <h3>
          <RiUserLine />
          {t('orders.details.customer')}
        </h3>
        <p className="no-data">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="order-details-section">
      <h3>
        <RiUserLine />
        {t('orders.details.customer')}
      </h3>

      <div className="customer-details">
        <div className="customer-detail-row">
          <RiUserLine className="detail-icon" />
          <span>{customer.name}</span>
        </div>

        {customer.phone && (
          <div className="customer-detail-row">
            <RiPhoneLine className="detail-icon" />
            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
          </div>
        )}

        {customer.email && (
          <div className="customer-detail-row">
            <RiMailLine className="detail-icon" />
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
          </div>
        )}

        {customer.address && (
          <div className="customer-detail-row">
            <RiMapPinLine className="detail-icon" />
            <span>{customer.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsCustomer;