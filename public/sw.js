const V = 'smart-tools-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
  await self.clients.claim();
})()));
const keep = (req, res) => {
  if (res && res.ok && !res.redirected) { const c = res.clone(); caches.open(V).then((x) => x.put(req, c)); }
  return res;
};
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => keep(r, res)).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => keep(r, res))));
});
