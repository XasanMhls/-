import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';

const LOCALES = { ru, en: enUS, uz: uz || ru };

export function getLocale(lang = 'ru') {
  return LOCALES[lang] || enUS;
}

export function formatDate(date, lang = 'ru') {
  const d = new Date(date);
  const locale = getLocale(lang);

  if (isToday(d)) return format(d, 'HH:mm');
  if (isTomorrow(d)) {
    const labels = { ru: 'Завтра', en: 'Tomorrow', uz: 'Ertaga' };
    return `${labels[lang] || 'Tomorrow'} ${format(d, 'HH:mm')}`;
  }
  if (isYesterday(d)) {
    const labels = { ru: 'Вчера', en: 'Yesterday', uz: 'Kecha' };
    return `${labels[lang] || 'Yesterday'} ${format(d, 'HH:mm')}`;
  }

  return format(d, 'd MMM, HH:mm', { locale });
}

export function formatRelative(date, lang = 'ru') {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: getLocale(lang),
  });
}

export function formatFull(date, lang = 'ru') {
  return format(new Date(date), 'PPPP, HH:mm', { locale: getLocale(lang) });
}

export function formatForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function isOverdue(reminder) {
  if (reminder.isCompleted) return false;
  const effectiveTime = reminder.snoozeUntil
    ? new Date(reminder.snoozeUntil)
    : new Date(reminder.remindAt);
  return isPast(effectiveTime);
}

export function getCalendarDays(year, month) {
  const start = startOfWeek(startOfMonth(new Date(year, month)), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date(year, month)), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export { isToday, isTomorrow, isPast, isFuture, isSameDay, isSameMonth, addMonths, subMonths, format, getDay };
