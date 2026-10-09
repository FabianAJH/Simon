const CACHE = 'simon-v446';
const ARCHIVOS = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './engine.js',
  './items.js',
  './dialogos.js',
  './notificaciones.js',
  './minijuegos.js',
  './game.js',
  './manifest.json',
  './icon.svg',
  './si.mp3',
  './PressStart2P.woff2',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE).then(async c => {
      await Promise.all(
        ARCHIVOS.map(url =>
          c.add(url).catch(err => console.warn('[SW] No se pudo cachear:', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(async r => {
      if (r) return r;
      try {
        const netResp = await fetch(ev.request);
        return netResp;
      } catch (err) {
        if (ev.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
        }
        throw err;
      }
    })
  );
});
