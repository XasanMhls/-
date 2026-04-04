import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, LogOut, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reminders', icon: Bell, label: 'Reminders' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', fontFamily: "'Inter', sans-serif", background: '#0f1117' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: '#0a0c12',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100dvh',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={15} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Chronos</div>
              <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin</div>
            </div>
          </div>
          <Link to="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'color 150ms, background 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <ArrowLeft size={12} /> Вернуться в приложение
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: isActive ? '#e2e8f0' : '#64748b',
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              transition: 'all 150ms ease',
            })}>
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? '#6366f1' : '#64748b'} />
                  {label}
                  {isActive && <ChevronRight size={13} color="#6366f1" style={{ marginLeft: 'auto' }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '10px 8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px 10px', marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', width: '100%', borderRadius: 7,
            fontSize: 12, fontWeight: 500, color: '#ef4444',
            cursor: 'pointer', transition: 'background 150ms ease',
            background: 'transparent',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#0f1117' }}>
        <Outlet />
      </main>
    </div>
  );
}
