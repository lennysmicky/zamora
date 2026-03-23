// src/hooks/useWebSocket.js
import { useEffect, useCallback, useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';

/**
 * Service WebSocket Singleton
 */
class WebSocketServiceClass {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.url = null;
    this.authOptions = null;
  }

  connect(url, options = {}) {
    // Vérifier si déjà connecté
    if (this.isConnecting) {
      console.log(' WebSocket connexion en cours...');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(' WebSocket déjà connecté');
      return;
    }

    if (!url || url.trim() === '') {
      console.log(' WebSocket: pas d\'URL configurée');
      return;
    }

    this.isConnecting = true;
    this.url = url;
    this.authOptions = options;

    try {
      console.log('🔌 Connexion WebSocket à:', url);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(' WebSocket connecté!');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');

        // Authentification
        if (options.token) {
          this.send({
            type: 'auth',
            token: options.token,
            userId: options.userId,
            restaurantId: options.restaurantId,
          });
          console.log(' Authentification WebSocket envoyée');
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(' Message WebSocket:', data.type, data);
          
          // Émettre l'événement générique
          this.emit('message', data);
          
          // Émettre l'événement spécifique au type
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (error) {
          console.error(' Erreur parsing WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(' Erreur WebSocket:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket fermé:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected', event);

        // Reconnexion automatique si déconnexion anormale
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };
    } catch (error) {
      console.error(' Erreur création WebSocket:', error);
      this.isConnecting = false;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(' Erreur envoi WebSocket:', error);
        return false;
      }
    }
    console.warn(' WebSocket non connecté');
    return false;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    // Retourner fonction de désabonnement
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(` Erreur listener ${event}:`, error);
      }
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(' Max tentatives de reconnexion atteint');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(` Reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms...`);

    setTimeout(() => {
      if (this.url) {
        this.connect(this.url, this.authOptions);
      }
    }, delay);
  }

  disconnect() {
    console.log('🔌 Déconnexion WebSocket...');
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    if (this.ws) {
      this.ws.close(1000, 'Déconnexion manuelle');
      this.ws = null;
    }
    
    this.listeners.clear();
    this.isConnecting = false;
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getState() {
    if (!this.ws) return 'CLOSED';
    
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED',
    };
    
    return states[this.ws.readyState] || 'UNKNOWN';
  }
}

// Singleton exporté
export const wsService = new WebSocketServiceClass();

/**
 * Hook React pour utiliser WebSocket
 */
export const useWebSocket = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const initializedRef = useRef(false);

  const {
    url = import.meta.env.VITE_WS_URL || '',
    autoConnect = true,
    onConnected,
    onDisconnected,
    onError,
    onMessage,
  } = options;

  // État d'authentification
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const connect = useCallback(() => {
    if (!url || url.trim() === '') {
      console.log(' Pas d\'URL WebSocket configurée');
      return;
    }

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
    return wsService.send(data);
  }, []);

  const subscribe = useCallback((event, callback) => {
    return wsService.on(event, callback);
  }, []);

  // Initialisation unique
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Listeners de connexion
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

    // État initial
    setIsConnected(wsService.isConnected());
    setConnectionState(wsService.getState());

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubError();
      unsubMessage();
    };
  }, []);

  // Auto-connexion quand authentifié
  useEffect(() => {
    if (autoConnect && token && url && !wsService.isConnected() && !wsService.isConnecting) {
      console.log('🔌 Auto-connexion WebSocket...');
      connect();
    }
  }, [autoConnect, token, url, connect]);

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