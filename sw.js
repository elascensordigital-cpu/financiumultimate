/* Financium Service Worker - GitHub Pages friendly */
const CACHE_VERSION = "financium-v1.0.0";
const APP_SHELL_CACHE = CACHE_VERSION;

// Ajusta aquí si cambias el nombre del repo
const BASE_PATH = "/Financium";

// Archivos base (app shell)
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/sw.js`,

  // Iconos PWA
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-192-maskable.png`,
  `${BASE_PATH}/icon-512.png`,
  `${BASE_PATH}/icon-512-maskable.png`,

  // Imágenes de tu app (si existen)
  `${BASE_PATH}/cabecera.png`,
  `${BASE_PATH}/presente.png`,
  `${BASE_PATH}/archivo.png`,
  `${BASE_PATH}/prevision.png`,
  `${BASE_PATH}/ahorro.png`,
  `${BASE_PATH}/deudas.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== APP_SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Solo controlamos nuestra propia origin
  if (url.origin !== self.location.origin) return;

  // Navegación (cuando entras a /Financium/ o refrescas dentro de la app)
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(req);
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put(`${BASE_PATH}/index.html`, network.clone());
          return network;
        } catch (e) {
          const cached = await caches.match(`${BASE_PATH}/index.html`);
          return cached || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Para el resto: cache-first con actualización en segundo plano
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(APP_SHELL_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return new Response("", { status: 504 });
      }
    })()
  );
});
