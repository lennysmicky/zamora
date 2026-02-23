// pages/Restaurant/Orders/RestaurantOrdersPage.jsx
import React from "react";
import OrdersPage from "../../Orders/OrdersPage";
import useAuthStore from "../../../stores/authStore";

const RestaurantOrdersPage = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);

  return <OrdersPage mode="restaurant" restaurantId={restaurantId} disableUrlSync />;
};

export default RestaurantOrdersPage;