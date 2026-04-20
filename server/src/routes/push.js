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
