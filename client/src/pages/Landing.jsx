import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n/index.js';
import {
  Volume2, Globe, Repeat, Bell, Clock, ArrowRight, CheckCircle,
  Zap, Shield, Calendar, BarChart2, Layers, Mic,
  ChevronDown, Star, Play, Sparkles,
} from 'lucide-react';

/* ─── data ──────────────────────────────────────────────── */

const FEATURES = [
  { icon: Volume2,   color: '#7c6af5', bg: 'rgba(124,106,245,0.1)', border: 'rgba(124,106,245,0.25)', title: 'Voice Alerts',        body: 'Browser speech engine reads your reminder aloud at the exact second — in your language.' },
  { icon: Globe,     color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  title: 'Multilingual',         body: 'Uzbek, Russian, English. Switch at any time from Settings — everything updates instantly.' },
  { icon: Repeat,    color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  title: 'Recurring Reminders',  body: 'Daily, weekly, or custom intervals. Set it once and it repeats forever.' },
  { icon: Calendar,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  title: 'Calendar View',        body: 'See all upcoming reminders in a monthly calendar. Overdue ones surface automatically.' },
  { icon: Shield,    color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)', title: 'Secure by Default',    body: 'JWT auth, bcrypt passwords, rate-limiting. Your data never leaves our encrypted pipeline.' },
  { icon: BarChart2, color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)',  title: 'Admin Dashboard',      body: 'Full admin panel — manage all users, view stats, inspect and moderate every reminder.' },
  { icon: Layers,    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', title: 'Priority Levels',      body: 'Tag reminders Low, Medium, High or Urgent. Urgent ones escalate automatically.' },
  { icon: Mic,       color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  title: 'No App Needed',        body: 'Runs entirely in the browser. No install, no extension — just open and use.' },
];

const STATS = [
  { n: '24/7', label: 'Always Running' },
  { n: '3',    label: 'Languages' },
  { n: '6',    label: 'Smart Agents' },
  { n: '0 ₽', label: 'Cost' },
];

const MARQUEE_ITEMS = [
  'Voice Alerts', 'Smart Scheduling', 'Recurring Reminders', 'Calendar View',
  'Multilingual', 'Secure JWT', 'Admin Panel', 'Priority Levels', 'No Install',
  'Dark & Light Mode', 'Mobile Friendly', 'Background Agents',
];

const STEPS = [
  { n: '01', color: '#7c6af5', title: 'Create account',    body: 'Sign up in 30 seconds — no credit card, no friction.' },
  { n: '02', color: '#38bdf8', title: 'Add your reminders', body: 'Set time, priority, colour tag and language. Done in seconds.' },
  { n: '03', color: '#34d399', title: 'Get notified',       body: 'Voice + visual alert fires at exactly the right moment.' },
];

const TESTIMONIALS = [
  { name: 'Алексей К.',   role: 'Product Manager',    text: 'Наконец-то не забываю дедлайны. Голосовые уведомления — это лучшее что я слышал.' },
  { name: 'Dilnoza T.',   role: 'Freelancer',          text: "O'zbekcha ovozli eslatmalar — boshqa hech narsa bu ishni qilmaydi. Juda qulay!" },
  { name: 'Михаил С.',    role: 'Student',             text: 'Повторяющиеся напоминания о лекциях настроил раз — и забыл. Сервис работает сам.' },
];

const FAQS = [
  { q: 'Chronos бесплатный?',                    a: 'Да, полностью бесплатно. Никаких скрытых платежей и карт.' },
  { q: 'Как работают голосовые уведомления?',    a: 'Используем встроенный Web Speech API браузера. Никаких сторонних сервисов — всё работает прямо в браузере.' },
  { q: 'Какие языки поддерживаются?',            a: 'Узбекский, Русский и Английский. Переключается мгновенно в настройках.' },
  { q: 'Можно ли ставить повторяющиеся напоминания?', a: 'Да — ежедневно, еженедельно или с произвольным интервалом. Настроил один раз — работает вечно.' },
  { q: 'Насколько безопасны мои данные?',        a: 'Все пароли хешируются bcrypt, сессии через подписанные JWT-токены, API защищён rate-limiting.' },
];

/* ─── helpers ────────────────────────────────────────────── */

const vu = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function SectionBadge({ color = '#7c6af5', bg = 'rgba(124,106,245,0.1)', border = 'rgba(124,106,245,0.2)', children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color, background: bg, border: `1px solid ${border}`, marginBottom: 20,
    }}>
      {children}
    </span>
  );
}

function SectionH2({ children, style = {} }) {
  return (
    <h2 style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 'clamp(32px, 4.5vw, 54px)',
      fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.06,
      color: '#fff', margin: '0 auto',
      ...style,
    }}>
      {children}
    </h2>
  );
}

/* ─── mock app preview ───────────────────────────────────── */
function AppPreview() {
  const reminders = [
    { title: 'Team standup', time: '09:00', priority: '#7c6af5', done: false },
    { title: 'Call with client', time: '11:30', priority: '#34d399', done: true },
    { title: 'Submit report', time: '17:00', priority: '#fbbf24', done: false },
  ];
  return (
    <div style={{
      background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, overflow: 'hidden', maxWidth: 720, margin: '0 auto',
      boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,106,245,0.1)',
    }}>
      {/* window bar */}
      <div style={{ background: '#0a0c14', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', opacity: 0.8 }} />
        <div style={{ flex: 1, margin: '0 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>chronos.app/reminders</span>
        </div>
      </div>
      {/* layout */}
      <div style={{ display: 'flex', height: 340 }}>
        {/* sidebar mock */}
        <div style={{ width: 56, background: '#090b13', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c6af5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={13} color="#fff" strokeWidth={2.5} />
          </div>
          {[BarChart2, Bell, Calendar, Shield].map((Icon, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i === 1 ? 'rgba(124,106,245,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color={i === 1 ? '#a78bfa' : 'rgba(255,255,255,0.2)'} strokeWidth={2} />
            </div>
          ))}
        </div>
        {/* content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'hidden' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Today's Reminders</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Saturday, 4 April 2026</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reminders.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: r.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${r.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                opacity: r.done ? 0.5 : 1,
              }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: r.priority, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: r.done ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: r.done ? 'line-through' : 'none', fontFamily: "'Space Grotesk',sans-serif" }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2, fontFamily: "'Inter',sans-serif" }}>{r.time} · Today</div>
                </div>
                <Volume2 size={13} color={r.done ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,rgba(124,106,245,0.2),rgba(124,106,245,0.05))', border: '1px solid rgba(124,106,245,0.25)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa', fontFamily: "'Space Grotesk',sans-serif" }}>3</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif", marginTop: 2 }}>Active</div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399', fontFamily: "'Space Grotesk',sans-serif" }}>1</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif", marginTop: 2 }}>Done today</div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24', fontFamily: "'Space Grotesk',sans-serif" }}>2</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif", marginTop: 2 }}>Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ item ───────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${open ? 'rgba(124,106,245,0.3)' : 'rgba(255,255,255,0.07)'}`,
      background: open ? 'rgba(124,106,245,0.06)' : 'rgba(255,255,255,0.02)',
      transition: 'border-color 200ms, background 200ms',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px', cursor: 'pointer', background: 'none', border: 'none',
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600,
        color: open ? '#fff' : 'rgba(255,255,255,0.75)', textAlign: 'left',
        transition: 'color 200ms',
      }}>
        {q}
        <ChevronDown size={18} color={open ? '#7c6af5' : 'rgba(255,255,255,0.3)'}
          style={{ flexShrink: 0, transition: 'transform 200ms, color 200ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 22px 18px', fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.72 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */
export default function Landing() {
  const { t, i18n } = useTranslation();

  // Mouse-following cursor glow
  const cursorGlowRef = useRef(null);
  const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600, y: 400 });
  const targetRef = useRef({ x: posRef.current.x, y: posRef.current.y });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => { targetRef.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.07;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.07;
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform =
          `translate(${posRef.current.x - 300}px, ${posRef.current.y - 300}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#08090f', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden' }}>

      {/* ══ BACKGROUNDS ══ */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* cursor glow — follows mouse */}
        <div ref={cursorGlowRef} style={{
          position: 'absolute', top: 0, left: 0,
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,106,245,0.14) 0%, transparent 65%)',
          willChange: 'transform', pointerEvents: 'none',
        }} />
        {/* static orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 60%)', bottom: 0, left: -200, animation: 'orbFloat 28s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 60%)', top: '55%', right: -100, animation: 'orbFloat 22s ease-in-out infinite' }} />
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)',
        }} />
      </div>

      {/* ══ NAV ══ */}
      <header className="landing-header" style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 56px', height: 72,
        background: 'rgba(8,9,15,0.85)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }} id="top">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7c6af5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(124,106,245,0.5)' }}>
            <Clock size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff' }}>Chronos</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[['#features','Функции'],['#how','Как работает'],['#faq','FAQ']].map(([href, label]) => (
              <a key={href} href={href} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.5)', borderRadius: 8, textDecoration: 'none', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}
              >{label}</a>
            ))}
          </span>

          {/* Language switcher */}
          <div className="landing-lang-switcher" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', margin: '0 6px' }}>
            {[['ru','RU'],['en','EN'],['uz','UZ']].map(([code, label]) => {
              const active = i18n.language === code;
              return (
                <button key={code} onClick={() => setLanguage(code)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.04em', cursor: 'pointer', border: 'none',
                  background: active ? 'rgba(124,106,245,0.8)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'background 150ms, color 150ms',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Link to="/login" className="nav-login" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.55)', borderRadius: 8, textDecoration: 'none', transition: 'color 150ms, background 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {t('auth.login')}
          </Link>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 22px', fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c6af5,#9d8df8)', borderRadius: 8, textDecoration: 'none', boxShadow: '0 4px 20px rgba(124,106,245,0.42)', transition: 'transform 150ms, box-shadow 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,106,245,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,106,245,0.42)'; }}
          >
            {t('auth.register')} <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section className="landing-hero" style={{ position: 'relative', zIndex: 1, padding: '130px 24px 110px', textAlign: 'center', maxWidth: 980, margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>

          <div style={{ marginBottom: 36 }}>
            <SectionBadge color="#a78bfa" bg="rgba(167,139,250,0.1)" border="rgba(167,139,250,0.2)">
              <Sparkles size={11} /> Умные напоминания с голосом
            </SectionBadge>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(52px, 9.5vw, 104px)', fontWeight: 700, letterSpacing: '-0.048em', lineHeight: 0.98, color: '#fff', marginBottom: 10 }}>
            {t('landing.hero')}
          </h1>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(52px, 9.5vw, 104px)', fontWeight: 700, letterSpacing: '-0.048em', lineHeight: 0.98, marginBottom: 36, background: 'linear-gradient(135deg,#a78bfa 0%,#38bdf8 60%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            что важно.
          </h1>

          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(16px, 2.2vw, 19px)', color: 'rgba(255,255,255,0.45)', fontWeight: 400, lineHeight: 1.75, maxWidth: 580, margin: '0 auto 52px' }}>
            {t('landing.heroSub')}
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', fontSize: 16, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c6af5,#9d8df8)', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 36px rgba(124,106,245,0.45)', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 52px rgba(124,106,245,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,106,245,0.45)'; }}
            >
              {t('landing.cta')} <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
            <a href="#preview" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textDecoration: 'none', transition: 'background 200ms, color 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <Play size={15} fill="currentColor" /> Смотреть демо
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 28px', justifyContent: 'center' }}>
            {['Работает в браузере', 'JWT аутентификация', 'Тёмная и светлая тема', 'Мобильная версия'].map(x => (
              <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CheckCircle size={14} color="#34d399" strokeWidth={2.5} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>{x}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ MARQUEE STRIP ══ */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', overflow: 'hidden', padding: '14px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeScroll 24s linear infinite', gap: 0 }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              <Zap size={11} color="#7c6af5" fill="#7c6af5" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.018)' }}>
        <div className="landing-stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map(({ n, label }, i) => (
            <motion.div key={label} {...vu(i * 0.08)} style={{ padding: '38px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 46, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg,#fff 20%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.28)', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ APP PREVIEW ══ */}
      <section id="preview" className="landing-preview-section" style={{ position: 'relative', zIndex: 1, padding: '110px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge color="#38bdf8" bg="rgba(56,189,248,0.1)" border="rgba(56,189,248,0.2)">
              <Play size={10} fill="#38bdf8" /> Live Preview
            </SectionBadge>
            <SectionH2 style={{ maxWidth: 480 }}>
              Вот как выглядит{' '}
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                приложение
              </span>
            </SectionH2>
          </motion.div>
          <motion.div {...vu(0.1)}>
            <AppPreview />
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="landing-features" style={{ position: 'relative', zIndex: 1, padding: '110px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionBadge><Sparkles size={11} /> Возможности</SectionBadge>
            <SectionH2 style={{ maxWidth: 560 }}>
              Всё что нужно.{' '}
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ничего лишнего.
              </span>
            </SectionH2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, color, bg, border, title, body }, i) => (
              <motion.div key={title} {...vu(i * 0.07)} style={{ padding: '36px 30px', borderRadius: 16, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden', transition: 'transform 220ms, border-color 220ms, background 220ms, box-shadow 220ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = border; e.currentTarget.style.background = bg; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.022)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
                <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Icon size={22} color={color} strokeWidth={2} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.72 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionBadge color="#34d399" bg="rgba(52,211,153,0.1)" border="rgba(52,211,153,0.2)">
              <Play size={10} fill="#34d399" /> Как работает
            </SectionBadge>
            <SectionH2>Запустись за 3 шага</SectionH2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {STEPS.map(({ n, color, title, body }, i) => (
              <motion.div key={n} {...vu(i * 0.12)} style={{ padding: '40px 32px', borderRadius: 18, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -16, right: 16, fontFamily: "'Space Grotesk',sans-serif", fontSize: 120, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.05em', color: 'rgba(255,255,255,0.025)', pointerEvents: 'none', userSelect: 'none' }}>{n}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}40`, marginBottom: 24 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color }}>{n}</span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionBadge color="#fbbf24" bg="rgba(251,191,36,0.1)" border="rgba(251,191,36,0.2)">
              <Star size={11} fill="#fbbf24" /> Отзывы
            </SectionBadge>
            <SectionH2>Что говорят пользователи</SectionH2>
          </motion.div>

          <div className="landing-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {TESTIMONIALS.map(({ name, role, text }, i) => (
              <motion.div key={name} {...vu(i * 0.1)} style={{ padding: '32px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>{name}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...vu()}>
            <SectionBadge color="#34d399" bg="rgba(52,211,153,0.1)" border="rgba(52,211,153,0.2)">Цены</SectionBadge>
            <SectionH2 style={{ marginBottom: 48 }}>Просто и честно</SectionH2>

            <div style={{ padding: '48px 40px', borderRadius: 20, background: 'rgba(124,106,245,0.08)', border: '1px solid rgba(124,106,245,0.25)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,106,245,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 64, fontWeight: 700, letterSpacing: '-0.05em', background: 'linear-gradient(135deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>Бесплатно</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.4)', marginTop: 8, marginBottom: 36 }}>навсегда — без ограничений</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, textAlign: 'left' }}>
                  {['Неограниченные напоминания','Голосовые уведомления','Все 3 языка','Календарный вид','Повторяющиеся напоминания','Тёмная и светлая тема'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={16} color="#34d399" strokeWidth={2.5} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c6af5,#9d8df8)', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 36px rgba(124,106,245,0.45)', transition: 'transform 200ms, box-shadow 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 52px rgba(124,106,245,0.65)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,106,245,0.45)'; }}
                >
                  Начать бесплатно <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge>FAQ</SectionBadge>
            <SectionH2>Частые вопросы</SectionH2>
          </motion.div>
          <motion.div {...vu(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="landing-cta-banner" style={{ position: 'relative', zIndex: 1, margin: '80px 40px', borderRadius: 24, overflow: 'hidden', padding: '80px 48px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(124,106,245,0.2) 0%,rgba(56,189,248,0.12) 60%,rgba(52,211,153,0.08) 100%)', border: '1px solid rgba(124,106,245,0.25)' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,106,245,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <SectionBadge color="#a78bfa" bg="rgba(167,139,250,0.12)" border="rgba(167,139,250,0.25)">
              <Zap size={11} fill="#a78bfa" /> Начать бесплатно
            </SectionBadge>
          </div>
          <SectionH2 style={{ marginBottom: 20 }}>Готов не пропускать важное?</SectionH2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 440, margin: '0 auto 40px' }}>
            Регистрация за 30 секунд. Никаких карт. Полностью бесплатно.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 38px', fontSize: 16, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c6af5,#9d8df8)', borderRadius: 12, textDecoration: 'none', boxShadow: '0 10px 48px rgba(124,106,245,0.55)', transition: 'transform 200ms, box-shadow 200ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(124,106,245,0.72)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 48px rgba(124,106,245,0.55)'; }}
          >
            {t('landing.cta')} <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="landing-footer landing-footer-grid" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 56px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'start', gap: 40, background: 'rgba(8,9,15,0.9)', backdropFilter: 'blur(20px)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7c6af5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff' }}>Chronos</span>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.65, maxWidth: 240 }}>
            Умные напоминания с голосом на трёх языках.
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 16 }}>© 2025 Chronos</p>
        </div>
        {[
          { title: 'Продукт', links: [['#features','Функции'],['#how','Как работает'],['#faq','FAQ']] },
          { title: 'Аккаунт', links: [['/login','Войти'],['/register','Регистрация']] },
          { title: 'Правовое', links:[['#','Конфиденциальность'],['#','Условия']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(([href, label]) => (
                href.startsWith('/') ? (
                  <Link key={label} to={href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >{label}</Link>
                ) : (
                  <a key={label} href={href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >{label}</a>
                )
              ))}
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
