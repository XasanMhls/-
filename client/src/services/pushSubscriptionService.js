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

    // 2. Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // Still send to server in case it was lost (e.g. new account)
      await sendSubscriptionToServer(subscription);
      return subscription;
    }

    // 3. Fetch VAPID public key
    const { data } = await api.get('/push/vapid-key');
    if (!data.publicKey) {
      console.warn('[Push] Server has no VAPID key');
      return null;
    }

    // 4. Subscribe
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
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

// ── Helpers ────────────────────────────────────────────────────────────────

async function sendSubscriptionToServer(subscription) {
  const raw = subscription.toJSON();
  await api.post('/push/subscribe', {
    endpoint: raw.endpoint,
    keys: raw.keys,
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
