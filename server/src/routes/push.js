import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import PushSubscription from '../models/PushSubscription.js';
import { getVapidPublicKey } from '../config/vapid.js';

const router = Router();

// Public — client needs the VAPID key before the user is authenticated
router.get('/vapid-key', (_req, res) => {
  const key = getVapidPublicKey();
  if (!key) return res.status(503).json({ error: 'Web Push not configured' });
  res.json({ publicKey: key });
});

// ── Public re-subscribe endpoint ──────────────────────────────────────────
// Called by the service worker's pushsubscriptionchange handler which
// runs without auth context. Matches old endpoint → updates to new one,
// preserving the user association.
router.post('/resubscribe', async (req, res, next) => {
  try {
    const { oldEndpoint, endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    if (oldEndpoint) {
      // Find the old subscription to get the user, then replace it
      const old = await PushSubscription.findOne({ endpoint: oldEndpoint });
      if (old) {
        await PushSubscription.findOneAndUpdate(
          { endpoint },
          { user: old.user, endpoint, keys },
          { upsert: true, new: true },
        );
        await PushSubscription.deleteOne({ _id: old._id });
        return res.json({ ok: true });
      }
    }

    // No old subscription found — can't associate with a user without auth
    return res.status(200).json({ ok: false, reason: 'no_old_subscription' });
  } catch (err) {
    next(err);
  }
});

// Protected — save / remove push subscriptions
router.use(protect);

router.post('/subscribe', async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { user: req.user._id, endpoint, keys },
      { upsert: true, new: true },
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

    await PushSubscription.deleteOne({ endpoint, user: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
