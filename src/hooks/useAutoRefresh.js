import { useEffect, useRef } from 'react';

export const useAutoRefresh = (fetchFunction, intervalMs = 30000) => {
  const intervalRef = useRef(null);

  useEffect(() => {
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