// English Zone 코칭 트래커 — 서비스 워커
const CACHE_VERSION = 'ez-v7-2026-04-15';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

// 설치: 핵심 자원 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 처리: 네트워크 우선 (최신 내용 보장), 실패 시 캐시
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // GET 요청만 처리
  if (req.method !== 'GET') return;
  // 외부 API (Anthropic 등)는 캐시하지 않음
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        // 성공 응답은 캐시에 업데이트
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
