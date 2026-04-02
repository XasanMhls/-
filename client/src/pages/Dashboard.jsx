import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, Clock, CheckCircle2, AlertTriangle, TrendingUp, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useReminders } from '../hooks/useReminders.js';
import Header from '../components/layout/Header.jsx';
import Modal from '../components/ui/Modal.jsx';
import ReminderForm from '../components/reminders/ReminderForm.jsx';
import ReminderCard from '../components/reminders/ReminderCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatDate, isToday, isTomorrow } from '../utils/date.js';
import { reminderService } from '../services/reminderService.js';

function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          {value ?? <Spinner size={24} />}
        </div>
      </div>
    </motion.div>
  );
}

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.goodMorning');
  if (h < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { create, toggleComplete, togglePin, snooze, remove } = useReminders();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    reminderService.getStats().then(setStats).catch(() => {});
    setLoadingUpcoming(true);
    reminderService
      .getReminders({ filter: 'all', sort: 'remindAt', limit: 5 })
      .then((d) => setUpcoming(d.reminders || []))
      .catch(() => {})
      .finally(() => setLoadingUpcoming(false));
  }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await create(data);
      setCreateOpen(false);
      const d = await reminderService.getStats();
      setStats(d);
      const d2 = await reminderService.getReminders({ filter: 'all', sort: 'remindAt', limit: 5 });
      setUpcoming(d2.reminders || []);
    } finally {
      setCreating(false);
    }
  };

  const STAT_CARDS = [
    { label: t('dashboard.total'), value: stats?.total, icon: Bell, color: 'var(--accent)' },
    { label: t('dashboard.today'), value: stats?.today, icon: Clock, color: 'var(--info)' },
    { label: t('dashboard.upcoming'), value: stats?.upcoming, icon: TrendingUp, color: 'var(--success)' },
    { label: t('dashboard.overdue'), value: stats?.overdue, icon: AlertTriangle, color: 'var(--danger)' },
    { label: t('dashboard.completed'), value: stats?.completed, icon: CheckCircle2, color: 'var(--warning)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Header title={t('dashboard.title')} onAddClick={() => setCreateOpen(true)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}
        >
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
            {getGreeting(t)}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {STAT_CARDS.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        {/* Priority breakdown */}
        {stats?.byPriority?.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 28 }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
              {t('dashboard.priorityBreakdown')}
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.byPriority.map(({ _id: priority, count }) => {
                const colors = { low: 'var(--text-muted)', medium: 'var(--info)', high: 'var(--warning)', urgent: 'var(--danger)' };
                return (
                  <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[priority], display: 'inline-block' }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {t(`priority.${priority}`)}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {t('dashboard.upcomingReminders')}
            </h3>
            <Link to="/reminders" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 500 }}>
              {t('actions.back') === 'Назад' ? 'Все напоминания →' : 'View all →'}
            </Link>
          </div>

          {loadingUpcoming ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner size={28} />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<Bell size={28} />}
              title={t('reminder.noReminders')}
              description={t('reminder.noRemindersHint')}
              action={
                <button
                  onClick={() => setCreateOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  {t('dashboard.quickAdd')}
                </button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  viewMode="list"
                  onComplete={(r) => toggleComplete(r).then(() => {})}
                  onPin={(r) => togglePin(r).then(() => {})}
                  onDelete={remove}
                  onSnooze={snooze}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('reminder.new')} maxWidth={600}>
        <ReminderForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
