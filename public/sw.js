// Minimaler Service Worker: cached ausschließlich statische App-Shell-Assets
// (Icons, Manifest) für ein zuverlässiges Icon/Branding auch bei wackliger
// Verbindung. Bewusst KEIN Caching von Seiten oder API-Antworten, damit nie
// veraltete Kampagnen-/Post-Daten angezeigt werden.
const CACHE_NAME = "mirra-shell-v1";
const SHELL_ASSETS = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !SHELL_ASSETS.includes(url.pathname)) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
