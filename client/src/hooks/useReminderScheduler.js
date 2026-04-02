import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications.js';
import { voice } from '../voice/VoiceProvider.js';
import { playSound } from '../voice/soundEngine.js';
import { reminderService } from '../services/reminderService.js';
import useAuthStore from '../store/authStore.js';
import useReminderStore from '../store/reminderStore.js';

const POLL_INTERVAL = 30_000; // 30 seconds
const MISSED_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const FIRE_COOLDOWN_MS = 60_000; // Don't re-fire same reminder within 1 min

export function useReminderScheduler() {
  const { isAuthenticated } = useAuthStore();
  const firedRef = useRef(new Map()); // id → timestamp
  const { show: showNotification } = useNotifications();
  const updateReminder = useReminderStore((s) => s.updateReminder);

  const fireReminder = useCallback(async (reminder) => {
    const id = reminder._id;
    const lastFired = firedRef.current.get(id);
    if (lastFired && Date.now() - lastFired < FIRE_COOLDOWN_MS) return;

    firedRef.current.set(id, Date.now());

    // Browser notification
    showNotification(reminder.title, {
      body: [reminder.guestName, reminder.description].filter(Boolean).join(' — '),
      requireInteraction: reminder.priority === 'urgent',
      url: `/reminders/${id}`,
    });

    // Sound
    if (reminder.soundEnabled !== false) {
      playSound(reminder.sound || 'chime');
    }

    // Voice
    if (reminder.voiceEnabled !== false) {
      try {
        await voice.speakReminder(reminder);
      } catch {
        /* silent */
      }
    }

    // Record trigger on server
    try {
      await reminderService.recordTrigger(id);
      updateReminder(id, { lastTriggeredAt: new Date().toISOString() });
    } catch {
      /* silent */
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
      /* network error — silently skip */
    }
  }, [isAuthenticated, fireReminder]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    checkReminders();
    const intervalId = setInterval(checkReminders, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, checkReminders]);

  // Check on tab visibility change (return from background)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isAuthenticated, checkReminders]);

  // Register service worker for future push support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => { /* sw optional */ });
    }
  }, []);
}
