import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Sun, Moon, Volume2, Square, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUiStore from '../../store/uiStore.js';
import useReminderStore from '../../store/reminderStore.js';
import { useSpeech } from '../../hooks/useSpeech.js';
import { langLabel, langFlag } from '../../hooks/useLanguageDetect.js';
import Button from '../ui/Button.jsx';

export default function Header({ title, onAddClick }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, toggleSidebar, sidebarOpen } = useUiStore();
  const { search, setSearch } = useReminderStore();
  const { speaking, stop } = useSpeech();
  const [searchFocused, setSearchFocused] = useState(false);

  const isDark = theme !== 'light' && !(theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const uiLang = (i18n.language || 'en').split('-')[0];

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 5,
    }}>
      {/* Mobile menu toggle */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            width: 34, height: 34, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, color: 'var(--text-secondary)',
            cursor: 'pointer', transition: 'background var(--t-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Menu size={17} />
        </button>
      )}

      {/* Title */}
      {title && (
        <h1 style={{
          fontSize: 15, fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {title}
        </h1>
      )}

      {/* Search */}
      <div
        className="header-search"
        style={{ flex: 1, maxWidth: 380, marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <Search
          size={14}
          style={{
            position: 'absolute', left: 11,
            color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color var(--t-fast)', pointerEvents: 'none',
          }}
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={t('actions.search') + '...'}
          style={{
            width: '100%', height: 34,
            paddingLeft: 32, paddingRight: 10,
            background: 'var(--bg-surface-2)',
            border: `1.5px solid ${searchFocused ? 'var(--border-focus)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: 13, outline: 'none',
            transition: 'border-color var(--t-fast)',
          }}
        />
      </div>

      {/* ── Language badge ── */}
      <div
        title={`UI language: ${uiLang.toUpperCase()}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 20,
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent-subtle-hover)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          color: 'var(--accent-text)',
          cursor: 'default', userSelect: 'none',
          flexShrink: 0,
        }}
        className="hide-on-mobile"
      >
        <span style={{ fontSize: 13 }}>{langFlag(uiLang)}</span>
        {langLabel(uiLang)}
      </div>

      {/* ── Speech indicator (shown while speaking) ── */}
      <AnimatePresence>
        {speaking && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            onClick={stop}
            title="Stop speech"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 20,
              background: 'var(--danger-subtle)',
              border: '1px solid rgba(240,78,101,0.25)',
              color: 'var(--danger)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Square size={11} fill="currentColor" />
            <span className="hide-on-mobile">Stop</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Light mode' : 'Dark mode'}
        style={{
          width: 34, height: 34, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, color: 'var(--text-secondary)',
          cursor: 'pointer', transition: 'background var(--t-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </button>

      {/* Add button */}
      {onAddClick && (
        <>
          <Button size="sm" onClick={onAddClick} icon={<Plus size={15} />} className="hide-on-mobile">
            {t('reminder.new')}
          </Button>
          <button
            onClick={onAddClick}
            className="show-on-mobile"
            style={{
              display: 'none', width: 32, height: 32,
              borderRadius: 8, background: 'var(--accent)',
              color: '#fff', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            <Plus size={16} />
          </button>
        </>
      )}
    </header>
  );
}
