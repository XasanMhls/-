import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Plus, Bell, CheckCircle2, Clock, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { useReminders } from '../hooks/useReminders.js';
import Header from '../components/layout/Header.jsx';
import ReminderCard from '../components/reminders/ReminderCard.jsx';
import ReminderForm from '../components/reminders/ReminderForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import useReminderStore from '../store/reminderStore.js';

const FILTER_META = {
  all:       { icon: Bell,          color: 'var(--accent)'   },
  today:     { icon: Clock,         color: 'var(--info)'     },
  upcoming:  { icon: TrendingUp,    color: 'var(--success)'  },
  overdue:   { icon: AlertTriangle, color: 'var(--danger)'   },
  completed: { icon: CheckCircle2,  color: 'var(--warning)'  },
};

export default function Reminders() {
  const { t } = useTranslation();
  const {
    reminders, loading, pagination,
    filter, viewMode, setViewMode,
    fetch, create, update, remove, toggleComplete, togglePin, snooze,
  } = useReminders();
  const { setFilter } = useReminderStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetch(); }, [filter]);

  const handleCreate = async (data) => {
    setCreating(true);
    try { await create(data); setCreateOpen(false); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('actions.delete') + '?')) await remove(id);
  };

  const filters = ['all', 'today', 'upcoming', 'overdue', 'completed'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Header title={t('nav.reminders')} onAddClick={() => setCreateOpen(true)} />

      <div
        className="inner-page-content"
        style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}
      >

        {/* ── Filter bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="filter-bar-inner" style={{
            display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {filters.map(f => {
              const meta = FILTER_META[f];
              const Icon = meta.icon;
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 7,
                    fontSize: 13, fontWeight: active ? 600 : 450,
                    cursor: 'pointer',
                    background: active ? 'var(--bg-surface-3)' : 'transparent',
                    color: active ? meta.color : 'var(--text-muted)',
                    border: active ? `1px solid var(--border)` : '1px solid transparent',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 160ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = meta.color; e.currentTarget.style.background = 'var(--bg-surface-2)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <Icon size={13} />
                  {t(`filter.${f}`) || f}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex', gap: 2,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 3,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6,
                  background: viewMode === mode ? 'var(--bg-surface-3)' : 'transparent',
                  color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                  border: viewMode === mode ? '1px solid var(--border)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 160ms ease',
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Count badge ── */}
        {pagination && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}>
              {pagination.total} {t('reminders.count', { count: '' }).trim() || 'reminders'}
            </span>
            {pagination.total > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 8px', borderRadius: 20,
                background: FILTER_META[filter]?.color + '18',
                color: FILTER_META[filter]?.color,
                fontSize: 11, fontWeight: 700,
              }}>
                {filter !== 'all' ? t(`filter.${filter}`) || filter : 'All'}
              </span>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Spinner size={28} />
          </div>
        ) : reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '80px 24px', gap: 20, textAlign: 'center',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-subtle-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={28} color="var(--accent)" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {t('reminder.noReminders')}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
                {t('reminder.noRemindersHint')}
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} icon={<Plus size={15} />}>
              {t('reminder.new')}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid' ? 'reminders-grid' : ''}
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(300px,1fr))' : undefined,
              flexDirection: 'column',
              gap: viewMode === 'grid' ? 12 : 8,
            }}
          >
            <AnimatePresence mode="popLayout">
              {reminders.map(r => (
                <ReminderCard
                  key={r._id}
                  reminder={r}
                  viewMode={viewMode}
                  onComplete={toggleComplete}
                  onPin={togglePin}
                  onDelete={handleDelete}
                  onSnooze={snooze}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fab"
        onClick={() => setCreateOpen(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 50, height: 50, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(108,99,255,0.45)',
          cursor: 'pointer', zIndex: 50,
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
      </motion.button>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('reminder.new')} maxWidth={600}>
        <ReminderForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={creating} />
      </Modal>
    </div>
  );
}
