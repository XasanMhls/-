import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Plus, SlidersHorizontal } from 'lucide-react';
import { useReminders } from '../hooks/useReminders.js';
import Header from '../components/layout/Header.jsx';
import ReminderCard from '../components/reminders/ReminderCard.jsx';
import ReminderFilters from '../components/reminders/ReminderFilters.jsx';
import ReminderForm from '../components/reminders/ReminderForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import useReminderStore from '../store/reminderStore.js';

export default function Reminders() {
  const { t } = useTranslation();
  const {
    reminders, loading, pagination,
    filter, search, sort, viewMode,
    setViewMode,
    fetch, create, update, remove, toggleComplete, togglePin, snooze,
  } = useReminders();

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch();
  }, [filter, search]);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await create(data);
      setCreateOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('actions.delete') + '?')) {
      await remove(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Header title={t('nav.reminders')} onAddClick={() => setCreateOpen(true)} />

      <div className="inner-page-content" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Filters + view toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ReminderFilters onFilterChange={() => fetch()} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'var(--accent-subtle)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                border: viewMode === 'grid' ? '1px solid var(--border-focus)' : '1px solid transparent',
                transition: 'all var(--t-fast)',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'list' ? 'var(--accent-subtle)' : 'transparent',
                color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                border: viewMode === 'list' ? '1px solid var(--border-focus)' : '1px solid transparent',
                transition: 'all var(--t-fast)',
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Count */}
        {pagination && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
            {pagination.total} reminder{pagination.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner size={32} />
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={t('reminder.noReminders')}
            description={t('reminder.noRemindersHint')}
            action={
              <Button onClick={() => setCreateOpen(true)} icon={<Plus size={15} />}>
                {t('reminder.new')}
              </Button>
            }
          />
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid' ? 'reminders-grid' : ''}
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: 12,
            }}
          >
            <AnimatePresence mode="popLayout">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
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
      <button
        onClick={() => setCreateOpen(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          // fab class handles mobile position override
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-accent)',
          cursor: 'pointer',
          transition: 'transform var(--t-fast), box-shadow var(--t-fast)',
          zIndex: 50,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 32px rgba(108,99,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
        }}
      >
        <Plus size={22} />
      </button>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('reminder.new')} maxWidth={600}>
        <ReminderForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={creating} />
      </Modal>
    </div>
  );
}
