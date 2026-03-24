// src/services/pusher.js
import Pusher from 'pusher-js';
import env from '../config/env';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.eventHandlers = new Map();
    this.isInitialized = false;
    this.connectionListeners = [];
    this._currentState = 'disconnected';
  }

  init(options = {}) {
    // Si déjà initialisé, retourner l'instance existante
    if (this.isInitialized && this.pusher) {
      console.log(' Pusher déjà initialisé, réutilisation...');
      return this.pusher;
    }

    const key = options.key || env.PUSHER_KEY;
    const cluster = options.cluster || env.PUSHER_CLUSTER || 'mt1';

    if (!key) {
      console.warn(' PUSHER_KEY non configuré - Pusher désactivé');
      return null;
    }

    try {
      console.log(' Initialisation Pusher...', { 
        key: key.substring(0, 8) + '...', 
        cluster 
      });

      // Activer les logs en développement
      if (env.IS_DEV || env.DEBUG) {
        Pusher.logToConsole = true;
      }

      this.pusher = new Pusher(key, {
        cluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });

      // Gestion des événements de connexion
      this.pusher.connection.bind('connected', () => {
        console.log(' Pusher CONNECTÉ - Socket ID:', this.pusher.connection.socket_id);
        this._currentState = 'connected';
        this.isInitialized = true;
        this._notifyConnectionListeners('connected');
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log(' Pusher DÉCONNECTÉ');
        this._currentState = 'disconnected';
        this._notifyConnectionListeners('disconnected');
      });

      this.pusher.connection.bind('connecting', () => {
        console.log(' Pusher connexion en cours...');
        this._currentState = 'connecting';
      });

      this.pusher.connection.bind('error', (err) => {
        console.error('Pusher ERREUR:', err);
        this._notifyConnectionListeners('error', err);
      });

      this.pusher.connection.bind('state_change', (states) => {
        console.log(` Pusher: ${states.previous} → ${states.current}`);
        this._currentState = states.current;
      });

      return this.pusher;

    } catch (error) {
      console.error(' Erreur initialisation Pusher:', error);
      return null;
    }
  }

  _notifyConnectionListeners(event, data = null) {
    console.log(`Notification listeners: ${event} (${this.connectionListeners.length} listeners)`);
    this.connectionListeners.forEach(({ event: e, callback }) => {
      if (e === event) {
        try {
          callback(data);
        } catch (err) {
          console.error('Erreur dans listener:', err);
        }
      }
    });
  }

  onConnectionChange(event, callback) {
    this.connectionListeners.push({ event, callback });
    
    // FIX : Si on demande 'connected' et qu'on EST DÉJÀ connecté,
    // appeler le callback immédiatement
    if (event === 'connected' && this.isConnected()) {
      console.log(' Pusher déjà connecté, notification immédiate');
      try {
        callback();
      } catch (err) {
        console.error('Erreur callback immédiat:', err);
      }
    }
    
    return () => {
      this.connectionListeners = this.connectionListeners.filter(
        l => !(l.event === event && l.callback === callback)
      );
    };
  }

  subscribe(channelName) {
    if (!this.pusher) {
      console.warn(' Pusher non initialisé');
      return null;
    }

    // Réutiliser le channel existant
    if (this.channels.has(channelName)) {
      console.log(` Channel "${channelName}" déjà abonné`);
      return this.channels.get(channelName);
    }

    console.log(` Abonnement au channel: ${channelName}`);
    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(` Abonné à "${channelName}"`);
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error(` Erreur abonnement "${channelName}":`, error);
    });

    return channel;
  }

  unsubscribe(channelName) {
    if (!this.pusher || !this.channels.has(channelName)) return;

    console.log(` Désabonnement: ${channelName}`);
    this.pusher.unsubscribe(channelName);
    this.channels.delete(channelName);
    this.eventHandlers.delete(channelName);
  }

  on(channelName, eventName, callback) {
    const channel = this.subscribe(channelName);
    if (!channel) return () => {};

    console.log(`Écoute "${eventName}" sur "${channelName}"`);
    
    // Stocker le handler pour le cleanup
    const key = `${channelName}:${eventName}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, []);
    }
    this.eventHandlers.get(key).push(callback);

    channel.bind(eventName, callback);

    return () => {
      console.log(` Arrêt écoute "${eventName}" sur "${channelName}"`);
      channel.unbind(eventName, callback);
      const handlers = this.eventHandlers.get(key) || [];
      const index = handlers.indexOf(callback);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  trigger(channelName, eventName, data) {
    const channel = this.channels.get(channelName);
    if (channel && channel.trigger) {
      channel.trigger(eventName, data);
    }
  }

  disconnect() {
    if (this.pusher) {
      console.log('Déconnexion Pusher...');
      this.channels.forEach((_, name) => this.pusher.unsubscribe(name));
      this.channels.clear();
      this.eventHandlers.clear();
      this.pusher.disconnect();
      this.pusher = null;
      this.isInitialized = false;
      this._currentState = 'disconnected';
    }
  }

  isConnected() {
    return this.pusher?.connection?.state === 'connected';
  }

  getState() {
    return this.pusher?.connection?.state || this._currentState || 'disconnected';
  }

  getSocketId() {
    return this.pusher?.connection?.socket_id || null;
  }
}

// Export singleton
export const pusherService = new PusherService();
export default pusherService;