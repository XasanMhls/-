import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock, User, Volume2, VolumeX, RotateCcw, Pin, PinOff,
  CheckCircle2, Circle, MoreHorizontal, Trash2, AlarmClock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, isOverdue, isToday } from '../../utils/date.js';
import { COLOR_TAG_VALUES, PRIORITY_COLORS, SNOOZE_OPTIONS } from '../../utils/constants.js';
import Badge from '../ui/Badge.jsx';

export default function ReminderCard({ reminder, onComplete, onPin, onDelete, onSnooze, viewMode = 'grid' }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  const lang = i18n.language;
  const overdue = isOverdue(reminder);
  const tagColor = COLOR_TAG_VALUES[reminder.colorTag] || COLOR_TAG_VALUES.none;

  const handleCardClick = (e) => {
    if (e.target.closest('[data-action]')) return;
    navigate(`/reminders/${reminder._id}`);
  };

  const isList = viewMode === 'list';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={handleCardClick}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: isList ? '12px 16px' : '14px 16px',
        cursor: 'pointer',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        gap: 12,
        alignItems: isList ? 'center' : 'stretch',
        overflow: 'hidden',
        borderLeft: reminder.colorTag && reminder.colorTag !== 'none' ? `3px solid ${tagColor}` : undefined,
        opacity: reminder.isCompleted ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Urgent pulse */}
      {reminder.priority === 'urgent' && !reminder.isCompleted && (
        <span style={{
          position: 'absolute',
          top: 14,
          right: isList ? 50 : 46,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--danger)',
          animation: 'pulse-ring 1.6s infinite',
        }} />
      )}

      {/* Complete toggle */}
      <button
        data-action="complete"
        onClick={(e) => { e.stopPropagation(); onComplete?.(reminder); }}
        style={{
          color: reminder.isCompleted ? 'var(--success)' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'color 150ms ease, transform 150ms ease',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!reminder.isCompleted) {
            e.currentTarget.style.color = 'var(--success)';
            e.currentTarget.style.transform = 'scale(1.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!reminder.isCompleted) {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {reminder.isCompleted ? <CheckCircle2 size={17} /> : <Circle size={17} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: reminder.isCompleted ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {reminder.isPinned && <Pin size={11} style={{ display: 'inline', marginRight: 5, color: 'var(--accent)', verticalAlign: 'middle' }} />}
            {reminder.title}
          </span>

          <Badge
            variant={
              reminder.priority === 'urgent' ? 'danger' :
              reminder.priority === 'high' ? 'warning' :
              reminder.priority === 'medium' ? 'info' : 'default'
            }
            size="xs"
          >
            {t(`priority.${reminder.priority}`)}
          </Badge>
        </div>

        {reminder.guestName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            <User size={12} />
            <span className="truncate">{reminder.guestName}</span>
          </div>
        )}

        {!isList && reminder.description && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.55,
          }}>
            {reminder.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: isList ? 0 : 2 }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: overdue ? 'var(--danger)' : isToday(new Date(reminder.remindAt)) ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            <Clock size={11} />
            {overdue && `${t('reminder.overdue')} · `}
            {formatDate(reminder.remindAt, lang)}
          </span>

          {reminder.voiceEnabled && <Volume2 size={11} style={{ color: 'var(--text-muted)' }} />}
          {!reminder.soundEnabled && <VolumeX size={11} style={{ color: 'var(--text-muted)' }} />}
          {reminder.repeat !== 'none' && <RotateCcw size={11} style={{ color: 'var(--text-muted)' }} />}
          {reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date() && (
            <AlarmClock size={11} style={{ color: 'var(--warning)' }} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        data-action="actions"
        style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative' }}>
          <button
            data-action="menu"
            onClick={() => { setMenuOpen((p) => !p); setSnoozeOpen(false); }}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
                zIndex: 100,
                minWidth: 160,
                overflow: 'hidden',
                padding: '4px',
              }}
            >
              {[
                {
                  label: reminder.isPinned ? t('reminder.unpin') : t('reminder.pin'),
                  icon: reminder.isPinned ? PinOff : Pin,
                  action: () => { onPin?.(reminder); setMenuOpen(false); },
                },
                {
                  label: t('reminder.snooze'),
                  icon: AlarmClock,
                  action: () => { setSnoozeOpen(true); setMenuOpen(false); },
                },
                {
                  label: t('reminder.delete'),
                  icon: Trash2,
                  danger: true,
                  action: () => { onDelete?.(reminder._id); setMenuOpen(false); },
                },
              ].map(({ label, icon: Icon, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    color: danger ? 'var(--danger)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'background 120ms ease, color 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = danger ? 'var(--danger-subtle)' : 'var(--bg-surface-2)';
                    e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-secondary)';
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </motion.div>
          )}

          {snoozeOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
                zIndex: 100,
                overflow: 'hidden',
                padding: '4px',
              }}
            >
              {SNOOZE_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => { onSnooze?.(reminder._id, min); setSnoozeOpen(false); }}
                  style={{
                    display: 'block',
                    padding: '7px 16px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    transition: 'background 120ms ease, color 120ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {t(`reminder.snooze${min}`)}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {(menuOpen || snoozeOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => { setMenuOpen(false); setSnoozeOpen(false); }}
        />
      )}
    </motion.div>
  );
}
