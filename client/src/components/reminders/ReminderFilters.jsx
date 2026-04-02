import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FILTERS } from '../../utils/constants.js';
import useReminderStore from '../../store/reminderStore.js';

export default function ReminderFilters({ onFilterChange }) {
  const { t } = useTranslation();
  const { filter, setFilter } = useReminderStore();

  const handleFilter = (f) => {
    setFilter(f);
    onFilterChange?.(f);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        padding: '3px',
        scrollbarWidth: 'none',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        width: 'fit-content',
      }}
    >
      {FILTERS.map((f) => {
        const isActive = filter === f;
        const isDanger = f === 'overdue';
        return (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={{
              position: 'relative',
              padding: '5px 13px',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? isDanger ? 'var(--danger)' : 'var(--text-primary)'
                : 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 150ms ease',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  background: isDanger ? 'var(--danger-subtle)' : 'var(--bg-surface-3)',
                  border: '1px solid',
                  borderColor: isDanger ? 'rgba(240,78,101,0.2)' : 'var(--border)',
                  zIndex: -1,
                }}
              />
            )}
            {t(`filters.${f}`)}
          </button>
        );
      })}
    </div>
  );
}
