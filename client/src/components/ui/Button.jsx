import { motion } from 'framer-motion';
import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: 'var(--bg-surface-2)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'var(--danger-subtle)',
    color: 'var(--danger)',
    border: '1px solid transparent',
  },
  accent: {
    background: 'var(--accent-subtle)',
    color: 'var(--accent)',
    border: '1px solid transparent',
  },
};

const SIZES = {
  xs: { padding: '4px 10px', fontSize: 'var(--text-xs)', height: '28px' },
  sm: { padding: '5px 12px', fontSize: 'var(--text-sm)', height: '32px' },
  md: { padding: '7px 16px', fontSize: 'var(--text-sm)', height: '38px' },
  lg: { padding: '10px 20px', fontSize: 'var(--text-base)', height: '44px' },
};

const HOVER = {
  primary: { filter: 'brightness(1.12)' },
  secondary: { background: 'var(--bg-surface-3)', borderColor: 'rgba(255,255,255,0.12)' },
  ghost: { background: 'var(--bg-surface-2)', color: 'var(--text-primary)' },
  danger: { background: 'var(--danger)', color: 'white' },
  accent: { background: 'var(--accent-subtle-hover)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  style = {},
  className = '',
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const h = HOVER[variant] || {};

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.975 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 150ms ease, color 150ms ease, filter 150ms ease, border-color 150ms ease',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        flexShrink: 0,
        letterSpacing: '-0.01em',
        ...v,
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, h);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          background: v.background,
          color: v.color,
          filter: '',
          borderColor: '',
        });
      }}
      {...rest}
    >
      {loading ? (
        <Spinner size={15} color={variant === 'primary' ? 'white' : 'currentColor'} />
      ) : icon ? (
        <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: 'flex', flexShrink: 0 }}>{iconRight}</span>
      )}
    </motion.button>
  );
}
