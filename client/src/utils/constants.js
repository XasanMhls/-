export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_COLORS = {
  low: 'var(--text-muted)',
  medium: 'var(--info)',
  high: 'var(--warning)',
  urgent: 'var(--danger)',
};

export const COLOR_TAGS = ['none', 'violet', 'blue', 'green', 'amber', 'red', 'pink'];

export const COLOR_TAG_VALUES = {
  none: 'var(--border)',
  violet: 'var(--color-violet)',
  blue: 'var(--color-blue)',
  green: 'var(--color-green)',
  amber: 'var(--color-amber)',
  red: 'var(--color-red)',
  pink: 'var(--color-pink)',
};

export const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly', 'custom'];

export const SOUND_OPTIONS = ['bell', 'chime', 'pulse', 'notification', 'none'];

export const LANGUAGES = [
  { value: 'uz', label: 'O\'zbek' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export const VOICE_LANGUAGES = [
  { value: 'auto', label: 'Auto' },
  { value: 'uz', label: 'O\'zbek' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export const THEMES = ['dark', 'light', 'system'];

export const SNOOZE_OPTIONS = [5, 10, 30];

export const FILTERS = ['all', 'today', 'tomorrow', 'overdue', 'important', 'completed', 'repeating', 'pinned'];

export const TIMEZONES = [
  'UTC',
  'Europe/Moscow',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Tokyo',
];

export const REMINDER_TEMPLATES = [
  {
    id: 'meeting',
    label: { ru: 'Встреча', en: 'Meeting', uz: 'Uchrashuv' },
    icon: '👥',
    defaults: { priority: 'high', voiceEnabled: true, soundEnabled: true, sound: 'bell', colorTag: 'blue' },
  },
  {
    id: 'call',
    label: { ru: 'Звонок', en: 'Call', uz: 'Qo\'ng\'iroq' },
    icon: '📞',
    defaults: { priority: 'high', voiceEnabled: true, soundEnabled: true, sound: 'chime', colorTag: 'violet' },
  },
  {
    id: 'task',
    label: { ru: 'Задача', en: 'Task', uz: 'Vazifa' },
    icon: '✅',
    defaults: { priority: 'medium', voiceEnabled: false, soundEnabled: true, sound: 'notification', colorTag: 'green' },
  },
  {
    id: 'birthday',
    label: { ru: 'День рождения', en: 'Birthday', uz: 'Tug\'ilgan kun' },
    icon: '🎉',
    defaults: { priority: 'high', voiceEnabled: true, soundEnabled: true, sound: 'chime', colorTag: 'pink', repeat: 'yearly' },
  },
  {
    id: 'payment',
    label: { ru: 'Платёж', en: 'Payment', uz: 'To\'lov' },
    icon: '💳',
    defaults: { priority: 'urgent', voiceEnabled: true, soundEnabled: true, sound: 'bell', colorTag: 'amber', repeat: 'monthly' },
  },
  {
    id: 'health',
    label: { ru: 'Здоровье', en: 'Health', uz: 'Salomatlik' },
    icon: '🏥',
    defaults: { priority: 'high', voiceEnabled: true, soundEnabled: true, sound: 'pulse', colorTag: 'red' },
  },
];
