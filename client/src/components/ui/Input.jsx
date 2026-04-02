import { forwardRef, useState } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon,
    iconRight,
    type = 'text',
    size = 'md',
    fullWidth = true,
    style = {},
    containerStyle = {},
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  const heights = { sm: 36, md: 44, lg: 52 };
  const h = heights[size] || 44;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: fullWidth ? '100%' : undefined, ...containerStyle }}>
      {label && (
        <label
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              display: 'flex',
              alignItems: 'center',
              color: focused ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--t-fast)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: h,
            paddingLeft: icon ? 40 : 14,
            paddingRight: iconRight ? 40 : 14,
            background: 'var(--bg-surface-2)',
            border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--border-focus)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
            boxShadow: focused && !error ? '0 0 0 3px var(--accent-subtle)' : 'none',
            ...style,
          }}
          {...props}
        />

        {iconRight && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
          >
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: -2 }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
    </div>
  );
});

export default Input;
