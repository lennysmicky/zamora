import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath =
      allowedTypes.includes("admin") ? "/admin/login" :
      allowedTypes.includes("restaurant") ? "/login" :
      "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(userType)) {
    return <Navigate to={getRedirectPath(userType)} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);

  if (isAuthenticated) return <Navigate to={getRedirectPath(userType)} replace />;
  return children;
};

export const AuthRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRedirectPath(userType)} replace />;
};

const getRedirectPath = (userType) => {
  switch (userType) {
    case "admin":
      return "/dashboard";
    case "restaurant":
      return "/restaurant/dashboard";
    default:
      return "/login";
  }
};

export default ProtectedRoute;
