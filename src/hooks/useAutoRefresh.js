import { useEffect, useRef } from 'react';

export const useAutoRefresh = (fetchFunction, intervalMs = 30000) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    // Si intervalMs est null, undefined ou 0, on ne fait rien
    if (!intervalMs) return;

    // Rafraîchissement silencieux en arrière-plan
    intervalRef.current = setInterval(() => {
      fetchFunction();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFunction, intervalMs]);
};