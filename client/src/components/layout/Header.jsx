import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Menu, Plus, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useUiStore from '../../store/uiStore.js';
import useReminderStore from '../../store/reminderStore.js';
import Button from '../ui/Button.jsx';

export default function Header({ title, onAddClick }) {
  const { t } = useTranslation();
  const { theme, setTheme, toggleSidebar, sidebarOpen } = useUiStore();
  const { search, setSearch } = useReminderStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      {/* Mobile menu toggle */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'background var(--t-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Title */}
      {title && (
        <h1
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>
      )}

      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: 400,
          marginLeft: title ? 'auto' : 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color var(--t-fast)',
            pointerEvents: 'none',
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={t('actions.search') + '...'}
          style={{
            width: '100%',
            height: 36,
            paddingLeft: 36,
            paddingRight: 12,
            background: 'var(--bg-surface-2)',
            border: `1.5px solid ${searchFocused ? 'var(--border-focus)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            transition: 'border-color var(--t-fast)',
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'background var(--t-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </motion.div>
      </button>

      {/* Add button */}
      {onAddClick && (
        <Button size="sm" onClick={onAddClick} icon={<Plus size={16} />}>
          {t('reminder.new')}
        </Button>
      )}
    </header>
  );
}
