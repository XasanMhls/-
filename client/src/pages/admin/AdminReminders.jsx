import { useEffect, useState, useCallback } from 'react';
import { Trash2, Clock, User } from 'lucide-react';
import { adminService } from '../../services/adminService.js';

export default function AdminReminders() {
  const [data, setData] = useState({ reminders: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getReminders({ page, limit: 20 }).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    await adminService.deleteReminder(id);
    load();
  };

  const PRIORITY_COLOR = { low: '#64748b', medium: '#38bdf8', high: '#f59e0b', urgent: '#ef4444' };

  return (
    <div style={{ padding: '32px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Reminders</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{data.total} total reminders</p>
      </div>

      <div style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Title', 'User', 'Priority', 'Due', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Loading…</td></tr>
            ) : data.reminders.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>No reminders</td></tr>
            ) : data.reminders.map(r => (
              <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 500, maxWidth: 220 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <User size={12} />
                    {r.userId?.name || 'Unknown'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: `${PRIORITY_COLOR[r.priority] || '#64748b'}18`,
                    color: PRIORITY_COLOR[r.priority] || '#64748b' }}>
                    {r.priority}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                    <Clock size={11} />
                    {new Date(r.remindAt).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: r.isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                    color: r.isCompleted ? '#4ade80' : '#64748b' }}>
                    {r.isCompleted ? 'Done' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(r._id)}
                    style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 32, height: 32, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              background: page === p ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: page === p ? 'white' : '#64748b',
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
