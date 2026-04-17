import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { reminderService } from './reminderService.js';

// Tracks which past reminders have already been shown to avoid re-delivery on every app open.
// Keyed by `${reminderId}:${effectiveAt}` → timestamp shown.
const DELIVERY_KEY = 'chronos_delivered_v1';
const MAX_SYNC_LIMIT = 5000;

export function isNativeReminderPlatform() {
  return Capacitor.isNativePlatform() && (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios');
}

export function areSystemReminderNotificationsManagedNatively() {
  return isNativeReminderPlatform();
}

// Channel ID used for all reminder notifications.
// Must match the channelId in scheduled notifications.
const CHANNEL_ID = 'chronos_reminders';
let channelCreated = false;

/**
 * Create the notification channel (Android 8+ / API 26+).
 * Without a channel, Android silently drops all notifications.
 * Safe no-op on iOS and older Android.
 */
async function ensureNotificationChannel() {
  if (channelCreated || Capacitor.getPlatform() !== 'android') return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Напоминания',
      description: 'Уведомления о предстоящих напоминаниях',
      importance: 5,      // IMPORTANCE_HIGH — heads-up notification
      visibility: 1,      // VISIBILITY_PUBLIC — show on lock screen
      vibration: true,
      lights: true,
      lightColor: '#B9FF66',
    });
    channelCreated = true;
  } catch {
    // Older plugin versions — ignore
  }
}

function hashReminderId(reminderId) {
  let hash = 0;
  const input = String(reminderId || '');
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function getReminderBody(reminder) {
  return [reminder.guestName, reminder.description].filter(Boolean).join(' - ');
}

function getEffectiveAt(reminder) {
  return new Date(reminder.snoozeUntil || reminder.remindAt).getTime();
}

function readDeliveryState() {
  try {
    return JSON.parse(localStorage.getItem(DELIVERY_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeDeliveryState(state) {
  try {
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(state));
  } catch {
    // ignore quota/storage issues
  }
}

/**
 * Core sync: cancel all pending LocalNotifications, then re-schedule future ones.
 * Past reminders that haven't been delivered yet are shown immediately (e.g. after reboot).
 * Works identically on Android and iOS — the plugin uses AlarmManager under the hood on Android.
 */
async function syncWithLocalNotifications(reminders) {
  // Ensure notification channel exists (Android 8+ requirement)
  await ensureNotificationChannel();

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map(({ id }) => ({ id })) });
  }

  const deliveryState = readDeliveryState();
  const nextDeliveryState = {};
  const toSchedule = [];
  const toShowNow = [];
  const now = Date.now();

  for (const reminder of reminders) {
    if (reminder.isCompleted) continue;

    const effectiveAt = getEffectiveAt(reminder);
    const deliveryKey = `${reminder._id}:${effectiveAt}`;

    if (effectiveAt <= now) {
      // Reminder time has passed — show immediately only if not already delivered.
      if (!deliveryState[deliveryKey]) {
        toShowNow.push({
          id: hashReminderId(deliveryKey),
          title: reminder.title,
          body: getReminderBody(reminder),
          channelId: CHANNEL_ID,
          schedule: { at: new Date(now + 1500), allowWhileIdle: true },
          extra: { route: `/reminders/${reminder._id}` },
        });
        nextDeliveryState[deliveryKey] = now;
      }
      continue;
    }

    // Future reminder — schedule exact alarm.
    // allowWhileIdle: true → uses setExactAndAllowWhileIdle on Android (fires even in Doze mode).
    toSchedule.push({
      id: hashReminderId(reminder._id),
      title: reminder.title,
      body: getReminderBody(reminder),
      channelId: CHANNEL_ID,
      schedule: { at: new Date(effectiveAt), allowWhileIdle: true },
      extra: { route: `/reminders/${reminder._id}` },
    });
  }

  if (toSchedule.length) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
  if (toShowNow.length) {
    await LocalNotifications.schedule({ notifications: toShowNow });
  }

  // Merge old delivery state (keep history so reminders aren't re-fired after data reload).
  const merged = { ...deliveryState, ...nextDeliveryState };
  writeDeliveryState(merged);
}

/**
 * On Android 12+ (API 31+) exact alarms require a special permission.
 * Without it the plugin falls back to setAndAllowWhileIdle which Android
 * may defer by up to 9 minutes — useless for a reminder app.
 *
 * This function checks and, if denied, opens the system Settings page
 * where the user can grant "Alarms & reminders" access.
 * Safe no-op on iOS and non-native platforms.
 */
export async function ensureExactAlarmPermission() {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
    if (exact_alarm !== 'granted') {
      // Opens Settings → Special app access → Alarms & reminders
      await LocalNotifications.changeExactNotificationSetting();
    }
  } catch {
    // Older plugin versions or API < 31 — ignore
  }
}

export async function requestSystemNotificationPermission() {
  if (isNativeReminderPlatform()) {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return 'granted';
    const result = await LocalNotifications.requestPermissions();
    return result.display;
  }

  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export async function getSystemNotificationPermission() {
  if (isNativeReminderPlatform()) {
    const result = await LocalNotifications.checkPermissions();
    return result.display;
  }

  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function showSystemNotification(title, options = {}) {
  if (isNativeReminderPlatform()) {
    const permission = await getSystemNotificationPermission();
    if (permission !== 'granted') return null;

    await ensureNotificationChannel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: hashReminderId(`${title}:${options.url || Date.now()}`),
          title,
          body: options.body || '',
          channelId: CHANNEL_ID,
          schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
          extra: { route: options.url || '/' },
        },
      ],
    });
    return { native: true };
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return null;

  const notification = new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: options.requireInteraction ?? false,
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    if (options.url) window.location.href = options.url;
    notification.close();
  };

  return notification;
}

export async function clearNativeReminderState() {
  if (!isNativeReminderPlatform()) return;

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map(({ id }) => ({ id })) });
  }
  writeDeliveryState({});
}

export async function syncNativeReminders(reminders) {
  if (!isNativeReminderPlatform()) return;

  const activeReminders = reminders.filter(
    (reminder) => reminder && reminder._id && !reminder.isCompleted,
  );

  await syncWithLocalNotifications(activeReminders);
}

export async function syncAllNativeReminders() {
  if (!isNativeReminderPlatform()) return;

  const { reminders } = await reminderService.getReminders({
    filter: 'all',
    sort: 'remindAt',
    limit: MAX_SYNC_LIMIT,
  });

  await syncNativeReminders(reminders);
}
