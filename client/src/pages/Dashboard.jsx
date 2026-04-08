import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, Clock, CheckCircle2, AlertTriangle, TrendingUp, Plus, Zap, ArrowRight, Flame, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useReminders } from '../hooks/useReminders.js';
import Header from '../components/layout/Header.jsx';
import Modal from '../components/ui/Modal.jsx';
import ReminderForm from '../components/reminders/ReminderForm.jsx';
import ReminderCard from '../components/reminders/ReminderCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import { reminderService } from '../services/reminderService.js';

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, accent, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? color + '55' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'default',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 8px 32px ${color}18` : '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at top right, ${color}0a 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: color + '18',
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 34, fontWeight: 800,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.04em',
          color: value > 0 ? color : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {value === undefined || value === null ? <Spinner size={22} /> : value}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section Header ────────────────────────────────────── */
function SectionHead({ title, linkTo, linkLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {linkTo && (
        <Link
          to={linkTo}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            textDecoration: 'none', opacity: 0.8,
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
        >
          {linkLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

/* ─── Greeting ──────────────────────────────────────────── */
function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.goodMorning');
  if (h < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
}

/* ─── Week strip ────────────────────────────────────────── */
function WeekStrip({ upcoming, lang }) {
  const dayNames = {
    ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
    uz: ['Du','Se','Ch','Pa','Ju','Sh','Ya'],
  };
  const names = dayNames[lang] || dayNames.en;
  const today = new Date();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + 1 + i);
        const isCurrentDay = d.toDateString() === today.toDateString();
        const count = upcoming.filter(r => new Date(r.remindAt).toDateString() === d.toDateString()).length;

        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '10px 4px',
            borderRadius: 12,
            background: isCurrentDay ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            border: `1px solid ${isCurrentDay ? 'var(--border-focus)' : 'var(--border)'}`,
            transition: 'all 150ms',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: isCurrentDay ? 'var(--accent)' : 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {names[i]}
            </span>
            <span style={{
              fontSize: 16, fontWeight: 700,
              color: isCurrentDay ? 'var(--accent)' : 'var(--text-primary)',
            }}>
              {d.getDate()}
            </span>
            <div style={{ height: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {count > 0 && (
                <span style={{
                  width: count > 1 ? 14 : 6, height: 6, borderRadius: 3,
                  background: isCurrentDay ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  transition: 'width 200ms',
                }}>
                  {count > 1 ? count : ''}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Priority breakdown ─────────────────────────────────── */
function PriorityBar({ stats, t }) {
  if (!stats?.byPriority?.length) return null;
  const total = stats.byPriority.reduce((s, x) => s + x.count, 0);
  const colors = { low: '#64748b', medium: 'var(--info)', high: 'var(--warning)', urgent: 'var(--danger)' };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '18px 20px',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
        {t('dashboard.priorityBreakdown')}
      </p>
      {/* Progress bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 12 }}>
        {stats.byPriority.map(({ _id: p, count }) => (
          <div key={p} style={{
            flex: count,
            background: colors[p],
            borderRadius: 6,
            transition: 'flex 400ms ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {stats.byPriority.map(({ _id: p, count }) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[p], display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {t(`priority.${p}`)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick tip card ─────────────────────────────────────── */
function TipCard({ icon: Icon, color, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '14px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: color + '18',
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={color} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, paddingTop: 1 }}>
        {text}
      </p>
    </motion.div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { create, toggleComplete, togglePin, snooze, remove } = useReminders();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const lang = i18n.language?.split('-')[0] || 'en';

  useEffect(() => {
    reminderService.getStats().then(setStats).catch(() => {});
    setLoadingUpcoming(true);
    reminderService
      .getReminders({ filter: 'all', sort: 'remindAt', limit: 5 })
      .then((d) => setUpcoming(d.reminders || []))
      .catch(() => {})
      .finally(() => setLoadingUpcoming(false));
    reminderService
      .getReminders({ filter: 'completed', sort: '-updatedAt', limit: 3 })
      .then((d) => setCompleted(d.reminders || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await create(data);
      setCreateOpen(false);
      const [d, d2] = await Promise.all([
        reminderService.getStats(),
        reminderService.getReminders({ filter: 'all', sort: 'remindAt', limit: 5 }),
      ]);
      setStats(d);
      setUpcoming(d2.reminders || []);
    } finally {
      setCreating(false);
    }
  };

  const STAT_CARDS = [
    { label: t('dashboard.total'),     value: stats?.total,     icon: Bell,          color: 'var(--accent)' },
    { label: t('dashboard.today'),     value: stats?.today,     icon: Clock,         color: 'var(--info)'   },
    { label: t('dashboard.upcoming'),  value: stats?.upcoming,  icon: TrendingUp,    color: 'var(--success)'},
    { label: t('dashboard.overdue'),   value: stats?.overdue,   icon: AlertTriangle, color: 'var(--danger)' },
    { label: t('dashboard.completed'), value: stats?.completed, icon: CheckCircle2,  color: 'var(--warning)'},
  ];

  const TIPS = [
    { icon: Bell,       color: '#B9FF66', key: 'tip1' },
    { icon: Zap,        color: '#f59e0b', key: 'tip2' },
    { icon: TrendingUp, color: '#34d399', key: 'tip3' },
  ];

  const dateStr = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Header title={t('dashboard.title')} onAddClick={() => setCreateOpen(true)} />

      <div
        className="inner-page-content"
        style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}
      >

        {/* ── Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}
        >
          <div>
            <h2 style={{
              fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800,
              letterSpacing: '-0.03em', color: 'var(--text-primary)',
              lineHeight: 1.2, marginBottom: 4,
            }}>
              {getGreeting(t)}, {user?.name?.split(' ')[0]}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'capitalize' }}>
              {dateStr}
            </p>
          </div>
          {stats?.overdue > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
                background: 'var(--danger)18',
                border: '1px solid var(--danger)44',
                fontSize: 12, fontWeight: 700, color: 'var(--danger)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <Flame size={13} />
              {stats.overdue} {t('dashboard.overdue')}
            </motion.div>
          )}
        </motion.div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} {...card} index={i} />
          ))}
        </div>

        {/* ── Priority bar ── */}
        <PriorityBar stats={stats} t={t} />

        {/* ── This week ── */}
        <div>
          <SectionHead title={t('dashboard.thisWeek')} />
          <WeekStrip upcoming={upcoming} lang={lang} />
        </div>

        {/* ── Upcoming reminders ── */}
        <div>
          <SectionHead
            title={t('dashboard.upcomingReminders')}
            linkTo="/reminders"
            linkLabel={t('dashboard.viewAll')}
          />

          {loadingUpcoming ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner size={26} />
            </div>
          ) : upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '36px 24px', gap: 14, textAlign: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-subtle-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={22} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {t('reminder.noReminders')}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {t('reminder.noRemindersHint')}
                </p>
              </div>
              <Button icon={<Plus size={14} />} size="sm" onClick={() => setCreateOpen(true)}>
                {t('dashboard.quickAdd')}
              </Button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {upcoming.map((reminder, idx) => (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <ReminderCard
                      reminder={reminder}
                      viewMode="list"
                      onComplete={(r) => toggleComplete(r).then(() => {})}
                      onPin={(r) => togglePin(r).then(() => {})}
                      onDelete={remove}
                      onSnooze={snooze}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── All done banner ── */}
        <AnimatePresence>
          {stats && stats.overdue === 0 && stats.total > 0 && (
            <motion.div
              key="all-done"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(52,211,153,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={18} color="var(--success)" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)' }}>{t('dashboard.allDone')}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('dashboard.allDoneHint')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recently completed ── */}
        {completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <SectionHead
              title={t('dashboard.completedRecently')}
              linkTo="/reminders"
              linkLabel={t('dashboard.viewAll')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.map((reminder) => (
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
          </motion.div>
        )}

        {/* ── Tips ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <SectionHead title={t('dashboard.tipTitle')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {TIPS.map(({ icon, color, key }, i) => (
              <TipCard key={key} icon={icon} color={color} text={t(`dashboard.${key}`)} delay={0.35 + i * 0.06} />
            ))}
          </div>
        </motion.div>

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
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(108,99,255,0.45)',
          cursor: 'pointer', zIndex: 50,
          border: 'none',
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
