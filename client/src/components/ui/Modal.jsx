import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 560,
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 'var(--z-modal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'calc(var(--z-modal) + 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <div
              className="modal-inner"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth,
                maxHeight: '90dvh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {(title || !hideClose) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                >
                  {title && (
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, letterSpacing: '-0.01em' }}>
                      {title}
                    </h3>
                  )}
                  {!hideClose && (
                    <button
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'background var(--t-fast), color var(--t-fast)',
                        marginLeft: 'auto',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-2)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              )}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
