import Reminder from '../models/Reminder.js';

const FILTER_PIPELINES = {
  all: {},
  today: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { remindAt: { $gte: start, $lte: end } };
  },
  tomorrow: () => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { remindAt: { $gte: start, $lte: end } };
  },
  overdue: () => ({
    remindAt: { $lt: new Date() },
    isCompleted: false,
    $or: [{ snoozeUntil: null }, { snoozeUntil: { $lt: new Date() } }],
  }),
  important: { priority: { $in: ['high', 'urgent'] } },
  completed: { isCompleted: true },
  repeating: { repeat: { $ne: 'none' } },
  pinned: { isPinned: true },
};

export async function getReminders(userId, { filter = 'all', search, sort = 'remindAt', page = 1, limit = 50 }) {
  const base = { user: userId };

  let filterQuery = {};
  if (typeof FILTER_PIPELINES[filter] === 'function') {
    filterQuery = FILTER_PIPELINES[filter]();
  } else if (FILTER_PIPELINES[filter] && filter !== 'all') {
    filterQuery = FILTER_PIPELINES[filter];
  }

  if (search) {
    filterQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { guestName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const query = { ...base, ...filterQuery };

  const sortMap = {
    remindAt: { remindAt: 1 },
    '-remindAt': { remindAt: -1 },
    priority: { priority: -1, remindAt: 1 },
    title: { title: 1 },
    created: { createdAt: -1 },
  };
  const sortQuery = sortMap[sort] || { remindAt: 1 };

  // Pinned always floats to top
  const finalSort = { isPinned: -1, ...sortQuery };

  const skip = (page - 1) * limit;
  const [reminders, total] = await Promise.all([
    Reminder.find(query).sort(finalSort).skip(skip).limit(Number(limit)),
    Reminder.countDocuments(query),
  ]);

  return {
    reminders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getReminderById(userId, reminderId) {
  const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
  if (!reminder) {
    const err = new Error('Reminder not found');
    err.statusCode = 404;
    throw err;
  }
  return reminder;
}

export async function createReminder(userId, data) {
  return Reminder.create({ ...data, user: userId });
}

export async function updateReminder(userId, reminderId, data) {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: reminderId, user: userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!reminder) {
    const err = new Error('Reminder not found');
    err.statusCode = 404;
    throw err;
  }
  return reminder;
}

export async function deleteReminder(userId, reminderId) {
  const reminder = await Reminder.findOneAndDelete({ _id: reminderId, user: userId });
  if (!reminder) {
    const err = new Error('Reminder not found');
    err.statusCode = 404;
    throw err;
  }
  return reminder;
}

export async function snoozeReminder(userId, reminderId, minutes) {
  const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
  return updateReminder(userId, reminderId, { snoozeUntil });
}

export async function recordTrigger(userId, reminderId) {
  const now = new Date();
  const reminder = await Reminder.findOneAndUpdate(
    { _id: reminderId, user: userId },
    {
      $set: { lastTriggeredAt: now },
      $push: { triggerHistory: { triggeredAt: now, method: 'scheduled' } },
    },
    { new: true }
  );
  if (!reminder) {
    const err = new Error('Reminder not found');
    err.statusCode = 404;
    throw err;
  }

  // Auto-advance repeating reminders
  if (reminder.repeat !== 'none' && !reminder.isCompleted) {
    let nextRemindAt = new Date(reminder.remindAt);
    switch (reminder.repeat) {
      case 'daily':
        nextRemindAt.setDate(nextRemindAt.getDate() + 1);
        break;
      case 'weekly':
        nextRemindAt.setDate(nextRemindAt.getDate() + 7);
        break;
      case 'monthly':
        nextRemindAt.setMonth(nextRemindAt.getMonth() + 1);
        break;
      case 'custom':
        if (reminder.repeatInterval) {
          nextRemindAt = new Date(Date.now() + reminder.repeatInterval * 60 * 1000);
        }
        break;
    }
    await Reminder.findByIdAndUpdate(reminderId, {
      $set: { remindAt: nextRemindAt, snoozeUntil: null },
    });
  }

  return reminder;
}

export async function getActiveReminders(userId) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 30 * 60 * 1000); // 30 min window for missed

  return Reminder.find({
    user: userId,
    isCompleted: false,
    remindAt: { $gte: windowStart, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
  }).sort({ remindAt: 1 });
}

export async function getDashboardStats(userId) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [total, today, upcoming, overdue, completed, byPriority] = await Promise.all([
    Reminder.countDocuments({ user: userId }),
    Reminder.countDocuments({ user: userId, remindAt: { $gte: todayStart, $lte: todayEnd }, isCompleted: false }),
    Reminder.countDocuments({ user: userId, remindAt: { $gte: now, $lte: weekEnd }, isCompleted: false }),
    Reminder.countDocuments({ user: userId, remindAt: { $lt: now }, isCompleted: false }),
    Reminder.countDocuments({ user: userId, isCompleted: true }),
    Reminder.aggregate([
      { $match: { user: userId, isCompleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
  ]);

  return { total, today, upcoming, overdue, completed, byPriority };
}

export async function bulkDeleteReminders(userId, ids) {
  const result = await Reminder.deleteMany({ _id: { $in: ids }, user: userId });
  return { deleted: result.deletedCount };
}

export async function exportReminders(userId) {
  return Reminder.find({ user: userId }).sort({ remindAt: 1 }).lean();
}

export async function importReminders(userId, reminders) {
  const docs = reminders.map(({ _id, id, user, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    user: userId,
  }));
  return Reminder.insertMany(docs, { ordered: false });
}
