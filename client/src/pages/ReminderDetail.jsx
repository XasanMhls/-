import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Trash2, CheckCircle2, Circle, Pin, PinOff,
  AlarmClock, Volume2, VolumeX, RotateCcw, Clock, User, Play
} from 'lucide-react';
import { useReminders } from '../hooks/useReminders.js';
import { reminderService } from '../services/reminderService.js';
import ReminderForm from '../components/reminders/ReminderForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatFull, formatRelative, isOverdue } from '../utils/date.js';
import { COLOR_TAG_VALUES, PRIORITY_COLORS, SNOOZE_OPTIONS } from '../utils/constants.js';
import { voice } from '../voice/VoiceProvider.js';
import { playSound } from '../voice/soundEngine.js';

export default function ReminderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { update, remove, toggleComplete, togglePin, snooze } = useReminders();
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);

  useEffect(() => {
    setLoading(true);
    reminderService.getById(id)
      .then(({ reminder }) => setReminder(reminder))
      .catch(() => navigate('/reminders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data) => {
    setUpdating(true);
    try {
      const updated = await update(id, data);
      setReminder(updated);
      setEditOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('actions.delete') + '?')) return;
    await remove(id);
    navigate('/reminders');
  };

  const handleToggleComplete = async () => {
    const updated = await toggleComplete(reminder);
    setReminder(updated);
  };

  const handleTogglePin = async () => {
    const updated = await togglePin(reminder);
    setReminder(updated);
  };

  const handleSnooze = async (minutes) => {
    const updated = await snooze(id, minutes);
    setReminder(updated);
  };

  const testVoice = async () => {
    setTestingVoice(true);
    try {
      if (reminder.soundEnabled) playSound(reminder.sound || 'chime');
      if (reminder.voiceEnabled) await voice.speakReminder(reminder);
    } finally {
      setTestingVoice(false);
    }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={36} />
    </div>
  );
  if (!reminder) return null;

  const overdue = isOverdue(reminder);
  const tagColor = COLOR_TAG_VALUES[reminder.colorTag] || 'transparent';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          marginBottom: 24,
          cursor: 'pointer',
          transition: 'color var(--t-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft size={16} />
        {t('actions.back')}
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderLeft: reminder.colorTag !== 'none' ? `4px solid ${tagColor}` : undefined,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            maxWidth: 720,
          }}
        >
          {/* Header */}
          <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <button
                onClick={handleToggleComplete}
                style={{ color: reminder.isCompleted ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', marginTop: 3, flexShrink: 0, transition: 'color var(--t-fast)' }}
                onMouseEnter={(e) => !reminder.isCompleted && (e.currentTarget.style.color = 'var(--success)')}
                onMouseLeave={(e) => !reminder.isCompleted && (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {reminder.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    textDecoration: reminder.isCompleted ? 'line-through' : 'none',
                    opacity: reminder.isCompleted ? 0.6 : 1,
                  }}
                >
                  {reminder.title}
                </h1>
                {reminder.guestName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    <User size={14} />
                    {reminder.guestName}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Badge
                  variant={reminder.priority === 'urgent' ? 'danger' : reminder.priority === 'high' ? 'warning' : 'default'}
                  size="sm"
                >
                  {t(`priority.${reminder.priority}`)}
                </Badge>
                {reminder.repeat !== 'none' && (
                  <Badge variant="info" size="sm">{t(`repeat.${reminder.repeat}`)}</Badge>
                )}
              </div>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={15} color={overdue ? 'var(--danger)' : 'var(--text-muted)'} />
              <span style={{ fontSize: 'var(--text-sm)', color: overdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 500 }}>
                {formatFull(reminder.remindAt, i18n.language)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                · {formatRelative(reminder.remindAt, i18n.language)}
              </span>
              {overdue && <Badge variant="danger" size="xs" dot>{t('reminder.overdue')}</Badge>}
            </div>

            {reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date() && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlarmClock size={14} color="var(--warning)" />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
                  {t('reminder.snoozeUntil')}: {formatFull(reminder.snoozeUntil, i18n.language)}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reminder.description && (
              <div>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Description
                </h4>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {reminder.description}
                </p>
              </div>
            )}

            {/* Settings grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { label: 'Voice', icon: reminder.voiceEnabled ? Volume2 : VolumeX, value: reminder.voiceEnabled ? 'On' : 'Off', color: reminder.voiceEnabled ? 'var(--success)' : 'var(--text-muted)' },
                { label: 'Sound', value: reminder.soundEnabled ? t(`sound.${reminder.sound}`) : 'Off', color: 'var(--text-secondary)' },
                { label: 'Language', value: reminder.language === 'auto' ? 'Auto' : reminder.language.toUpperCase(), color: 'var(--text-secondary)' },
                { label: 'Timezone', value: reminder.timezone, color: 'var(--text-secondary)' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    padding: '14px 16px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Trigger history */}
            {reminder.triggerHistory?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Trigger history ({reminder.triggerHistory.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reminder.triggerHistory.slice(-5).reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                      {formatFull(h.triggeredAt, i18n.language)}
                      <Badge size="xs">{h.method}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button onClick={() => setEditOpen(true)} variant="secondary">
              {t('actions.edit')}
            </Button>
            <Button onClick={handleTogglePin} variant="secondary" icon={reminder.isPinned ? <PinOff size={15} /> : <Pin size={15} />}>
              {reminder.isPinned ? t('reminder.unpin') : t('reminder.pin')}
            </Button>

            {/* Snooze */}
            {!reminder.isCompleted && (
              <div style={{ display: 'flex', gap: 6 }}>
                {SNOOZE_OPTIONS.map((min) => (
                  <Button key={min} variant="accent" size="sm" onClick={() => handleSnooze(min)}>
                    +{min}m
                  </Button>
                ))}
              </div>
            )}

            {/* Test voice */}
            {(reminder.voiceEnabled || reminder.soundEnabled) && (
              <Button
                variant="accent"
                size="sm"
                icon={<Play size={14} />}
                onClick={testVoice}
                loading={testingVoice}
              >
                {t('reminder.testVoice')}
              </Button>
            )}

            <Button variant="danger" onClick={handleDelete} icon={<Trash2 size={15} />} style={{ marginLeft: 'auto' }}>
              {t('actions.delete')}
            </Button>
          </div>
        </div>
      </motion.div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('reminder.edit')} maxWidth={600}>
        <ReminderForm
          initial={reminder}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          loading={updating}
        />
      </Modal>
    </div>
  );
}
