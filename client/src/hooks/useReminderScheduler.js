import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications.js';
import { voice } from '../voice/VoiceProvider.js';
import { playSound } from '../voice/soundEngine.js';
import { reminderService } from '../services/reminderService.js';
import { areSystemReminderNotificationsManagedNatively, syncAllNativeReminders } from '../services/nativeReminderService.js';
import useAuthStore from '../store/authStore.js';
import useReminderStore from '../store/reminderStore.js';

const POLL_INTERVAL = 30_000;
const MISSED_WINDOW_MS = 30 * 60 * 1000;
const FIRE_COOLDOWN_MS = 60_000;

export function useReminderScheduler() {
  const { isAuthenticated } = useAuthStore();
  const firedRef = useRef(new Map());
  const { show: showNotification } = useNotifications();
  const updateReminder = useReminderStore((state) => state.updateReminder);

  const fireReminder = useCallback(async (reminder) => {
    const id = reminder._id;
    const lastFired = firedRef.current.get(id);
    if (lastFired && Date.now() - lastFired < FIRE_COOLDOWN_MS) return;

    firedRef.current.set(id, Date.now());

    if (!areSystemReminderNotificationsManagedNatively()) {
      showNotification(reminder.title, {
        body: [reminder.guestName, reminder.description].filter(Boolean).join(' - '),
        requireInteraction: reminder.priority === 'urgent',
        url: `/reminders/${id}`,
      });
    }

    if (reminder.soundEnabled !== false) {
      playSound(reminder.sound || 'chime');
    }

    if (reminder.voiceEnabled !== false) {
      try {
        await voice.speakReminder(reminder);
      } catch {
        // ignore voice failures
      }
    }

    try {
      await reminderService.recordTrigger(id);
      updateReminder(id, { lastTriggeredAt: new Date().toISOString() });
      await syncAllNativeReminders();
    } catch {
      // ignore network failures
    }
  }, [showNotification, updateReminder]);

  const checkReminders = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { reminders } = await reminderService.getActiveReminders();
      const now = Date.now();

      for (const reminder of reminders) {
        if (reminder.isCompleted) continue;

        const effectiveTime = reminder.snoozeUntil
          ? new Date(reminder.snoozeUntil).getTime()
          : new Date(reminder.remindAt).getTime();

        const isMissed = effectiveTime < now && effectiveTime > now - MISSED_WINDOW_MS;
        const isDue = Math.abs(effectiveTime - now) < POLL_INTERVAL + 5000;

        if ((isDue || isMissed) && effectiveTime <= now) {
          await fireReminder(reminder);
        }
      }
    } catch {
      // ignore polling failures
    }
  }, [fireReminder, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    checkReminders();
    const intervalId = setInterval(checkReminders, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkReminders, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkReminders, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncAllNativeReminders().catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
}
