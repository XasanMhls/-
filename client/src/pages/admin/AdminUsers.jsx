import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Shield, ShieldOff, Search, X, Eye, EyeOff, Mail, Clock, LogIn } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useAuth } from '../../hooks/useAuth.js';

const INPUT_STYLE = {
  width: '100%', height: 38, padding: '0 12px',
  background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
};

const BTN = (extra = {}) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', border: 'none', transition: 'opacity 150ms ease',
  ...extra,
});

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 420 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{title}</h3>
          <button onClick={onClose} style={{ color: '#475569', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [data, setData] = useState({ users: [], total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminService.getUsers({ search }).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', isAdmin: false });
    setError('');
    setCreateOpen(true);
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', isAdmin: u.isAdmin || false });
    setError('');
    setEditUser(u);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await adminService.createUser(form);
      setCreateOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = { name: form.name, email: form.email, isAdmin: form.isAdmin };
    if (form.password) payload.password = form.password;
    try {
      await adminService.updateUser(editUser._id, payload);
      setEditUser(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their reminders?')) return;
    await adminService.deleteUser(id);
    load();
  };

  const toggleAdmin = async (u) => {
    await adminService.updateUser(u._id, { isAdmin: !u.isAdmin });
    load();
  };

  const FormFields = ({ isCreate }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 7, color: '#ef4444', fontSize: 12 }}>{error}</div>}
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Name</label>
        <input style={INPUT_STYLE} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" required />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Email</label>
        <input style={INPUT_STYLE} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" required />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
          {isCreate ? 'Password' : 'New Password (leave blank to keep)'}
        </label>
        <div style={{ position: 'relative' }}>
          <input style={{ ...INPUT_STYLE, paddingRight: 38 }} type={showPass ? 'text' : 'password'} value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder={isCreate ? 'Min. 6 characters' : 'Leave blank to keep current'}
            required={isCreate} minLength={isCreate ? 6 : undefined} />
          <button type="button" onClick={() => setShowPass(p => !p)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', cursor: 'pointer', display: 'flex' }}>
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.isAdmin} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))}
          style={{ width: 15, height: 15, accentColor: '#6366f1' }} />
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Grant admin access</span>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="submit" disabled={saving} style={BTN({ background: '#6366f1', color: 'white', flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 })}>
          {saving ? 'Saving…' : isCreate ? 'Create User' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Users</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{data.total} total users</p>
        </div>
        <button onClick={openCreate} style={BTN({ background: '#6366f1', color: 'white' })}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 18 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          style={{ ...INPUT_STYLE, paddingLeft: 34 }} />
      </div>

      {/* Table */}
      <div style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['User', 'Email', 'Role', 'Registered', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Loading…</td></tr>
            ) : data.users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>No users found</td></tr>
            ) : data.users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Name */}
                <td style={{ padding: '12px 16px' }} onClick={() => setDetailUser(u)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{u.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: '12px 16px' }} onClick={() => setDetailUser(u)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={11} color="#475569" />
                    <span style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.01em' }}>{u.email}</span>
                  </div>
                </td>

                {/* Role */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                    background: u.isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                    color: u.isAdmin ? '#818cf8' : '#64748b' }}>
                    {u.isAdmin ? '⚡ Admin' : 'User'}
                  </span>
                </td>

                {/* Registered */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                    <Clock size={11} />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </td>

                {/* Last Login */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                    color: u.lastLoginAt ? '#4ade80' : '#475569' }}>
                    <LogIn size={11} />
                    {timeAgo(u.lastLoginAt)}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(u)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 12, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>Edit</button>
                    <button onClick={() => toggleAdmin(u)} title={u.isAdmin ? 'Remove admin' : 'Make admin'}
                      style={{ width: 28, height: 28, borderRadius: 6, background: u.isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)', color: u.isAdmin ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                      {u.isAdmin ? <ShieldOff size={13} /> : <Shield size={13} />}
                    </button>
                    {u._id !== me?._id && (
                      <button onClick={() => handleDelete(u._id)}
                        style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title="User Details">
        {detailUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {detailUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>{detailUser.name}</div>
                <div style={{ fontSize: 12, color: detailUser.isAdmin ? '#818cf8' : '#64748b', fontWeight: 600, marginTop: 2 }}>
                  {detailUser.isAdmin ? '⚡ Admin' : 'Regular User'}
                </div>
              </div>
            </div>

            {[
              { label: 'Email (login)', value: detailUser.email, icon: Mail },
              { label: 'Registered', value: new Date(detailUser.createdAt).toLocaleString(), icon: Clock },
              { label: 'Last Login', value: detailUser.lastLoginAt ? new Date(detailUser.lastLoginAt).toLocaleString() : 'Never', icon: LogIn },
              { label: 'Language', value: detailUser.preferences?.language?.toUpperCase() || '—', icon: null },
              { label: 'Theme', value: detailUser.preferences?.theme || '—', icon: null },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  {Icon && <Icon size={12} />}
                  {label}
                </div>
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{value}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={() => { setDetailUser(null); openEdit(detailUser); }}
                style={BTN({ background: '#6366f1', color: 'white', flex: 1, justifyContent: 'center' })}>
                Edit User
              </button>
              {detailUser._id !== me?._id && (
                <button onClick={() => { setDetailUser(null); handleDelete(detailUser._id); }}
                  style={BTN({ background: 'rgba(239,68,68,0.12)', color: '#ef4444', flex: 1, justifyContent: 'center' })}>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New User">
        <form onSubmit={handleCreate}><FormFields isCreate={true} /></form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <form onSubmit={handleEdit}><FormFields isCreate={false} /></form>
      </Modal>
    </div>
  );
}
