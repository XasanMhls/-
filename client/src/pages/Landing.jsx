import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Volume2, Globe, Repeat, Bell, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Volume2,
    title: 'Voice Alerts',
    body: 'Your reminders are read aloud at the exact moment — no silent notifications you miss.',
  },
  {
    icon: Globe,
    title: 'Three Languages',
    body: 'Full support for Uzbek, Russian, and English — switch anytime in settings.',
  },
  {
    icon: Repeat,
    title: 'Recurring Reminders',
    body: 'Daily, weekly, or custom intervals. Set it once and forget about it.',
  },
  {
    icon: Bell,
    title: 'Smart Scheduling',
    body: 'See everything in a calendar view. Overdue items surface automatically.',
  },
];

const ITEMS = [
  'Works in browser — no install needed',
  'Secure JWT authentication',
  'Dark and light theme',
  'Mobile responsive',
];

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <header className="landing-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: 60,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-canvas)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={15} color="white" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Chronos
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/login" style={{
            padding: '6px 14px',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            transition: 'color var(--t-fast), background var(--t-fast)',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {t('auth.login')}
          </Link>
          <Link to="/register" style={{
            padding: '6px 14px',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'white',
            background: 'var(--accent)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            transition: 'background var(--t-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            {t('auth.register')}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero" style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '100px 24px 80px',
        width: '100%',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: 'var(--text-muted)',
            marginBottom: 32,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Reminder app · uz / ru / en
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            {t('landing.hero')}
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: 40,
            maxWidth: 560,
          }}>
            {t('landing.heroSub')}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background var(--t-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              {t('landing.cta')}
              <ArrowRight size={15} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 20px',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'border-color var(--t-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {t('auth.login')}
            </Link>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ITEMS.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={14} color="var(--success)" strokeWidth={2.5} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="landing-features" style={{ borderTop: '1px solid var(--border)', padding: '72px 40px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}>
            Features
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 48,
            maxWidth: 480,
          }}>
            Everything you need, nothing you don't
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  padding: '28px 24px',
                  background: 'var(--bg-surface)',
                  borderRight: (i % 2 === 0) ? '1px solid var(--border)' : 'none',
                  borderBottom: (i < 2) ? '1px solid var(--border)' : 'none',
                  transition: 'background var(--t-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <Icon size={18} color="var(--accent)" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="landing-cta" style={{
        borderTop: '1px solid var(--border)',
        padding: '56px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
        maxWidth: 1040,
        margin: '0 auto',
        width: '100%',
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Ready to stay on schedule?
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Create a free account in under 30 seconds.
          </p>
        </div>
        <Link to="/register" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 20px',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background var(--t-fast)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          {t('landing.cta')}
          <ArrowRight size={15} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>© 2024 Chronos</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Privacy', 'Terms'].map((item) => (
            <a key={item} href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
