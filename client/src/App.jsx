import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore.js';
import useUiStore, { applyTheme } from './store/uiStore.js';
import Layout from './components/layout/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reminders from './pages/Reminders.jsx';
import ReminderDetail from './pages/ReminderDetail.jsx';
import Calendar from './pages/Calendar.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminReminders from './pages/admin/AdminReminders.jsx';
import { useEffect } from 'react';
import { unlockAudio } from './voice/soundEngine.js';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function RequireAdmin({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { theme } = useUiStore();
  const { isAuthenticated, setAuth, token } = useAuthStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Unlock AudioContext on first user interaction (required on iOS/Android)
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('mousedown', unlock);
    };
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('mousedown', unlock);
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('mousedown', unlock);
    };
  }, []);

  // Refresh user data from server on startup to pick up permission changes
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    import('./services/authService.js').then(({ authService }) => {
      authService.getMe().then(({ user }) => {
        useAuthStore.getState().setAuth(user, token);
      }).catch(() => {});
    });
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-surface)' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-surface)' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<RequireGuest><Landing /></RequireGuest>} />
        <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />

        {/* Protected */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/reminders/:id" element={<ReminderDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reminders" element={<AdminReminders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
