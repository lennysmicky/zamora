import client from "./client";

const getErrorMessage = (err) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed"
  );
};

export const getNotificationSettings = async (restaurantId) => {
  if (!restaurantId) {
    throw new Error("restaurantId est requis pour récupérer les paramètres de notification");
  }

  try {
    const response = await client.get(`/notification/settings/${restaurantId}`);
    console.log("GET notification settings response =", response.data);
    return response.data;
  } catch (err) {
    console.error("GET notification settings error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const updateNotificationSettings = async (data, restaurantId) => {
  if (!restaurantId) {
    throw new Error("restaurantId est requis pour modifier les paramètres de notification");
  }

  const payload = {
    events: {
      newOrder: !!data?.events?.newOrder,
      orderClient: !!data?.events?.orderClient,
      statusOrderChanged: !!data?.events?.statusOrderChanged,
      promotion: !!data?.events?.promotion,
    },
    channels: {
      email: !!data?.channels?.email,
      push: !!data?.channels?.push,
    },
  };

  try {
    console.log("PUT notification settings url =", `/notification/settings/${restaurantId}`);
    console.log("PUT notification settings payload =", payload);

    const response = await client.put(`/notification/settings/${restaurantId}`, payload);

    console.log("PUT notification settings response =", response.data);
    return response.data;
  } catch (err) {
    console.error("PUT notification settings error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const getNotificationStats = async (params = {}) => {
  try {
    const response = await client.get("/notification/stats", { params });
    return response.data;
  } catch (err) {
    console.error("GET notification stats error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const getNotificationsLog = async (params = {}) => {
  try {
    const response = await client.get("/notification", { params });
    return response.data;
  } catch (err) {
    console.error("GET notifications log error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const getNotificationById = async (id) => {
  try {
    const response = await client.get(`/notification/${id}`);
    return response.data;
  } catch (err) {
    console.error("GET notification by id error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const createNotification = async (data) => {
  try {
    const response = await client.post("/notification", data);
    return response.data;
  } catch (err) {
    console.error("POST notification error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const updateNotification = async (id, data) => {
  try {
    const response = await client.put(`/notification/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("PUT notification error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const deleteNotificationLog = async (id) => {
  try {
    const response = await client.delete(`/notification/${id}`);
    return response.data;
  } catch (err) {
    console.error("DELETE notification error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await client.put(`/notification/read/${notificationId}`);
    return response.data;
  } catch (err) {
    console.error("PUT mark as read error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export const getUnreadNotificationCount = async (userId) => {
  try {
    const response = await client.get(`/notification/count/${userId}`);
    return response.data;
  } catch (err) {
    console.error("GET unread count error =", err?.response || err);
    throw new Error(getErrorMessage(err));
  }
};

export default {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationStats,
  getNotificationsLog,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotificationLog,
  markNotificationAsRead,
  getUnreadNotificationCount,
};