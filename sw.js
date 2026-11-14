const CACHE = "kul-v2";
const SHELL = ["./", "index.html", "firebase-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "logo.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Firestore/Auth traffic is handled by the SDK itself
  if (/googleapis\.com$/.test(u.hostname) && !/fonts/.test(u.hostname)) return;
  const cacheable = u.origin === location.origin || u.hostname === "www.gstatic.com" || /fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (!cacheable) return;
  // network first (so updates show up), cache fallback when offline
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
