import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useReminderStore from '../store/reminderStore.js';
import { reminderService } from '../services/reminderService.js';
import { syncAllNativeReminders, isNativeReminderPlatform } from '../services/nativeReminderService.js';

// Fire-and-forget — schedule alarms after any mutation
const nativeSync = () => {
  if (isNativeReminderPlatform()) syncAllNativeReminders().catch(() => {});
};

export function useReminders() {
  const store = useReminderStore();
  const { t } = useTranslation();

  const fetch = useCallback(async (params = {}) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const data = await reminderService.getReminders({
        filter: store.filter,
        search: store.search,
        sort: store.sort,
        ...params,
      });
      store.setReminders(data.reminders, data.pagination);
    } catch (err) {
      store.setError(err.response?.data?.error || err.message);
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await reminderService.getStats();
      store.setStats(stats);
    } catch {
      /* silent */
    }
  }, [store]);

  const create = useCallback(async (data) => {
    const { reminder } = await reminderService.create(data);
    store.addReminder(reminder);
    store.setStats(null);
    toast.success(t('toast.reminderCreated'));
    nativeSync(); // schedule alarm immediately after create
    return reminder;
  }, [store, t]);

  const update = useCallback(async (id, data) => {
    const { reminder } = await reminderService.update(id, data);
    store.updateReminder(id, reminder);
    toast.success(t('toast.reminderUpdated'));
    nativeSync(); // reschedule after time/snooze change
    return reminder;
  }, [store, t]);

  const remove = useCallback(async (id) => {
    await reminderService.delete(id);
    store.removeReminder(id);
    toast.success(t('toast.reminderDeleted'));
    nativeSync(); // cancel alarm for deleted reminder
  }, [store, t]);

  const toggleComplete = useCallback(async (reminder) => {
    const { reminder: updated } = await reminderService.update(reminder._id, {
      isCompleted: !reminder.isCompleted,
    });
    store.updateReminder(reminder._id, updated);
    nativeSync(); // cancel alarm when completed
    return updated;
  }, [store]);

  const togglePin = useCallback(async (reminder) => {
    const { reminder: updated } = await reminderService.update(reminder._id, {
      isPinned: !reminder.isPinned,
    });
    store.updateReminder(reminder._id, updated);
    return updated;
  }, [store]);

  const snooze = useCallback(async (id, minutes) => {
    const { reminder } = await reminderService.snooze(id, minutes);
    store.updateReminder(id, reminder);
    toast.success(t('toast.reminderSnoozed', { minutes }));
    nativeSync(); // reschedule to new snooze time
    return reminder;
  }, [store, t]);

  const recordTrigger = useCallback(async (id) => {
    try {
      await reminderService.recordTrigger(id);
      store.updateReminder(id, { lastTriggeredAt: new Date().toISOString() });
    } catch {
      /* silent */
    }
  }, [store]);

  return {
    ...store,
    fetch,
    fetchStats,
    create,
    update,
    remove,
    toggleComplete,
    togglePin,
    snooze,
    recordTrigger,
  };
}
