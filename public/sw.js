// Kill-switch: an old version of the site registered a cache-first service worker
// that could serve a stale homepage forever. This replaces it, clears its caches,
// and unregisters itself. Nothing in the app registers a service worker anymore.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
