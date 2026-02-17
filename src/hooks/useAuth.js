import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../stores/authStore";
import authAPI from "../api/auth";

const normRole = (u) =>
  String(u?.role ?? u?.userType ?? u?.type ?? "").toLowerCase();

const inferPortal = () =>
  window.location.pathname.startsWith("/admin") ? "admin" : "restaurant";

export const useAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const showModal = useCallback(
    (type, titleKey, messageKey, onConfirm = null) => {
      setModal({
        isOpen: true,
        type,
        title: t(titleKey),
        message: t(messageKey),
        onConfirm,
      });
    },
    [t]
  );

  const closeModal = useCallback(
    () => setModal((prev) => ({ ...prev, isOpen: false })),
    []
  );

  const showSuccess = useCallback(
    (msg) => showModal("success", "common.success", msg),
    [showModal]
  );

  const showError = useCallback(
    (msg) => showModal("error", "common.error", msg),
    [showModal]
  );

  const showConfirmDialog = useCallback(
    (titleKey, messageKey) => {
      return new Promise((resolve) => {
        setConfirmDialog({
          isOpen: true,
          title: t(titleKey),
          message: t(messageKey),
          onConfirm: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    [t]
  );

  const closeConfirmDialog = useCallback(
    () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
    []
  );

  // INIT AUTH
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userRole = localStorage.getItem("user_role");

        if (!token || !userRole) {
          setIsLoading(false);
          return;
        }

        const response = await authAPI.getProfile();
        const loggedUser = response.data?.user;
        if (!loggedUser) {
          throw new Error("No user profile");
        }

        setUser(loggedUser);

        // Sync Zustand (token+type via localStorage role)
        if (userRole === "admin") {
          useAuthStore.getState().loginAdmin({ user: loggedUser, token });
        } else {
          useAuthStore.getState().loginRestaurant({ user: loggedUser, token });
        }

        const p = window.location.pathname;
        if (["/", "/login", "/admin/login"].includes(p)) {
          navigate(userRole === "admin" ? "/dashboard" : "/restaurant/dashboard", {
            replace: true,
          });
        }
      } catch (err) {
        console.error("Init auth error:", err);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("zamora-auth");
        useAuthStore.getState().clear();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  // LOGIN (portal-aware)
  const login = useCallback(
    async (email, password, rememberMe = false, expectedType) => {
      setIsAuthenticating(true);
      setError(null);

      const portal = expectedType ?? inferPortal();

      try {
        const response =
          portal === "admin"
            ? await authAPI.loginAdmin({ email, password })
            : await authAPI.loginRestaurant({ email, password });

        const { user: loggedUser, token, refreshToken } = response.data || {};
        if (!loggedUser || !token) throw new Error("auth.errors.loginFailed");

        const actual = normRole(loggedUser);
        if (actual && actual !== portal) {
          // ✅ bloque admin->restaurant ou restaurant->admin
          throw new Error(portal === "admin" ? "Compte non admin" : "Compte non restaurant");
        }

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_role", portal);
        if (rememberMe && refreshToken) localStorage.setItem("refresh_token", refreshToken);

        if (portal === "admin") useAuthStore.getState().loginAdmin({ user: loggedUser, token });
        else useAuthStore.getState().loginRestaurant({ user: loggedUser, token });

        setUser(loggedUser);
        showSuccess("auth.messages.loginSuccess");

        navigate(portal === "admin" ? "/dashboard" : "/restaurant/dashboard", {
          replace: true,
        });

        return { success: true, user: loggedUser };
      } catch (err) {
        const msg = err.message || "auth.errors.loginFailed";
        setError(t(msg));
        showError(msg);
        return { success: false, error: t(msg) };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [navigate, t, showSuccess, showError]
  );

  // LOGOUT
  const logout = useCallback(
    async (showConfirm = true) => {
      const currentRole = user?.role || localStorage.getItem("user_role");

      if (showConfirm) {
        const confirmed = await showConfirmDialog(
          "auth.logout.title",
          "auth.logout.confirmMessage"
        );
        if (!confirmed) return;
      }

      try {
        await authAPI.logout();
        showSuccess("auth.messages.logoutSuccess");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("zamora-auth");
        useAuthStore.getState().clear();
        setUser(null);

        navigate(currentRole === "admin" ? "/admin/login" : "/login", {
          replace: true,
        });
      }
    },
    [user, navigate, showConfirmDialog, showSuccess]
  );

  // REGISTER RESTAURANT
  const registerRestaurant = useCallback(
    async (data) => {
      setIsAuthenticating(true);
      setError(null);

      try {
        const response = await authAPI.registerRestaurant(data);
        const { user: newUser, token } = response.data || {};
        if (!newUser || !token) throw new Error("auth.errors.registrationFailed");

        useAuthStore.getState().loginRestaurant({ user: newUser, token });
        setUser(newUser);
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_role", "restaurant");

        navigate("/restaurant/dashboard", { replace: true });
        return { success: true, user: newUser };
      } catch (err) {
        const msg = err.message || "auth.errors.registrationFailed";
        setError(t(msg));
        showError(msg);
        return { success: false, error: t(msg) };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [navigate, t, showError]
  );

  const isAdmin = normRole(user) === "admin";
  const isRestaurant = normRole(user) === "restaurant";
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticating,
    error,
    isAuthenticated,
    isAdmin,
    isRestaurant,
    login,
    logout,
    registerRestaurant,
    modal,
    closeModal,
    showModal,
    showSuccess,
    showError,
    confirmDialog,
    closeConfirmDialog,
    showConfirmDialog,
  };
};

export default useAuth;
