import webpush from 'web-push';

let initialized = false;

export function initWebPush() {
  if (initialized) return;
  const publicKey  = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject    = process.env.VAPID_SUBJECT || 'mailto:admin@chronos.app';

  if (!publicKey || !privateKey) {
    console.warn('[VAPID] Keys not set — Web Push disabled. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.');
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
  console.log('[VAPID] Web Push initialized.');
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}
