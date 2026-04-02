import { Router } from 'express';
import { body, query } from 'express-validator';
import * as rc from '../controllers/reminderController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const reminderValidation = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title is required (max 120 chars)'),
  body('remindAt').isISO8601().withMessage('remindAt must be a valid ISO date'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('repeat').optional().isIn(['none', 'daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid repeat'),
  body('colorTag').optional().isIn(['violet', 'blue', 'green', 'amber', 'red', 'pink', 'none']).withMessage('Invalid colorTag'),
  body('language').optional().isIn(['uz', 'ru', 'en', 'auto']).withMessage('Invalid language'),
  body('sound').optional().isIn(['bell', 'chime', 'pulse', 'notification', 'none']).withMessage('Invalid sound'),
];

router.get('/', rc.getReminders);
router.get('/active', rc.getActiveReminders);
router.get('/stats', rc.getDashboardStats);
router.get('/export', rc.exportReminders);
router.get('/:id', rc.getReminderById);

router.post('/', reminderValidation, rc.createReminder);
router.post('/import', rc.importReminders);
router.post('/bulk-delete', rc.bulkDelete);
router.post('/:id/trigger', rc.recordTrigger);
router.post(
  '/:id/snooze',
  [body('minutes').isInt({ min: 1, max: 1440 }).withMessage('minutes must be 1–1440')],
  rc.snoozeReminder
);

router.patch('/:id', reminderValidation, rc.updateReminder);
router.delete('/:id', rc.deleteReminder);

export default router;
