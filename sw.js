// 줄담배 서비스워커 — 앱 셸 캐시
const CACHE = 'quit-smoking-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Dropbox 등 외부 API 는 캐시하지 않음
  if (url.origin !== location.origin) return;
  // HTML 은 네트워크 우선, 실패 시 캐시
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // 그 외 정적 자산은 캐시 우선
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
