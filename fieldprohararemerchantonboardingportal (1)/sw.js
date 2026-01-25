const CACHE_NAME = "fieldpro-v1"
const URLS_TO_CACHE = ["/", "/index.html", "/index.tsx", "/index.css"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log("[SW] Cache files not available")
      })
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const isNavigationRequest = request.mode === "navigate" || request.destination === "document"

  if (isNavigationRequest) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/index.html")
      }),
    )
    return
  }

  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        return response || fetch(request)
      })
      .catch(() => {
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain" },
        })
      }),
  )
})
