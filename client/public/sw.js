const CACHE_NAME = 'chronos-v3';
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
//
// CRITICAL: Chrome REQUIRES every push event to show a visible notification.
// If we don't, Chrome will show a generic fallback and may revoke the
// push subscription entirely. Always show a notification, even on error.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    try {
      data = { title: 'Chronos', body: event.data ? event.data.text() : '' };
    } catch {
      data = {};
    }
  }

  const title = data.title || 'Напоминание';
  const options = {
    body:    data.body || 'Время пришло!',
    icon:    '/favicon.svg',
    badge:   '/favicon.svg',
    tag:     data.reminderId || 'chronos-reminder',
    renotify: true,                              // re-alert even if same tag
    requireInteraction: true,                     // stay until dismissed
    silent:  false,                               // force sound/vibration on Android
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
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ── Push subscription change ──────────────────────────────────────────────
// Fired when the push subscription expires or is invalidated by the browser.
// Re-subscribe automatically so the user never misses a notification.

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const oldSub = event.oldSubscription;
        const newSub = await self.registration.pushManager.subscribe(
          oldSub ? { userVisibleOnly: true, applicationServerKey: oldSub.options.applicationServerKey }
                 : { userVisibleOnly: true }
        );

        // Send new subscription to backend (public endpoint, no auth needed)
        const raw = newSub.toJSON();
        await fetch('/api/push/resubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldEndpoint: oldSub ? oldSub.endpoint : null,
            endpoint: raw.endpoint,
            keys: raw.keys,
          }),
        });
      } catch (err) {
        console.error('[SW] pushsubscriptionchange re-subscribe failed:', err);
      }
    })()
  );
});
