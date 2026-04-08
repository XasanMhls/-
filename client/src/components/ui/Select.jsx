import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = forwardRef(function Select(
  { label, error, options = [], fullWidth = true, containerStyle = {}, style = {}, value, onChange, disabled, ...props },
  _ref
) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (opt) => {
    if (onChange) {
      // Simulate native event so existing code works unchanged
      onChange({ target: { value: opt.value } });
    }
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown' && !open) setOpen(true);
  };

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, width: fullWidth ? '100%' : undefined, position: 'relative', ...containerStyle }}
    >
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', userSelect: 'none' }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: fullWidth ? '100%' : undefined,
          height: 44,
          padding: '0 12px 0 14px',
          background: open ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
          border: `1.5px solid ${
            error ? 'var(--danger)' : open || focused ? 'var(--border-focus)' : 'var(--border)'
          }`,
          borderRadius: 'var(--radius-md)',
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 'var(--text-base)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color var(--t-fast), background var(--t-fast)',
          boxShadow: open || focused ? '0 0 0 3px var(--accent-subtle)' : 'none',
          outline: 'none',
          textAlign: 'left',
          gap: 8,
          ...style,
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : '—'}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ display: 'flex', flexShrink: 0, color: 'var(--text-muted)' }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 'var(--z-dropdown)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '4px',
              listStyle: 'none',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {options.map((opt, i) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <motion.li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.12 }}
                  onClick={() => handleSelect(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '9px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)',
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    transition: 'background var(--t-fast), color var(--t-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? 'var(--accent-subtle)' : 'transparent';
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  );
});

export default Select;
