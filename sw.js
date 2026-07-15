const CACHE = '90-plus-v4-stadium-edition-1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.json',
  './js/core.js', './js/players.js', './js/audio.js', './js/app.js',
  './assets/icon-192.png', './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/socket.io/')) return;
  // Ses ve fontlar sonradan eklenebilir. Eksik dosyanın 404 cevabını önbelleğe alma.
  if (url.pathname.includes('/assets/audio/') || url.pathname.includes('/assets/fonts/')) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
