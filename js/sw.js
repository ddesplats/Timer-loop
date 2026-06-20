/*******************************************************
 * FILE: js/sw.js
 * Service Worker pour la gestion offline et les notficiations
 *******************************************************/
const CACHE_NAME = 'timers-cache-v1';
           
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  e.respondWith(
   caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil(
   clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
     for (let i = 0; i < windowClients.length; i++) {
       let client = windowClients[i];
       if (client.url && 'focus' in client) return client.focus();
     }
     if (clients.openWindow) return clients.openWindow('/');
   })
 );
});
