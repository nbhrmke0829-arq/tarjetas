// ネット優先・オフライン時はキャッシュ。これでアプリ本体の更新も自動で届く
const CACHE = 'tarjetas-v2';
const APP = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'cards.txt'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const key = url.pathname.endsWith('cards.txt') ? 'cards.txt' : e.request;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return r;
    }).catch(() => caches.match(key, { ignoreSearch:true }))
  );
});
