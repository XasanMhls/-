import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Reminder from './models/Reminder.js';

const SEED_USER = {
  name: 'Alex Demo',
  email: 'demo@chronos.app',
  password: 'demo1234',
  preferences: {
    language: 'ru',
    voiceLanguage: 'auto',
    theme: 'dark',
    defaultSound: 'chime',
    timezone: 'Europe/Moscow',
    notificationsEnabled: true,
  },
  onboardingCompleted: true,
};

function daysFromNow(n, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function seed() {
  await connectDB();
  console.log('🌱 Starting seed...');

  await User.deleteMany({ email: SEED_USER.email });

  const user = await User.create(SEED_USER);
  await Reminder.deleteMany({ user: user._id });

  const reminders = [
    {
      user: user._id,
      title: 'Встреча с командой',
      guestName: 'Дмитрий Козлов',
      description: 'Обсуждение квартального отчета и планирование следующего спринта',
      remindAt: hoursFromNow(1),
      priority: 'urgent',
      colorTag: 'red',
      voiceEnabled: true,
      soundEnabled: true,
      sound: 'bell',
      repeat: 'none',
      isPinned: true,
      language: 'ru',
    },
    {
      user: user._id,
      title: 'Позвонить клиенту',
      guestName: 'Sardor Mirzayev',
      description: 'Обсудить детали нового проекта и условия договора',
      remindAt: hoursFromNow(3),
      priority: 'high',
      colorTag: 'violet',
      voiceEnabled: true,
      soundEnabled: true,
      sound: 'chime',
      repeat: 'none',
      language: 'uz',
    },
    {
      user: user._id,
      title: 'Daily standup',
      guestName: '',
      description: 'Morning team sync',
      remindAt: daysFromNow(1, 9, 0),
      priority: 'medium',
      colorTag: 'blue',
      voiceEnabled: false,
      soundEnabled: true,
      sound: 'notification',
      repeat: 'daily',
      language: 'en',
    },
    {
      user: user._id,
      title: 'Подготовить презентацию',
      guestName: '',
      description: 'Слайды для инвесторов: метрики, планы, roadmap',
      remindAt: daysFromNow(2, 14, 30),
      priority: 'high',
      colorTag: 'amber',
      voiceEnabled: true,
      soundEnabled: true,
      sound: 'pulse',
      repeat: 'none',
      language: 'ru',
    },
    {
      user: user._id,
      title: 'Оплатить счета',
      guestName: '',
      description: 'Коммунальные платежи за декабрь',
      remindAt: daysFromNow(3, 12, 0),
      priority: 'medium',
      colorTag: 'green',
      voiceEnabled: false,
      soundEnabled: true,
      sound: 'chime',
      repeat: 'monthly',
      language: 'ru',
    },
    {
      user: user._id,
      title: 'Dentist appointment',
      guestName: 'Dr. Smith',
      description: 'Annual checkup — bring insurance card',
      remindAt: daysFromNow(5, 11, 0),
      priority: 'high',
      colorTag: 'pink',
      voiceEnabled: true,
      soundEnabled: true,
      sound: 'bell',
      repeat: 'none',
      language: 'en',
    },
    {
      user: user._id,
      title: 'Спортзал',
      guestName: '',
      description: 'Тренировка: грудь + трицепс',
      remindAt: daysFromNow(1, 7, 30),
      priority: 'low',
      colorTag: 'green',
      voiceEnabled: false,
      soundEnabled: true,
      sound: 'pulse',
      repeat: 'daily',
      language: 'ru',
    },
    {
      user: user._id,
      title: 'Code review',
      guestName: 'Anna Chen',
      description: 'Review PR #142 — auth middleware refactor',
      remindAt: daysFromNow(1, 15, 0),
      priority: 'medium',
      colorTag: 'blue',
      voiceEnabled: false,
      soundEnabled: true,
      sound: 'notification',
      repeat: 'none',
      language: 'en',
    },
    {
      user: user._id,
      title: 'Завершённое: обновить зависимости',
      guestName: '',
      description: 'npm update + аудит безопасности',
      remindAt: daysFromNow(-2, 10, 0),
      priority: 'low',
      colorTag: 'none',
      isCompleted: true,
      voiceEnabled: false,
      soundEnabled: false,
      repeat: 'none',
      language: 'ru',
    },
    {
      user: user._id,
      title: 'ПРОСРОЧЕННОЕ: Отчёт за Q3',
      guestName: '',
      description: 'Финансовый отчет третьего квартала',
      remindAt: daysFromNow(-1, 9, 0),
      priority: 'urgent',
      colorTag: 'red',
      voiceEnabled: true,
      soundEnabled: true,
      sound: 'bell',
      repeat: 'none',
      language: 'ru',
    },
  ];

  await Reminder.insertMany(reminders);

  console.log(`\x1b[32m✔ Seeded user: ${SEED_USER.email} / ${SEED_USER.password}\x1b[0m`);
  console.log(`\x1b[32m✔ Created ${reminders.length} sample reminders\x1b[0m`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
