// Offline cache for the MTH102 app. The whole app is one HTML file, so this is small.
// __BUILD__ is replaced at build time, so each new build gets a fresh cache and the old one is removed.
const CACHE = 'mth102-mwnjwm5b';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('mth102-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Pages: try the network first so updates arrive, fall back to the cache when offline.
// Everything else: cache first.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
