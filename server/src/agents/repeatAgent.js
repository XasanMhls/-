/**
 * Repeat Agent
 * Runs every 15 minutes.
 * For repeating reminders (daily/weekly/monthly) that are past-due and not completed,
 * advances the remindAt to the next occurrence so they stay relevant.
 */
import Reminder from '../models/Reminder.js';

const ADVANCE_MAP = {
  daily:   24 * 60 * 60 * 1000,
  weekly:  7  * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

export const repeatAgent = {
  name: 'RepeatAgent',
  intervalMs: 15 * 60 * 1000, // 15 minutes

  async run() {
    const now = new Date();
    const stale = await Reminder.find({
      isCompleted: false,
      repeat: { $in: ['daily', 'weekly', 'monthly'] },
      remindAt: { $lt: now },
    });

    let advanced = 0;
    for (const r of stale) {
      const step = ADVANCE_MAP[r.repeat];
      let next = new Date(r.remindAt.getTime());
      // Advance until next is in the future
      while (next < now) next = new Date(next.getTime() + step);
      r.remindAt = next;
      r.lastTriggeredAt = now;
      await r.save();
      advanced++;
    }

    if (advanced > 0) {
      console.log(`[RepeatAgent] Advanced ${advanced} repeating reminders to next occurrence.`);
    }
  },
};
