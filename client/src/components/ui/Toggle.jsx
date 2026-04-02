import { motion } from 'framer-motion';

export default function Toggle({ checked, onChange, label, size = 'md', disabled = false }) {
  const sizes = {
    sm: { track: { width: 36, height: 20 }, thumb: 14, offset: 18 },
    md: { track: { width: 44, height: 24 }, thumb: 18, offset: 22 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative',
          width: s.track.width,
          height: s.track.height,
          borderRadius: s.track.height,
          background: checked ? 'var(--accent)' : 'var(--bg-surface-3)',
          border: '1px solid',
          borderColor: checked ? 'var(--accent)' : 'var(--border)',
          transition: 'background var(--t-base), border-color var(--t-base)',
          flexShrink: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <motion.span
          animate={{ x: checked ? s.offset - s.thumb - 1 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{
            position: 'absolute',
            top: 2,
            left: 0,
            width: s.thumb,
            height: s.thumb,
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
