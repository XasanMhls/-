export default function Badge({ children, variant = 'default', size = 'sm', dot, style = {} }) {
  const variants = {
    default: { background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' },
    accent: { background: 'var(--accent-subtle)', color: 'var(--accent-text)' },
    success: { background: 'var(--success-subtle)', color: 'var(--success)' },
    warning: { background: 'var(--warning-subtle)', color: 'var(--warning)' },
    danger: { background: 'var(--danger-subtle)', color: 'var(--danger)' },
    info: { background: 'var(--info-subtle)', color: 'var(--info)' },
  };

  const sizes = {
    xs: { fontSize: 10, padding: '1px 6px', height: 18 },
    sm: { fontSize: 11, padding: '2px 8px', height: 22 },
    md: { fontSize: 12, padding: '3px 10px', height: 26 },
  };

  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.sm;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        ...v,
        ...s,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
