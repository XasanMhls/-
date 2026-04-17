import { useCallback, useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore.js';
import {
  getSystemNotificationPermission,
  requestSystemNotificationPermission,
  showSystemNotification,
} from '../services/nativeReminderService.js';

export function useNotifications() {
  const { user } = useAuthStore();
  const permRef = useRef('default');
  const [permission, setPermission] = useState('default');

  const isSupported = true;

  useEffect(() => {
    getSystemNotificationPermission()
      .then((value) => {
        permRef.current = value;
        setPermission(value);
      })
      .catch(() => {
        permRef.current = 'default';
        setPermission('default');
      });
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return 'unsupported';
    const result = await requestSystemNotificationPermission();
    permRef.current = result;
    setPermission(result);
    return result;
  }, [isSupported]);

  const show = useCallback(async (title, options = {}) => {
    if (!isSupported || permRef.current !== 'granted') return null;
    if (!user?.preferences?.notificationsEnabled) return null;
    return showSystemNotification(title, options).catch(() => null);
  }, [isSupported, user]);

  return {
    isSupported,
    permission,
    request,
    show,
  };
}
