/* Service Worker - Financium Ultimate */
const CACHE_NAME = "financiumultimate-v1";
const BASE_PATH = "/financiumultimate";

const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/sw.js`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`,

  // Imágenes de la app (si existen)
  `${BASE_PATH}/cabecera.png`,
  `${BASE_PATH}/presente.png`,
  `${BASE_PATH}/archivo.png`,
  `${BASE_PATH}/prevision.png`,
  `${BASE_PATH}/ahorro.png`,
  `${BASE_PATH}/deudas.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(event.request);
          return network;
        } catch {
          return caches.match(`${BASE_PATH}/index.html`);
        }
      })()
    );
    return;
  }

  // Recursos estáticos
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
