import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          {t('errors.notFound')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', marginBottom: 36, maxWidth: 320 }}>
          {t('errors.notFoundHint')}
        </p>
        <Link to="/">
          <Button icon={<Home size={16} />} size="lg">
            {t('errors.goHome')}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
