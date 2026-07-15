const CACHE = '90-plus-v6-premium-tournament-3';
const SHELL = [
  './', './index.html', './styles.css', './manifest.json',
  './js/core.js', './js/player-store.js', './js/modules/settings.js',
  './js/modules/ui-shell.js', './js/modules/tournament.js', './js/modules/squad-builder.js', './js/audio.js', './js/app.js',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/fonts/Nippo-Regular.ttf', './assets/fonts/Nippo-Medium.ttf', './assets/fonts/Nippo-Bold.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/socket.io/')) return;
  if (url.pathname.includes('/assets/audio/')) return;
  if (url.pathname.endsWith('/data/players.json')) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request).then(response => { if (response.ok) cache.put(event.request, response.clone()); return response; }).catch(() => cached);
      return cached || network;
    }));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
