const STATIC_CACHE = 'app-shell-v2'
const DATA_CACHE = 'data-v1'

const APP_SHELL = [
  '/',
  '/index.html'
]

self.addEventListener('install', event => {
  console.log('[SW] Install')
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL))
  )
})

self.addEventListener('activate', event => {
  console.log('[SW] Activate')
  const currentCaches = [STATIC_CACHE, DATA_CACHE]
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key)
          }
        })
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const {request} = event
  const url = new URL(request.url)

  if (!url.protocol.startsWith('http')) return

  if (url.pathname.includes('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const resClone = res.clone()
          caches.open(DATA_CACHE).then(cache => cache.put(request, resClone))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return new Response('Offline', {status: 503})
        })
    )
    return
  }

  if (request.mode == 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', clone))
          }
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok && networkResponse.status == 200) {
          const resClone = networkResponse.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, resClone))
          return networkResponse
        }
        return networkResponse
      }).catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})