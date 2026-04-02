import { useCallback, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore.js';

export function useNotifications() {
  const { user } = useAuthStore();
  const permRef = useRef(Notification.permission);

  const isSupported = 'Notification' in window;
  const permission = permRef.current;

  const request = useCallback(async () => {
    if (!isSupported) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    const result = await Notification.requestPermission();
    permRef.current = result;
    return result;
  }, [isSupported]);

  const show = useCallback((title, options = {}) => {
    if (!isSupported || Notification.permission !== 'granted') return null;
    if (!user?.preferences?.notificationsEnabled) return null;

    try {
      const n = new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        requireInteraction: options.requireInteraction ?? false,
        ...options,
      });

      n.onclick = () => {
        window.focus();
        if (options.url) window.location.href = options.url;
        n.close();
      };

      return n;
    } catch {
      return null;
    }
  }, [isSupported, user]);

  return {
    isSupported,
    permission: Notification.permission,
    request,
    show,
  };
}
