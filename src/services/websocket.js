import { showOrderNotification } from '../components/notifications/OrderNotification';
import { emitDashboardRefresh } from '../utils/dashboardEvents';

/**
 * Service WebSocket pour les notifications en temps réel
 */
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.url = null;
  }

  /**
   * Se connecter au serveur WebSocket
   * @param {string} url - URL du serveur WebSocket
   * @param {object} options - Options de connexion
   */
  connect(url, options = {}) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log(' WebSocket déjà connecté ou en cours de connexion');
      return;
    }

    this.isConnecting = true;
    this.url = url;

    try {
      console.log('🔌 Tentative de connexion WebSocket à:', url);
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connecté avec succès');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');

        // Authentification si nécessaire
        if (options.token) {
          this.send({
            type: 'auth',
            token: options.token,
            userId: options.userId,
            restaurantId: options.restaurantId,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error(' Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(' Erreur WebSocket:', error);
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket fermé:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected', event);
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };

    } catch (error) {
      console.error(' Erreur lors de la création de la connexion WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Gérer les messages reçus
   * @param {object} data - Données du message
   */
  handleMessage(data) {
    const { type, order, orderId, newStatus, oldStatus, restaurantId, restaurantName } = data;

    console.log('📨 Message WebSocket reçu:', type, data);

    // Émettre l'événement aux listeners
    this.emit('message', data);
    this.emit(type, data);

    // Traiter selon le type de message
    switch (type) {
      case 'new_order':
        this.handleNewOrder(data);
        break;

      case 'order_status_updated':
      case 'status_update':
        this.handleStatusUpdate(data);
        break;

      case 'order_created':
        this.handleOrderCreated(data);
        break;

      case 'order_deleted':
        this.handleOrderDeleted(data);
        break;

      case 'payment_status_updated':
        this.handlePaymentUpdate(data);
        break;

      case 'pong':
        // Réponse au heartbeat
        break;

      default:
        console.log('Type de message WebSocket inconnu:', type);
    }
  }

  /**
   * Gérer une nouvelle commande
   */
  handleNewOrder(data) {
    const { order } = data;
    
    if (!order) return;

    const orderData = {
      orderNumber: order.id || order._id || order.orderNumber,
      restaurant: order.restaurantName || order.restaurant?.name,
      items: order.items || [],
      total: order.total || order.totalAmount,
      status: order.status || 'pending',
    };

    showOrderNotification.newOrder(orderData);

    emitDashboardRefresh({
      reason: 'new_order_ws',
      orderId: orderData.orderNumber,
      restaurantId: data.restaurantId,
    });
  }

  /**
   * Gérer un changement de statut
   */
  handleStatusUpdate(data) {
    const { order, orderId, newStatus, restaurantId, restaurantName } = data;

    const orderData = {
      orderNumber: orderId || order?.id || order?._id,
      restaurant: restaurantName || order?.restaurantName,
      items: order?.items || [],
      total: order?.total || order?.totalAmount,
      status: newStatus,
    };

    // Mapper le statut à la fonction de notification appropriée
    const statusLower = String(newStatus || '').toLowerCase();
    
    const notificationMap = {
      'confirmed': showOrderNotification.confirmed,
      'confirmee': showOrderNotification.confirmed,
      'preparing': showOrderNotification.preparing,
      'en_preparation': showOrderNotification.preparing,
      'ready': showOrderNotification.ready,
      'prete': showOrderNotification.ready,
      'delivered': showOrderNotification.delivered,
      'livree': showOrderNotification.delivered,
      'cancelled': showOrderNotification.cancelled,
      'annulee': showOrderNotification.cancelled,
    };

    const notifyFn = notificationMap[statusLower];
    if (notifyFn) {
      notifyFn(orderData);
    } else {
      showOrderNotification.info(`Statut mis à jour : ${newStatus}`);
    }

    emitDashboardRefresh({
      reason: 'order_status_updated_ws',
      orderId: orderData.orderNumber,
      status: newStatus,
      restaurantId,
    });
  }

  /**
   * Gérer une commande créée
   */
  handleOrderCreated(data) {
    showOrderNotification.success('Nouvelle commande créée');
    
    emitDashboardRefresh({
      reason: 'order_created_ws',
      orderId: data.orderId,
      restaurantId: data.restaurantId,
    });
  }

  /**
   * Gérer une commande supprimée
   */
  handleOrderDeleted(data) {
    showOrderNotification.info(`Commande #${data.orderId} supprimée`);
    
    emitDashboardRefresh({
      reason: 'order_deleted_ws',
      orderId: data.orderId,
      restaurantId: data.restaurantId,
    });
  }

  /**
   * Gérer une mise à jour de paiement
   */
  handlePaymentUpdate(data) {
    showOrderNotification.success(`Paiement mis à jour : ${data.newStatus}`);
    
    emitDashboardRefresh({
      reason: 'payment_updated_ws',
      orderId: data.orderId,
      paymentStatus: data.newStatus,
      restaurantId: data.restaurantId,
    });
  }

  /**
   * Envoyer un message au serveur
   * @param {object} data - Données à envoyer
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(' Erreur lors de l\'envoi du message:', error);
      }
    } else {
      console.warn(' WebSocket non connecté, impossible d\'envoyer le message');
    }
  }

  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement
   * @param {function} callback - Fonction de rappel
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner une fonction pour se désabonner
    return () => this.off(event, callback);
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {function} callback - Fonction de rappel
   */
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

  /**
   * Émettre un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(` Erreur dans le listener ${event}:`, error);
      }
    });
  }

  /**
   * Démarrer le heartbeat
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * Arrêter le heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Reconnecter au serveur
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(' Nombre maximum de tentatives de reconnexion atteint');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(` Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms...`);

    setTimeout(() => {
      if (this.url) {
        this.connect(this.url);
      }
    }, delay);
  }

  /**
   * Déconnecter le WebSocket
   */
  disconnect() {
    console.log('🔌 Déconnexion WebSocket...');
    
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts; // Empêcher la reconnexion
    
    if (this.ws) {
      this.ws.close(1000, 'Déconnexion manuelle');
      this.ws = null;
    }

    this.listeners.clear();
    this.isConnecting = false;
  }

  /**
   * Vérifier si le WebSocket est connecté
   * @returns {boolean}
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Obtenir l'état de la connexion
   * @returns {string}
   */
  getState() {
    if (!this.ws) return 'CLOSED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Export d'une instance singleton
export const wsService = new WebSocketService();

export default wsService;