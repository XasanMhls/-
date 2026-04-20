import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { reminderService } from './reminderService.js';

// ── Platform helpers ───────────────────────────────────────────────────────

export function isNativeReminderPlatform() {
  return Capacitor.isNativePlatform()
    && (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios');
}

export function areSystemReminderNotificationsManagedNatively() {
  return isNativeReminderPlatform();
}

// ── ChronosAlarm native plugin ─────────────────────────────────────────────
// Registered in MainActivity.java via registerPlugin(AlarmPlugin.class).
// On Android: uses AlarmManager setExactAndAllowWhileIdle, survives Doze and
// device reboot (BootReceiver re-schedules from SharedPreferences).
// On non-native platforms the plugin is undefined — all calls are no-ops.

const ChronosAlarm = Capacitor.isNativePlatform()
  ? registerPlugin('ChronosAlarm')
  : null;

// ── Permissions ────────────────────────────────────────────────────────────

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

// ── Exact-alarm permission (Android 12+ / API 31+) ────────────────────────

export async function ensureExactAlarmPermission() {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
    if (exact_alarm !== 'granted') {
      await LocalNotifications.changeExactNotificationSetting();
    }
  } catch {
    // Older plugin versions or API < 31 — ignore
  }
}

// ── Web notification (browser / PWA) ──────────────────────────────────────

export async function showSystemNotification(title, options = {}) {
  if (isNativeReminderPlatform()) {
    // Native: handled by ChronosAlarm / AlarmReceiver — nothing to do here
    return null;
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

// ── Helpers ────────────────────────────────────────────────────────────────

function getEffectiveAt(reminder) {
  return new Date(reminder.snoozeUntil || reminder.remindAt).getTime();
}

function getReminderBody(reminder) {
  return [reminder.guestName, reminder.description].filter(Boolean).join(' - ');
}

// ── Core sync ──────────────────────────────────────────────────────────────
// Cancels all pending alarms then re-schedules future reminders via ChronosAlarm.
// Past reminders that haven't been delivered are shown immediately.

const DELIVERY_KEY = 'chronos_delivered_v2';
const MAX_SYNC_LIMIT = 5000;

function readDeliveryState() {
  try { return JSON.parse(localStorage.getItem(DELIVERY_KEY) || '{}'); }
  catch { return {}; }
}

function writeDeliveryState(state) {
  try { localStorage.setItem(DELIVERY_KEY, JSON.stringify(state)); }
  catch { /* quota */ }
}

async function syncWithAlarmPlugin(reminders) {
  if (!ChronosAlarm) return;

  // Cancel all currently scheduled alarms before re-scheduling
  try { await ChronosAlarm.cancelAllAlarms(); } catch { /* ignore */ }

  const deliveryState     = readDeliveryState();
  const nextDeliveryState = {};
  const now               = Date.now();

  for (const reminder of reminders) {
    if (reminder.isCompleted) continue;

    const effectiveAt  = getEffectiveAt(reminder);
    const deliveryKey  = `${reminder._id}:${effectiveAt}`;

    if (effectiveAt <= now) {
      // Past reminder — fire once if not already delivered
      if (!deliveryState[deliveryKey]) {
        try {
          await ChronosAlarm.scheduleAlarm({
            id:        deliveryKey,
            title:     reminder.title,
            body:      getReminderBody(reminder),
            triggerAt: now + 1500, // fire in 1.5 s
          });
          nextDeliveryState[deliveryKey] = now;
        } catch { /* ignore */ }
      }
      continue;
    }

    // Future reminder — schedule exact alarm
    try {
      await ChronosAlarm.scheduleAlarm({
        id:        reminder._id,
        title:     reminder.title,
        body:      getReminderBody(reminder),
        triggerAt: effectiveAt,
      });
    } catch { /* ignore */ }
  }

  const merged = { ...deliveryState, ...nextDeliveryState };
  writeDeliveryState(merged);
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function clearNativeReminderState() {
  if (!isNativeReminderPlatform()) return;
  if (ChronosAlarm) {
    try { await ChronosAlarm.cancelAllAlarms(); } catch { /* ignore */ }
  }
  writeDeliveryState({});
}

export async function syncNativeReminders(reminders) {
  if (!isNativeReminderPlatform()) return;
  const active = reminders.filter(r => r && r._id && !r.isCompleted);
  await syncWithAlarmPlugin(active);
}

export async function syncAllNativeReminders() {
  if (!isNativeReminderPlatform()) return;
  const { reminders } = await reminderService.getReminders({
    filter: 'all',
    sort:   'remindAt',
    limit:  MAX_SYNC_LIMIT,
  });
  await syncNativeReminders(reminders);
}
