import { useEffect, useCallback, useState } from 'react';

/**
 * Hook WebSocket qui se désactive automatiquement si pas d'URL
 */
export const useWebSocket = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISABLED');
  
  const {
    url = import.meta.env.VITE_WS_URL || '',
    autoConnect = false,
    onConnected,
    onDisconnected,
    onError,
    onMessage,
  } = options;

  //  Si pas d'URL WebSocket, retourner un hook inactif
  if (!url || url.trim() === '') {
    console.log(' WebSocket désactivé (pas d\'URL configurée)');
    
    return {
      isConnected: false,
      connectionState: 'DISABLED',
      connect: () => console.log('WebSocket désactivé'),
      disconnect: () => {},
      send: () => {},
      subscribe: () => () => {}, // Retourne une fonction de désabonnement vide
    };
  }

  // Si URL existe, charger le vrai service WebSocket
  const { wsService } = require('../services/websocket');
  const useAuthStore = require('../stores/authStore').default;

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const connect = useCallback(() => {
    if (!url) return;

    wsService.connect(url, {
      token,
      userId: user?.id || user?._id,
      restaurantId,
    });
  }, [url, token, user, restaurantId]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const send = useCallback((data) => {
    wsService.send(data);
  }, []);

  const subscribe = useCallback((event, callback) => {
    return wsService.on(event, callback);
  }, []);

  useEffect(() => {
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

    if (autoConnect) {
      connect();
    }

    setIsConnected(wsService.isConnected());
    setConnectionState(wsService.getState());

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubError();
      unsubMessage();
      disconnect();
    };
  }, [autoConnect, connect, disconnect, onMessage, onConnected, onDisconnected, onError]);

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