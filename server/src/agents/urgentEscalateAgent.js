/**
 * Urgent Escalate Agent
 * Runs every 30 minutes.
 * Finds "high" priority reminders due within the next hour and upgrades them to "urgent"
 * so they surface at the top of the user's list automatically.
 */
import Reminder from '../models/Reminder.js';

export const urgentEscalateAgent = {
  name: 'UrgentEscalateAgent',
  intervalMs: 30 * 60 * 1000, // 30 minutes

  async run() {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const result = await Reminder.updateMany(
      {
        priority: 'high',
        isCompleted: false,
        remindAt: { $gte: now, $lte: inOneHour },
      },
      { $set: { priority: 'urgent' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[UrgentEscalateAgent] Escalated ${result.modifiedCount} high-priority reminders to urgent.`);
    }
  },
};
