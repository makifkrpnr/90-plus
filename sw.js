const CACHE = '90-plus-v7-arena-1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.json',
  './js/core.js?v7', './js/players.js?v7', './js/audio.js?v7', './js/commentary.js?v7', './js/tournament.js?v7', './js/app.js?v7', './styles.css?v7',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/fonts/Nippo-Regular.ttf', './assets/fonts/Nippo-Medium.ttf', './assets/fonts/Nippo-Bold.ttf'
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
  if (url.pathname.includes('/assets/audio/')) return;
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
