import { Router } from 'express';
import { body } from 'express-validator';
import { adminProtect } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();
router.use(adminProtect);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users', [
  body('name').trim().isLength({ min: 2, max: 60 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/reminders', adminController.getReminders);
router.delete('/reminders/:id', adminController.deleteReminder);

export default router;
