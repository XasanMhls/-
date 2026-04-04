import { useEffect, useState } from 'react';
import { Users, Bell, Shield, Activity, AlertTriangle, UserPlus } from 'lucide-react';
import { adminService } from '../../services/adminService.js';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{
      background: '#161b27', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.03em', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '32px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Live overview of users, reminders, and activity</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="#6366f1"
          sub={stats?.newUsersToday ? `+${stats.newUsersToday} today` : null} />
        <StatCard label="Total Reminders" value={stats?.totalReminders} icon={Bell} color="#22d3ee" />
        <StatCard label="Admins" value={stats?.admins} icon={Shield} color="#f59e0b" />
        <StatCard label="Active Today" value={stats?.activeToday} icon={Activity} color="#4ade80"
          sub="logged in last 24h" />
        <StatCard label="Overdue Reminders" value={stats?.overdueCount} icon={AlertTriangle} color="#ef4444"
          sub={stats?.overdueCount > 0 ? 'need attention' : null} />
        <StatCard label="New Users Today" value={stats?.newUsersToday} icon={UserPlus} color="#a78bfa" />
      </div>
    </div>
  );
}
