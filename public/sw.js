// public/sw.js

self.addEventListener('push', function(event) {
  console.log('[SW] Push reçu:', event);

  let data = {
    title: 'Nouvelle commande !',
    body: 'Une nouvelle commande a été passée',
    icon: '/logo192.jpg',
    badge: '/logo192.jpg',
    tag: 'order-notification',
    data: {}
  };

  try {
    if (event.data) {
      const payload = event.data.json();

      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: payload.data || data.data
      };
    }
  } catch (e) {
    console.log('[SW] Erreur parsing:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: data.data,
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


// CLICK SUR NOTIFICATION
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification cliquée:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {

        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];

          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow('/restaurant/orders');
        }
      })
  );
});


// INSTALLATION
self.addEventListener('install', function(event) {
  console.log('[SW] Installation...');
  self.skipWaiting();
});


// ACTIVATION
self.addEventListener('activate', function(event) {
  console.log('[SW] Activation...');
  event.waitUntil(clients.claim());
});