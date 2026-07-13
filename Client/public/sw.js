const CACHE_NAME = 'samir-portfolio-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Bypass service worker for non-http/https requests (like chrome-extension)
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Bypass caching for API routes, admin dashboard, and main page document loads
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    event.request.mode === 'navigate' ||
    event.request.headers.get('accept')?.includes('text/html')
  ) {
    return
  }

  // For static assets (JS, CSS, images, fonts), use Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok && event.request.method === 'GET') {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})