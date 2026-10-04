const CACHE = 'simon-v138';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon.svg', './si.mp3', './PressStart2P.woff2', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', ev => {
  ev.respondWith(caches.match(ev.request, { ignoreSearch: true }).then(async r => {
    if (!r) return fetch(ev.request);
    // Los navegadores piden el audio por rangos (Range); respondemos 206 desde el caché
    const rango = ev.request.headers.get('range');
    if (!rango) return r;
    const buf = await r.arrayBuffer();
    const m = /bytes=(\d*)-(\d*)/.exec(rango);
    const ini = m && m[1] ? parseInt(m[1], 10) : 0;
    const fin = m && m[2] ? Math.min(parseInt(m[2], 10), buf.byteLength - 1) : buf.byteLength - 1;
    return new Response(buf.slice(ini, fin + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': r.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Range': `bytes ${ini}-${fin}/${buf.byteLength}`,
        'Content-Length': String(fin - ini + 1)
      }
    });
  }));
});
