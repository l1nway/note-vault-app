const STATIC_CACHE = 'app-shell-v1'
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

  if (request.url.includes('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const resClone = res.clone()
          caches.open(DATA_CACHE).then(cache => cache.put(request, resClone))
          return res
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            const headers = new Headers(cachedResponse.headers)
            headers.append('X-From-Cache', 'true')
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers
            })
          }
          return new Response('Offline', {status: 503})
        })
    )
    return
  }

  if (request.mode == 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .then(res => {
          const resClone = res.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', resClone))
          return res;
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status == 200) {
          const resClone = networkResponse.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, resClone))
        }
        return networkResponse
      }).catch(() => {})

      return cachedResponse || fetchPromise
    })
  )
})