
/**
 * SGov FluxoSaúde - Service Worker
 * Gerencia notificações e cache básico para funcionamento PWA.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Listener para Notificações Push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'SGov FluxoSaúde', body: 'Nova atualização no sistema.' };
  
  const options = {
    body: data.body,
    icon: 'https://picsum.photos/seed/pwa1/192/192',
    badge: 'https://picsum.photos/seed/pwa1/192/192',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
