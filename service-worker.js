/**
 * Service worker — cache-first for app shell, network-first for everything
 * else. Bump CACHE to invalidate on deploy.
 */
const CACHE = 'cv-platform-v2';
const ASSETS = [
  './',
  './index.html',
  './cv-selector.html',
  './cv-builder.html',
  './cv-preview.html',
  './cv-cover-letter.html',
  './cv-ats-check.html',
  './cv-agent-securite-quebec.html',
  './css/templates.css',
  './js/storage.js',
  './js/cv-render.js',
  './js/ai.js',
  './js/docx-export.js',
  './js/ats.js',
  './js/analytics.js',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never intercept cross-origin (e.g. Anthropic API)

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => caches.match('./index.html'))
    )
  );
});
