import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import useUiStore, { applyTheme } from '../../store/uiStore.js';
import { useReminderScheduler } from '../../hooks/useReminderScheduler.js';

export default function Layout() {
  const { theme, sidebarOpen, setSidebarOpen } = useUiStore();

  useReminderScheduler();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-canvas)', position: 'relative' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}
