// pages/Restaurant/Orders/RestaurantOrdersPage.jsx
import React from 'react';
import OrdersPage from '../../Orders/OrdersPage';
import useAuthStore from '../../../stores/authStore';

const RestaurantOrdersPage = () => {
  const { restaurantId } = useAuthStore();
  
  return <OrdersPage restaurantId={restaurantId} />;
};

export default RestaurantOrdersPage;