import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

/**
 * Send a Web Push notification to all devices of a user.
 * Automatically removes expired/invalid subscriptions (410/404).
 */
export async function sendPushToUser(userId, payload) {
  const subscriptions = await PushSubscription.find({ user: userId }).lean();
  if (!subscriptions.length) {
    console.warn(`[WebPush] No push subscriptions for user ${userId} — notification not sent`);
    return;
  }
  console.log(`[WebPush] Sending to ${subscriptions.length} device(s) for user ${userId}`);

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload),
        {
          TTL: 86400,          // deliver within 24h
          urgency: 'high',     // wake device from Doze / battery saver
          topic: payload.reminderId || 'chronos-reminder',
        },
      )
    )
  );

  // Log results and clean up dead subscriptions
  const toDelete = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      console.log(`[WebPush] ✓ Delivered to ${subscriptions[i].endpoint.slice(0, 60)}…`);
    } else {
      const code = results[i].reason?.statusCode;
      const msg = results[i].reason?.body || results[i].reason?.message || 'unknown';
      console.error(`[WebPush] ✗ Failed (${code}): ${msg}`);
      if (code === 410 || code === 404) {
        toDelete.push(subscriptions[i]._id);
      }
    }
  }
  if (toDelete.length) {
    await PushSubscription.deleteMany({ _id: { $in: toDelete } });
  }
}
