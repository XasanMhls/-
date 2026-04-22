import api from './api.js';

/**
 * Subscribe the browser to Web Push notifications.
 *
 * Flow:
 *  1. Register the service worker (if not already).
 *  2. Fetch the VAPID public key from the server.
 *  3. Call pushManager.subscribe() — browser shows a "Allow notifications?" prompt.
 *  4. Send the resulting subscription to POST /api/push/subscribe so the
 *     server can push to this device later.
 *
 * Safe to call multiple times — duplicate subscriptions are upserted.
 */
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported in this browser');
    return null;
  }

  try {
    // 1. Get SW registration
    const registration = await navigator.serviceWorker.ready;

    // 2. Fetch VAPID public key
    const { data } = await api.get('/push/vapid-key');
    if (!data.publicKey) {
      console.warn('[Push] Server has no VAPID key');
      return null;
    }

    const appServerKey = urlBase64ToUint8Array(data.publicKey);

    // 3. Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Validate that the subscription is still alive — if the endpoint
      // changed or the key rotated, unsubscribe and re-create.
      const isValid = await validateSubscription(subscription);
      if (isValid) {
        await sendSubscriptionToServer(subscription);
        return subscription;
      }
      // Stale — unsubscribe and fall through to create a new one
      try { await subscription.unsubscribe(); } catch { /* ignore */ }
      subscription = null;
    }

    // 4. Subscribe
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });

    // 5. Send to server
    await sendSubscriptionToServer(subscription);
    console.log('[Push] Subscribed successfully');
    return subscription;
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    return null;
  }
}

export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
  } catch (err) {
    console.error('[Push] Unsubscribe failed:', err);
  }
}

/**
 * Re-subscribe if subscription expired or is missing.
 * Call this on every app focus / visibility change.
 */
export async function ensurePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscription gone (expired, cleared) — re-create
      await subscribeToPush();
    } else {
      // Still exists — sync with server
      await sendSubscriptionToServer(subscription);
    }
  } catch {
    // Ignore — will retry on next visibility change
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function sendSubscriptionToServer(subscription) {
  const raw = subscription.toJSON();
  await api.post('/push/subscribe', {
    endpoint: raw.endpoint,
    keys: raw.keys,
  });
}

async function validateSubscription(subscription) {
  try {
    // If expirationTime is set and in the past, subscription is dead
    if (subscription.expirationTime && subscription.expirationTime < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
