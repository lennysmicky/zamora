// src/hooks/usePusher.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { pusherService } from '../services/pusher';
import useAuthStore from '../stores/authStore';
import env from '../config/env';

export const usePusher = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const cleanupFnsRef = useRef([]);

  const token = useAuthStore((s) => s.token);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  useEffect(() => {
    const pusherKey = env.PUSHER_KEY;
    
    if (!pusherKey) {
      console.log(' PUSHER_KEY non défini - Notifications temps réel désactivées');
      return;
    }

    console.log(' usePusher: Initialisation...');

    // Initialiser Pusher (le service gère le singleton en interne)
    const pusher = pusherService.init();

    if (!pusher) {
      console.warn(' usePusher: Pusher non initialisé');
      return;
    }

    // Écouter les changements de connexion
    const unsubConnected = pusherService.onConnectionChange('connected', () => {
      console.log(' usePusher: Connecté!');
      setIsConnected(true);
      setConnectionState('connected');
    });

    const unsubDisconnected = pusherService.onConnectionChange('disconnected', () => {
      console.log('🔌 usePusher: Déconnecté');
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    const unsubError = pusherService.onConnectionChange('error', (err) => {
      console.error('usePusher: Erreur', err);
      setConnectionState('error');
    });

    // ============================================
    //  FIX PRINCIPAL : Vérifier l'état ACTUEL
    // Si Pusher est DÉJÀ connecté, mettre à jour l'état immédiatement
    // ============================================
    const currentState = pusherService.getState();
    const currentlyConnected = pusherService.isConnected();
    
    console.log(' usePusher: État actuel:', currentState, 'Connecté:', currentlyConnected);
    
    setIsConnected(currentlyConnected);
    setConnectionState(currentState);

    return () => {
      console.log(' usePusher: Nettoyage listeners');
      unsubConnected();
      unsubDisconnected();
      unsubError();
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, []); // Pas de dépendances - s'exécute à chaque mount (StrictMode OK)

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