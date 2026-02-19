// src/utils/dashboardEvents.js
const DASHBOARD_REFRESH_EVENT = "zamora:dashboard-refresh";

export const emitDashboardRefresh = (detail = {}) => {
  if (typeof window === "undefined") return;

  // CustomEvent supporté par tous les navigateurs modernes
  let ev;
  try {
    ev = new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail });
  } catch {
    // fallback: event sans detail (au moins pas de crash)
    ev = new Event(DASHBOARD_REFRESH_EVENT);
    ev.detail = detail; // best-effort (pas standard, mais utile)
  }

  window.dispatchEvent(ev);
};

export const onDashboardRefresh = (handler) => {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};

  const listener = (e) => handler(e?.detail ?? {});
  window.addEventListener(DASHBOARD_REFRESH_EVENT, listener);
  return () => window.removeEventListener(DASHBOARD_REFRESH_EVENT, listener);
};

export { DASHBOARD_REFRESH_EVENT };
