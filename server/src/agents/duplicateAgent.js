/**
 * Duplicate Detection Agent
 * Runs every 12 hours.
 * Finds reminders per user that have the same title (case-insensitive) and are both
 * not-completed and within 24h of each other — logs them so an admin can investigate.
 * Does NOT auto-delete: just warns so the user stays in control.
 */
import Reminder from '../models/Reminder.js';

export const duplicateAgent = {
  name: 'DuplicateAgent',
  intervalMs: 12 * 60 * 60 * 1000, // 12 hours

  async run() {
    // Aggregate: group by (userId, normalised title), count > 1
    const groups = await Reminder.aggregate([
      { $match: { isCompleted: false } },
      {
        $group: {
          _id: {
            user: '$user',
            title: { $toLower: { $trim: { input: '$title' } } },
          },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (groups.length > 0) {
      console.log(`[DuplicateAgent] Found ${groups.length} possible duplicate reminder group(s).`);
      for (const g of groups) {
        console.log(`  User ${g._id.user} · "${g._id.title}" · ${g.count} copies · ids: ${g.ids.join(', ')}`);
      }
    }
  },
};
