/**
 * Cleanup Agent
 * Runs every 24 hours.
 * Deletes completed reminders older than 90 days to keep the database lean.
 */
import Reminder from '../models/Reminder.js';

export const cleanupAgent = {
  name: 'CleanupAgent',
  intervalMs: 24 * 60 * 60 * 1000, // 24 hours

  async run() {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await Reminder.deleteMany({
      isCompleted: true,
      updatedAt: { $lt: cutoff },
    });
    if (result.deletedCount > 0) {
      console.log(`[CleanupAgent] Deleted ${result.deletedCount} old completed reminders.`);
    }
  },
};
