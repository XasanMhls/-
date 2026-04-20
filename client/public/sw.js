const CACHE_NAME = 'chronos-v2';
const STATIC_ASSETS = ['/', '/index.html'];

// ── Install / Activate ────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch (cache-first for static, network-only for API) ──────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── Web Push ──────────────────────────────────────────────────────────────
// Server sends push via web-push library when a reminder is due.
// This fires even when the browser tab is closed and the phone screen is off.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'Chronos', body: event.data.text() }; }

  const title = data.title || 'Напоминание';
  const options = {
    body:    data.body || 'Время пришло!',
    icon:    '/favicon.svg',
    badge:   '/favicon.svg',
    tag:     data.reminderId || 'chronos-reminder',
    renotify: true,                              // re-alert even if same tag
    requireInteraction: true,                     // stay until dismissed
    vibrate: [300, 100, 300, 100, 300],           // strong vibration pattern
    data:    { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'dismiss', title: 'Закрыть' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If there's already an open tab, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
