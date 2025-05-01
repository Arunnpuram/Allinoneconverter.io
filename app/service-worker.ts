/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = "allinoneconverter-io-v1"
const OFFLINE_URL = "/offline"
const APP_SHELL = ["/", "/offline", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache the offline page and app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      // Cache app shell resources
      await cache.addAll(APP_SHELL)
      console.log("App shell cached successfully")
    })(),
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Get all cache names
      const cacheNames = await caches.keys()
      // Remove caches that aren't the current one
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          }),
      )
      // Take control of all clients ASAP
      await self.clients.claim()
    })(),
  )
})

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)

      // Try to get the response from the cache first
      const cachedResponse = await cache.match(event.request)

      // Start the network fetch and cache update
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Don't cache responses that aren't successful
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch((error) => {
          console.log("Fetch failed; returning offline page instead.", error)

          // If the request is for a page, return the offline page
          if (event.request.mode === "navigate") {
            return cache.match(OFFLINE_URL)
          }

          // Otherwise just return a 404
          return new Response("Network error happened", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          })
        })

      // If we have a cached response, return it immediately
      // and update the cache in the background (stale-while-revalidate)
      return cachedResponse || fetchPromise
    })(),
  )
})

export {}
