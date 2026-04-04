import User from '../models/User.js';
import Reminder from '../models/Reminder.js';
import bcrypt from 'bcryptjs';

export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [totalUsers, totalReminders, admins, activeToday, overdueCount, newUsersToday] = await Promise.all([
      User.countDocuments(),
      Reminder.countDocuments(),
      User.countDocuments({ isAdmin: true }),
      User.countDocuments({ lastLoginAt: { $gte: last24h } }),
      Reminder.countDocuments({ isCompleted: false, remindAt: { $lt: now } }),
      User.countDocuments({ createdAt: { $gte: last24h } }),
    ]);
    res.json({ totalUsers, totalReminders, admins, activeToday, overdueCount, newUsersToday });
  } catch (err) { next(err); }
}

export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, isAdmin = false } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const user = await User.create({ name, email, password, isAdmin });
    res.status(201).json({ user });
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const { name, email, isAdmin, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (typeof isAdmin === 'boolean') update.isAdmin = isAdmin;
    if (password) {
      update.password = await bcrypt.hash(password, 12);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Reminder.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
}

export async function getReminders(req, res, next) {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const query = userId ? { userId } : {};
    const [reminders, total] = await Promise.all([
      Reminder.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Reminder.countDocuments(query),
    ]);
    res.json({ reminders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function deleteReminder(req, res, next) {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (err) { next(err); }
}
