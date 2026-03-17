import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../services/websocket';
import useAuthStore from '../stores/authStore';

/**
 * Hook pour utiliser WebSocket facilement dans les composants React
 */
export const useWebSocket = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const {
    url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    autoConnect = true,
    onMessage,
    onConnected,
    onDisconnected,
    onError,
  } = options;

  // Connecter au WebSocket
  const connect = useCallback(() => {
    if (!url) {
      console.warn('⚠️ URL WebSocket non définie');
      return;
    }

    wsService.connect(url, {
      token,
      userId: user?.id || user?._id,
      restaurantId,
    });
  }, [url, token, user, restaurantId]);

  // Déconnecter
  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  // Envoyer un message
  const send = useCallback((data) => {
    wsService.send(data);
  }, []);

  // S'abonner à un événement
  const subscribe = useCallback((event, callback) => {
    return wsService.on(event, callback);
  }, []);

  useEffect(() => {
    // Écouter les événements de connexion
    const unsubConnected = wsService.on('connected', () => {
      setIsConnected(true);
      setConnectionState('OPEN');
      onConnected?.();
    });

    const unsubDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
      setConnectionState('CLOSED');
      onDisconnected?.();
    });

    const unsubError = wsService.on('error', (error) => {
      onError?.(error);
    });

    const unsubMessage = wsService.on('message', (data) => {
      onMessage?.(data);
    });

    // Connexion automatique
    if (autoConnect && !wsService.isConnected()) {
      connect();
    }

    // Mettre à jour l'état initial
    setIsConnected(wsService.isConnected());
    setConnectionState(wsService.getState());

    // Nettoyage
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubError();
      unsubMessage();
    };
  }, [autoConnect, connect, onMessage, onConnected, onDisconnected, onError]);

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
    send,
    subscribe,
  };
};

export default useWebSocket;