/**
 * Stats Agent
 * Runs every hour.
 * Logs a platform health snapshot: total users, active reminders, overdue count.
 * Easy to extend to store stats in a dedicated DB collection later.
 */
import User from '../models/User.js';
import Reminder from '../models/Reminder.js';

export const statsAgent = {
  name: 'StatsAgent',
  intervalMs: 60 * 60 * 1000, // 1 hour

  async run() {
    const now = new Date();
    const [users, total, overdue, completed, repeating] = await Promise.all([
      User.countDocuments(),
      Reminder.countDocuments(),
      Reminder.countDocuments({ isCompleted: false, remindAt: { $lt: now } }),
      Reminder.countDocuments({ isCompleted: true }),
      Reminder.countDocuments({ repeat: { $ne: 'none' }, isCompleted: false }),
    ]);

    console.log(
      `[StatsAgent] users=${users} | reminders=${total} | active=${total - completed} | overdue=${overdue} | repeating=${repeating}`
    );
  },
};
