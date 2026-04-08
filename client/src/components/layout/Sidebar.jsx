import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bell, Calendar, Settings, LogOut,
  ChevronLeft, ChevronRight, Clock, Shield, Sun, Moon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import useUiStore from '../../store/uiStore.js';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/reminders',  icon: Bell,            key: 'reminders'  },
  { to: '/calendar',   icon: Calendar,        key: 'calendar'   },
  { to: '/settings',   icon: Settings,        key: 'settings'   },
];

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return mobile;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, theme, setTheme } = useUiStore();
  const isDark = theme !== 'light' && !(theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const location = useLocation();
  const isMobile = useIsMobile();

  // On mobile, sidebar is always full-width when open, hidden when closed
  const W = isMobile ? (sidebarOpen ? 260 : 0) : (sidebarOpen ? 232 : 60);

  return (
    <motion.aside
      animate={isMobile
        ? { x: sidebarOpen ? 0 : -260, width: 260 }
        : { x: 0, width: W }
      }
      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
      className="sidebar"
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-canvas)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: 260,
        } : {}),
      }}
    >
      {/* ── Logo bar ── */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: (sidebarOpen || isMobile) ? '0 12px 0 14px' : '0',
        justifyContent: (sidebarOpen || isMobile) ? 'space-between' : 'center',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          {/* Logo mark */}
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg,#B9FF66,#d4ff99)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 1px rgba(185,255,102,0.3), 0 4px 12px rgba(185,255,102,0.28)',
          }}>
            <Clock size={15} color="#191A23" strokeWidth={2.5} />
          </div>

          <AnimatePresence>
            {(sidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
                style={{ overflow: 'hidden' }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap', display: 'block',
                }}>
                  Chronos
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'block',
                }}>
                  Smart Reminders
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(sidebarOpen || isMobile) && (
          <button
            onClick={() => isMobile ? setSidebarOpen(false) : toggleSidebar()}
            title={isMobile ? "Close menu" : "Collapse sidebar"}
            style={{
              width: 26, height: 26, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background 140ms, color 140ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ChevronLeft size={14} />
          </button>
        )}

        {!sidebarOpen && !isMobile && (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            style={{
              position: 'absolute', bottom: 0, right: -12,
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background 140ms, color 140ms',
              zIndex: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ChevronRight size={10} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, key }) => {
          const active = location.pathname.startsWith(to);
          const expanded = sidebarOpen || isMobile;
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: expanded ? '9px 10px 9px 12px' : '9px',
                justifyContent: expanded ? 'flex-start' : 'center',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 450,
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                background: active ? 'var(--bg-surface)' : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1), inset 0 0 0 1px var(--border)' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden',
                transition: 'color 140ms, background 140ms, box-shadow 140ms',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              {/* Active left-bar accent */}
              {active && (
                <motion.span
                  layoutId="nav-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 2px 2px 0',
                    background: 'var(--accent)',
                  }}
                />
              )}
              <Icon
                size={16}
                style={{ flexShrink: 0, color: active ? 'var(--accent)' : 'inherit' }}
              />
              <AnimatePresence>
                {(sidebarOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {t(`nav.${key}`)}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Admin */}
        {user?.isAdmin && (() => {
          const active = location.pathname.startsWith('/admin');
          return (
            <NavLink
              to="/admin"
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: (sidebarOpen || isMobile) ? '9px 10px 9px 12px' : '9px',
                justifyContent: (sidebarOpen || isMobile) ? 'flex-start' : 'center',
                borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: active ? 600 : 450,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                marginTop: 10, whiteSpace: 'nowrap', overflow: 'hidden',
                transition: 'color 140ms, background 140ms',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--accent)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <Shield size={16} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {(sidebarOpen || isMobile) && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                    Admin
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })()}
      </nav>

      {/* ── Bottom controls ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '6px 6px 4px', flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: (sidebarOpen || isMobile) ? '8px 10px 8px 12px' : '8px',
            justifyContent: (sidebarOpen || isMobile) ? 'flex-start' : 'center',
            width: '100%', borderRadius: 8,
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 450,
            cursor: 'pointer', transition: 'background 140ms, color 140ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            style={{ flexShrink: 0, display: 'flex' }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </motion.div>
          <AnimatePresence>
            {(sidebarOpen || isMobile) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                {isDark ? 'Light mode' : 'Dark mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── User card ── */}
      <div style={{ padding: '2px 6px 10px', flexShrink: 0 }}>
        {(sidebarOpen || isMobile) && user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, marginBottom: 2,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#B9FF66,#d4ff99)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#191A23', fontWeight: 800, fontSize: 13,
              boxShadow: '0 2px 8px rgba(185,255,102,0.3)',
            }}>
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </motion.div>
        ) : !sidebarOpen && !isMobile && user ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg,#B9FF66,#d4ff99)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#191A23', fontWeight: 800, fontSize: 13,
            }}>
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        ) : null}

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: (sidebarOpen || isMobile) ? '8px 10px 8px 12px' : '8px',
            justifyContent: (sidebarOpen || isMobile) ? 'flex-start' : 'center',
            width: '100%', borderRadius: 8,
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 450,
            cursor: 'pointer', transition: 'background 140ms, color 140ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {(sidebarOpen || isMobile) && (
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
