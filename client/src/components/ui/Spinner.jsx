export default function Spinner({ size = 20, color = 'var(--accent)', style = {} }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 700ms linear infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
