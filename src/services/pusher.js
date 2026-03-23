// src/services/pusher.js
import Pusher from 'pusher-js';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.eventHandlers = new Map();
    this.isInitialized = false;
    this.connectionListeners = [];
  }

  init(options = {}) {
    // Si déjà initialisé, retourner l'instance existante
    if (this.isInitialized && this.pusher) {
     (' Pusher déjà initialisé, réutilisation...');
      return this.pusher;
    }

    const key = options.key || import.meta.env.VITE_PUSHER_KEY;
    const cluster = options.cluster || import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

    if (!key) {
      console.warn(' VITE_PUSHER_KEY non configuré - Pusher désactivé');
      return null;
    }

    try {
     (' Initialisation Pusher...', { cluster });

      // Activer les logs en développement
      if (import.meta.env.DEV) {
        Pusher.logToConsole = true;
      }

      this.pusher = new Pusher(key, {
        cluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });

      // Gestion des événements de connexion
      this.pusher.connection.bind('connected', () => {
       (' Pusher CONNECTÉ - Socket ID:', this.pusher.connection.socket_id);
        this.isInitialized = true;
        this._notifyConnectionListeners('connected');
      });

      this.pusher.connection.bind('disconnected', () => {
       (' Pusher DÉCONNECTÉ');
        this._notifyConnectionListeners('disconnected');
      });

      this.pusher.connection.bind('connecting', () => {
       (' Pusher connexion en cours...');
      });

      this.pusher.connection.bind('error', (err) => {
        console.error('Pusher ERREUR:', err);
        this._notifyConnectionListeners('error', err);
      });

      this.pusher.connection.bind('state_change', (states) => {
       (` Pusher: ${states.previous} → ${states.current}`);
      });

      return this.pusher;

    } catch (error) {
      console.error(' Erreur initialisation Pusher:', error);
      return null;
    }
  }

  _notifyConnectionListeners(event, data = null) {
    this.connectionListeners.forEach(({ event: e, callback }) => {
      if (e === event) callback(data);
    });
  }

  onConnectionChange(event, callback) {
    this.connectionListeners.push({ event, callback });
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
     (`Channel "${channelName}" déjà abonné`);
      return this.channels.get(channelName);
    }

   (`Abonnement au channel: ${channelName}`);
    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);

    channel.bind('pusher:subscription_succeeded', () => {
     (`Abonné à "${channelName}"`);
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error(` Erreur abonnement "${channelName}":`, error);
    });

    return channel;
  }

  unsubscribe(channelName) {
    if (!this.pusher || !this.channels.has(channelName)) return;

   (` Désabonnement: ${channelName}`);
    this.pusher.unsubscribe(channelName);
    this.channels.delete(channelName);
    this.eventHandlers.delete(channelName);
  }

  on(channelName, eventName, callback) {
    const channel = this.subscribe(channelName);
    if (!channel) return () => {};

   (`Écoute "${eventName}" sur "${channelName}"`);
    
    // Stocker le handler pour le cleanup
    const key = `${channelName}:${eventName}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, []);
    }
    this.eventHandlers.get(key).push(callback);

    channel.bind(eventName, callback);

    return () => {
     (` Arrêt écoute "${eventName}" sur "${channelName}"`);
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
     ('Déconnexion Pusher...');
      this.channels.forEach((_, name) => this.pusher.unsubscribe(name));
      this.channels.clear();
      this.eventHandlers.clear();
      this.pusher.disconnect();
      this.pusher = null;
      this.isInitialized = false;
    }
  }

  isConnected() {
    return this.pusher?.connection?.state === 'connected';
  }

  getState() {
    return this.pusher?.connection?.state || 'disconnected';
  }

  getSocketId() {
    return this.pusher?.connection?.socket_id || null;
  }
}

// Export singleton
export const pusherService = new PusherService();
export default pusherService;