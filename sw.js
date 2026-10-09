// アプリ本体はキャッシュ優先、cards.txt はネット優先(オフライン時はキャッシュ)
const CACHE = 'tarjetas-v1';
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
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('cards.txt')){
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('cards.txt', copy));
        return r;
      }).catch(() => caches.match('cards.txt'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch:true }).then(hit => hit || fetch(e.request))
  );
});
