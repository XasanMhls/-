/**
 * Stale Reminder Agent
 * Runs every 6 hours.
 * Finds non-repeating reminders overdue by more than 7 days and auto-completes them
 * so they don't clutter active views forever.
 */
import Reminder from '../models/Reminder.js';

export const staleAgent = {
  name: 'StaleAgent',
  intervalMs: 6 * 60 * 60 * 1000, // 6 hours

  async run() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await Reminder.updateMany(
      {
        isCompleted: false,
        repeat: 'none',
        remindAt: { $lt: cutoff },
        snoozeUntil: null,
      },
      {
        $set: { isCompleted: true },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[StaleAgent] Auto-completed ${result.modifiedCount} stale overdue reminders.`);
    }
  },
};
