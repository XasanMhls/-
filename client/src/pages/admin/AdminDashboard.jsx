import { useEffect, useState } from 'react';
import { Users, Bell, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService.js';

function StatCard({ label, value, icon: Icon, color }) {
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
        <div style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.03em' }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{label}</div>
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
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Overview of all users and reminders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="#6366f1" />
        <StatCard label="Total Reminders" value={stats?.totalReminders} icon={Bell} color="#22d3ee" />
        <StatCard label="Admins" value={stats?.admins} icon={Shield} color="#f59e0b" />
      </div>
    </div>
  );
}
