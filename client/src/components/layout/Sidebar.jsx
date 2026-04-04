import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bell, Calendar, Settings, LogOut, ChevronLeft, Clock, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import useUiStore from '../../store/uiStore.js';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/reminders', icon: Bell, key: 'reminders' },
  { to: '/calendar', icon: Calendar, key: 'calendar' },
  { to: '/settings', icon: Settings, key: 'settings' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();
  const location = useLocation();

  const W = sidebarOpen ? 236 : (window.innerWidth < 768 ? 0 : 62);

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="sidebar"
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        height: 58,
        display: 'flex',
        alignItems: 'center',
        padding: sidebarOpen ? '0 14px' : '0',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
          }}>
            <Clock size={14} color="white" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                Chronos
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: sidebarOpen ? '8px 10px' : '8px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(108,99,255,0.06) 100%)',
                    border: '1px solid rgba(108,99,255,0.22)',
                    zIndex: 0,
                  }}
                />
              )}
              <Icon
                size={16}
                style={{
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                  color: isActive ? 'var(--accent)' : 'inherit',
                }}
              />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    {t(`nav.${key}`)}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Admin link */}
        {user?.isAdmin && (() => {
          const isActive = location.pathname.startsWith('/admin');
          return (
            <NavLink
              to="/admin"
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: sidebarOpen ? '8px 10px' : '8px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'color 150ms ease, background 150ms ease',
                marginTop: 8,
                borderTop: '1px solid var(--border)',
                paddingTop: 10,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Shield size={16} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })()}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '8px 8px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {sidebarOpen && user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 2,
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 12,
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(108,99,255,0.35)',
            }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: sidebarOpen ? '8px 10px' : '8px',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            cursor: 'pointer',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                {t('nav.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
