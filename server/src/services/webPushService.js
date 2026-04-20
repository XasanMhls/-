import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

/**
 * Send a Web Push notification to all devices of a user.
 * Automatically removes expired/invalid subscriptions (410/404).
 */
export async function sendPushToUser(userId, payload) {
  const subscriptions = await PushSubscription.find({ user: userId }).lean();
  if (!subscriptions.length) return;

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload),
        { TTL: 86400 }, // deliver within 24h
      )
    )
  );

  // Clean up dead subscriptions
  const toDelete = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      const code = results[i].reason?.statusCode;
      if (code === 410 || code === 404) {
        toDelete.push(subscriptions[i]._id);
      }
    }
  }
  if (toDelete.length) {
    await PushSubscription.deleteMany({ _id: { $in: toDelete } });
  }
}
