// src/hooks/usePusher.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { pusherService } from '../services/pusher';
import useAuthStore from '../stores/authStore';

export const usePusher = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const cleanupFnsRef = useRef([]);
  const initializedRef = useRef(false);

  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  useEffect(() => {
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    
    if (!pusherKey) {
      console.log('ℹ VITE_PUSHER_KEY non défini');
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialiser Pusher
    const pusher = pusherService.init();

    if (!pusher) return;

    // Écouter les changements de connexion
    const unsubConnected = pusherService.onConnectionChange('connected', () => {
      setIsConnected(true);
      setConnectionState('connected');
    });

    const unsubDisconnected = pusherService.onConnectionChange('disconnected', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    // État initial
    setIsConnected(pusherService.isConnected());
    setConnectionState(pusherService.getState());

    return () => {
      unsubConnected();
      unsubDisconnected();
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, []);

  const subscribe = useCallback((channelName) => {
    return pusherService.subscribe(channelName);
  }, []);

  const unsubscribe = useCallback((channelName) => {
    pusherService.unsubscribe(channelName);
  }, []);

  const on = useCallback((channelName, eventName, callback) => {
    const cleanup = pusherService.on(channelName, eventName, callback);
    cleanupFnsRef.current.push(cleanup);
    return cleanup;
  }, []);

  const disconnect = useCallback(() => {
    pusherService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  return {
    isConnected,
    connectionState,
    subscribe,
    unsubscribe,
    on,
    disconnect,
    restaurantId,
    getSocketId: () => pusherService.getSocketId(),
  };
};

export default usePusher;