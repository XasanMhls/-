import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { reminderService } from '../services/reminderService.js';
import {
  getCalendarDays, isSameDay, isSameMonth, isToday, format,
  addMonths, subMonths,
} from '../utils/date.js';
import { COLOR_TAG_VALUES } from '../utils/constants.js';

const WEEKDAYS = {
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
};

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

export default function Calendar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showDayPanel, setShowDayPanel] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const lang = i18n.language;
  const weekdays = WEEKDAYS[lang] || WEEKDAYS.en;

  useEffect(() => {
    reminderService.getReminders({ limit: 200 })
      .then((d) => setReminders(d.reminders || []))
      .catch(() => {});
  }, []);

  const remindersOnDay = (day) =>
    reminders.filter((r) => isSameDay(new Date(r.remindAt), day));

  const selectedDayReminders = remindersOnDay(selectedDay);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    if (isMobile) setShowDayPanel(true);
  };

  const pad = isMobile ? '16px' : '24px 28px';

  const DayList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {format(selectedDay, 'EEEE, d MMMM')}
        </h3>
        {isMobile && (
          <button onClick={() => setShowDayPanel(false)}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedDayReminders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}
          >
            <Bell size={26} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 'var(--text-sm)' }}>{t('calendar.noEvents')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {selectedDayReminders.map((r) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/reminders/${r._id}`)}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${COLOR_TAG_VALUES[r.colorTag] || 'var(--accent)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  opacity: r.isCompleted ? 0.55 : 1,
                  transition: 'box-shadow var(--t-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, textDecoration: r.isCompleted ? 'line-through' : 'none' }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {format(new Date(r.remindAt), 'HH:mm')}
                  {r.guestName && ` · ${r.guestName}`}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Header title={t('calendar.title')} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>

        {/* Calendar grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: pad }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isMobile ? 16 : 24 }}>
            <h2 style={{ fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em', flex: 1, textTransform: 'capitalize' }}>
              {format(currentDate, 'LLLL yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background var(--t-fast)', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--border-focus)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {t('calendar.today')}
            </button>
            <button
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background var(--t-fast)', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? 2 : 4, marginBottom: isMobile ? 4 : 8 }}>
            {weekdays.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? 2 : 4 }}>
            {days.map((day) => {
              const dayReminders = remindersOnDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDay);
              const isTodayDay = isToday(day);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    aspectRatio: isMobile ? '1' : '1',
                    minHeight: isMobile ? 44 : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '4px 2px' : '8px 4px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent)' : isTodayDay ? 'var(--border-focus)' : 'transparent',
                    background: isSelected
                      ? 'var(--accent-subtle)'
                      : isTodayDay
                      ? 'var(--bg-surface-2)'
                      : 'transparent',
                    cursor: 'pointer',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    transition: 'all var(--t-fast)',
                    gap: 3,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isTodayDay) e.currentTarget.style.background = 'transparent';
                    else if (isTodayDay && !isSelected) e.currentTarget.style.background = 'var(--bg-surface-2)';
                  }}
                >
                  <span style={{
                    fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-sm)',
                    fontWeight: isTodayDay || isSelected ? 700 : 400,
                    color: isSelected ? 'var(--accent)' : isTodayDay ? 'var(--text-primary)' : 'var(--text-secondary)',
                    lineHeight: 1,
                  }}>
                    {format(day, 'd')}
                  </span>

                  {dayReminders.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {dayReminders.slice(0, isMobile ? 2 : 3).map((r, i) => (
                        <span key={i} style={{
                          width: isMobile ? 4 : 5,
                          height: isMobile ? 4 : 5,
                          borderRadius: '50%',
                          background: COLOR_TAG_VALUES[r.colorTag] || 'var(--accent)',
                          flexShrink: 0,
                          display: 'block',
                        }} />
                      ))}
                      {dayReminders.length > (isMobile ? 2 : 3) && (
                        <span style={{ fontSize: 8, color: 'var(--text-muted)', lineHeight: 1 }}>
                          +{dayReminders.length - (isMobile ? 2 : 3)}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Mobile: inline day panel below calendar */}
          {isMobile && showDayPanel && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20,
                padding: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <DayList />
            </motion.div>
          )}
        </div>

        {/* Desktop: side panel */}
        {!isMobile && (
          <div style={{
            width: 280,
            borderLeft: '1px solid var(--border)',
            overflowY: 'auto',
            padding: '24px 20px',
            flexShrink: 0,
          }}>
            <DayList />
          </div>
        )}
      </div>
    </div>
  );
}
