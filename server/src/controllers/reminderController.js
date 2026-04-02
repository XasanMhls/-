import { validationResult } from 'express-validator';
import * as reminderService from '../services/reminderService.js';

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

export async function getReminders(req, res, next) {
  try {
    const { filter, search, sort, page, limit } = req.query;
    const result = await reminderService.getReminders(req.user._id, { filter, search, sort, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getActiveReminders(req, res, next) {
  try {
    const reminders = await reminderService.getActiveReminders(req.user._id);
    res.json({ reminders });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await reminderService.getDashboardStats(req.user._id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getReminderById(req, res, next) {
  try {
    const reminder = await reminderService.getReminderById(req.user._id, req.params.id);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
}

export async function createReminder(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const reminder = await reminderService.createReminder(req.user._id, req.body);
    res.status(201).json({ reminder });
  } catch (err) {
    next(err);
  }
}

export async function updateReminder(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const reminder = await reminderService.updateReminder(req.user._id, req.params.id, req.body);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
}

export async function deleteReminder(req, res, next) {
  try {
    await reminderService.deleteReminder(req.user._id, req.params.id);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    next(err);
  }
}

export async function snoozeReminder(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const { minutes = 10 } = req.body;
    const reminder = await reminderService.snoozeReminder(req.user._id, req.params.id, minutes);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
}

export async function recordTrigger(req, res, next) {
  try {
    const reminder = await reminderService.recordTrigger(req.user._id, req.params.id);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
}

export async function bulkDelete(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }
    const result = await reminderService.bulkDeleteReminders(req.user._id, ids);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function exportReminders(req, res, next) {
  try {
    const reminders = await reminderService.exportReminders(req.user._id);
    res.setHeader('Content-Disposition', 'attachment; filename="chronos-export.json"');
    res.json({ version: '1.0', exportedAt: new Date().toISOString(), reminders });
  } catch (err) {
    next(err);
  }
}

export async function importReminders(req, res, next) {
  try {
    const { reminders } = req.body;
    if (!Array.isArray(reminders)) {
      return res.status(400).json({ error: 'reminders must be an array' });
    }
    const result = await reminderService.importReminders(req.user._id, reminders);
    res.status(201).json({ imported: result.length, message: `Imported ${result.length} reminders` });
  } catch (err) {
    next(err);
  }
}
