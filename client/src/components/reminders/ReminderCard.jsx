import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock, User, Volume2, VolumeX, RotateCcw, Pin, PinOff,
  CheckCircle2, Circle, MoreHorizontal, Trash2, AlarmClock,
  Copy, Check, Square,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, isOverdue, isToday } from '../../utils/date.js';
import { COLOR_TAG_VALUES, PRIORITY_COLORS, SNOOZE_OPTIONS } from '../../utils/constants.js';
import { useSpeech } from '../../hooks/useSpeech.js';
import { useClipboard } from '../../hooks/useClipboard.js';
import { detectLang, langLabel, langFlag } from '../../hooks/useLanguageDetect.js';
import Badge from '../ui/Badge.jsx';

export default function ReminderCard({ reminder, onComplete, onPin, onDelete, onSnooze, viewMode = 'grid' }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { speak, stop, speaking } = useSpeech();
  const { copy, copied } = useClipboard();

  const lang = i18n.language;
  const overdue = isOverdue(reminder);
  const tagColor = COLOR_TAG_VALUES[reminder.colorTag] || COLOR_TAG_VALUES.none;
  const isList = viewMode === 'list';

  // Auto-detect language of this reminder
  const detectedText = `${reminder.title} ${reminder.description ?? ''}`;
  const { lang: detectedLang, confidence } = detectLang(detectedText);

  const handleCardClick = (e) => {
    if (e.target.closest('[data-action]')) return;
    navigate(`/reminders/${reminder._id}`);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (speaking) { stop(); return; }
    speak(
      [reminder.title, reminder.guestName, reminder.description].filter(Boolean).join('. '),
      detectedLang
    );
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const parts = [reminder.title];
    if (reminder.guestName) parts.push(`(${reminder.guestName})`);
    if (reminder.description) parts.push(reminder.description);
    parts.push(formatDate(reminder.remindAt, lang));
    copy(parts.join(' — '));
  };

  const priorityAccent = {
    urgent: 'var(--danger)',
    high:   'var(--warning)',
    medium: 'var(--info)',
    low:    'var(--text-muted)',
  }[reminder.priority] ?? 'var(--border)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        borderRadius: 12,
        padding: isList ? '11px 14px' : '14px 14px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        gap: 11,
        alignItems: isList ? 'center' : 'stretch',
        overflow: 'hidden',
        opacity: reminder.isCompleted ? 0.55 : 1,
        /* The left accent bar via box-shadow trick — no extra DOM */
        boxShadow: hovered
          ? `inset 3px 0 0 ${priorityAccent}, 0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px var(--border)`
          : `inset 3px 0 0 ${reminder.colorTag && reminder.colorTag !== 'none' ? tagColor : 'transparent'}, 0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px var(--border)`,
        transition: 'box-shadow 180ms ease, opacity 200ms ease',
      }}
    >
      {/* Urgent pulse dot */}
      {reminder.priority === 'urgent' && !reminder.isCompleted && (
        <span style={{
          position: 'absolute', top: 12, right: isList ? 52 : 48,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--danger)',
          animation: 'pulse-ring 1.6s infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Complete toggle */}
      <button
        data-action="complete"
        onClick={e => { e.stopPropagation(); onComplete?.(reminder); }}
        style={{
          color: reminder.isCompleted ? 'var(--success)' : 'var(--text-muted)',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center',
          transition: 'color 150ms, transform 150ms',
        }}
        onMouseEnter={e => { if (!reminder.isCompleted) { e.currentTarget.style.color = 'var(--success)'; e.currentTarget.style.transform = 'scale(1.15)'; } }}
        onMouseLeave={e => { if (!reminder.isCompleted) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'scale(1)'; } }}
      >
        {reminder.isCompleted ? <CheckCircle2 size={17} /> : <Circle size={17} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: reminder.isCompleted ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            letterSpacing: '-0.01em',
          }}>
            {reminder.isPinned && (
              <Pin size={10} style={{ display: 'inline', marginRight: 5, color: 'var(--accent)', verticalAlign: 'middle' }} />
            )}
            {reminder.title}
          </span>

          <Badge
            variant={reminder.priority === 'urgent' ? 'danger' : reminder.priority === 'high' ? 'warning' : reminder.priority === 'medium' ? 'info' : 'default'}
            size="xs"
          >
            {t(`priority.${reminder.priority}`)}
          </Badge>
        </div>

        {/* Guest */}
        {reminder.guestName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
            <User size={11} />
            <span className="truncate">{reminder.guestName}</span>
          </div>
        )}

        {/* Description (grid only) */}
        {!isList && reminder.description && (
          <p style={{
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {reminder.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: isList ? 0 : 3, flexWrap: 'wrap' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500,
            color: overdue ? 'var(--danger)' : isToday(new Date(reminder.remindAt)) ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            <Clock size={10} />
            {overdue && `${t('reminder.overdue')} · `}
            {formatDate(reminder.remindAt, lang)}
          </span>

          {/* Language badge — shows auto-detected language when confidence is reasonable */}
          {confidence >= 0.65 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              color: 'var(--text-muted)',
              padding: '1px 6px', borderRadius: 20,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
            }}>
              {langFlag(detectedLang)} {langLabel(detectedLang)}
            </span>
          )}

          {reminder.voiceEnabled && <Volume2 size={10} style={{ color: 'var(--text-muted)' }} />}
          {!reminder.soundEnabled && <VolumeX size={10} style={{ color: 'var(--text-muted)' }} />}
          {reminder.repeat !== 'none' && <RotateCcw size={10} style={{ color: 'var(--text-muted)' }} />}
          {reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date() && (
            <AlarmClock size={10} style={{ color: 'var(--warning)' }} />
          )}
        </div>
      </div>

      {/* ── Quick actions (always visible on hover) ── */}
      <div data-action="actions" style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>

        {/* Clipboard copy */}
        <AnimatePresence mode="wait">
          {(hovered || copied) && (
            <motion.button
              key={copied ? 'check' : 'copy'}
              data-action="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={handleCopy}
              title="Copy reminder"
              style={{
                width: 28, height: 28, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: copied ? 'var(--success)' : 'var(--text-muted)',
                background: copied ? 'var(--success-subtle)' : 'transparent',
                cursor: 'pointer', transition: 'background 120ms, color 120ms',
              }}
              onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Speech play/stop */}
        <AnimatePresence mode="wait">
          {hovered && (
            <motion.button
              key="speech"
              data-action="speech"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12, delay: 0.04 }}
              onClick={handleSpeak}
              title={speaking ? 'Stop' : 'Read aloud'}
              style={{
                width: 28, height: 28, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: speaking ? 'var(--danger)' : 'var(--text-muted)',
                background: speaking ? 'var(--danger-subtle)' : 'transparent',
                cursor: 'pointer', transition: 'background 120ms, color 120ms',
              }}
              onMouseEnter={e => { if (!speaking) { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--accent)'; } }}
              onMouseLeave={e => { if (!speaking) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              {speaking ? <Square size={11} fill="currentColor" /> : <Volume2 size={13} />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Menu */}
        <div style={{ position: 'relative' }}>
          <button
            data-action="menu"
            onClick={() => { setMenuOpen(p => !p); setSnoozeOpen(false); }}
            style={{
              width: 28, height: 28, borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background 120ms, color 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <MoreHorizontal size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -4 }}
                transition={{ duration: 0.11 }}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
                  zIndex: 100, minWidth: 152, padding: 4,
                }}
              >
                {[
                  { label: reminder.isPinned ? t('reminder.unpin') : t('reminder.pin'), icon: reminder.isPinned ? PinOff : Pin, action: () => { onPin?.(reminder); setMenuOpen(false); } },
                  { label: t('reminder.snooze'), icon: AlarmClock, action: () => { setSnoozeOpen(true); setMenuOpen(false); } },
                  { label: t('reminder.delete'), icon: Trash2, danger: true, action: () => { onDelete?.(reminder._id); setMenuOpen(false); } },
                ].map(({ label, icon: Icon, action, danger }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', width: '100%', borderRadius: 7,
                      fontSize: 13, color: danger ? 'var(--danger)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'background 100ms, color 100ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = danger ? 'var(--danger-subtle)' : 'var(--bg-surface-2)'; e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-secondary)'; }}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {snoozeOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -4 }}
                transition={{ duration: 0.11 }}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
                  zIndex: 100, padding: 4,
                }}
              >
                {SNOOZE_OPTIONS.map(min => (
                  <button
                    key={min}
                    onClick={() => { onSnooze?.(reminder._id, min); setSnoozeOpen(false); }}
                    style={{
                      display: 'block', padding: '7px 16px', width: '100%',
                      borderRadius: 7, fontSize: 13, color: 'var(--text-secondary)',
                      cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left',
                      transition: 'background 100ms, color 100ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {t(`reminder.snooze${min}`)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(menuOpen || snoozeOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setMenuOpen(false); setSnoozeOpen(false); }} />
      )}
    </motion.div>
  );
}
