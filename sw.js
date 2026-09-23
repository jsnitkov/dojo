/* Dojo service worker: makes the home-screen app launch and run with no network.
   - App shell (html/css/js/manifest/icons): network-first, falling back to cache,
     so a deploy shows up on the next online launch.
   - Exercise photos and Google Fonts: cache-first (they rarely change).
   Bump CACHE when a photo is replaced under the same file name. */
const CACHE = "dojo-v1";
importScripts("js/program.js"); // provides IMAGES (DOM-free)

const SHELL = ["./", "index.html", "styles.css", "js/program.js", "js/app.js",
  "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon.svg"];
const PHOTOS = [...new Set(Object.values(IMAGES).flat())];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...SHELL, ...PHOTOS])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const cacheFirst = url.pathname.includes("/img/") ||
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (cacheFirst) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === "navigate" ? caches.match("index.html") : undefined))));
  }
});
