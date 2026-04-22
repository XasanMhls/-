import Reminder from '../models/Reminder.js';
import { sendPushToUser } from './webPushService.js';

const POLL_MS        = 20_000;   // check every 20 s (more responsive)
const WINDOW_MS      = 5 * 60_000; // 5-min window — catches reminders missed during brief downtime
const COOLDOWN_MS    = 90_000;   // don't re-push the same reminder within 90 s

// In-memory set: `reminderId:effectiveAt` → last push timestamp
const sent = new Map();

function cleanSent() {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [key, ts] of sent) {
    if (ts < cutoff) sent.delete(key);
  }
}

async function tick() {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    // Find non-completed reminders whose effective time is in [now-WINDOW, now]
    const reminders = await Reminder.find({
      isCompleted: false,
      $or: [
        // remindAt is due and no snooze
        { remindAt: { $gte: windowStart, $lte: now }, snoozeUntil: null },
        { remindAt: { $gte: windowStart, $lte: now }, snoozeUntil: { $lte: now } },
        // snoozeUntil is due
        { snoozeUntil: { $gte: windowStart, $lte: now } },
      ],
    }).lean();

    for (const r of reminders) {
      const effectiveAt = r.snoozeUntil
        ? new Date(r.snoozeUntil).getTime()
        : new Date(r.remindAt).getTime();

      const key = `${r._id}:${effectiveAt}`;
      const lastSent = sent.get(key);
      if (lastSent && Date.now() - lastSent < COOLDOWN_MS) continue;

      const body = [r.guestName, r.description].filter(Boolean).join(' — ') || 'Время пришло!';
      console.log(`[PushScheduler] Sending push for "${r.title}" (${r._id}) to user ${r.user}`);
      await sendPushToUser(r.user, {
        title: r.title,
        body,
        url: `/reminders/${r._id}`,
        reminderId: String(r._id),
      });

      sent.set(key, Date.now());
    }

    cleanSent();
  } catch (err) {
    console.error('[PushScheduler] tick error:', err.message);
  }
}

let timer = null;

export function startPushScheduler() {
  if (timer) return;
  console.log('[PushScheduler] Started — polling every 20 s');
  tick(); // run immediately
  timer = setInterval(tick, POLL_MS);
}

export function stopPushScheduler() {
  if (timer) { clearInterval(timer); timer = null; }
}
