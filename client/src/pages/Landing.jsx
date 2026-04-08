import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n/index.js';
import useUiStore from '../store/uiStore.js';
import {
  Volume2, Globe, Repeat, Bell, Clock, ArrowRight, CheckCircle,
  Zap, Shield, Calendar, BarChart2, Layers, Mic,
  ChevronDown, Star, Play, Sparkles, Menu, X,
  Smartphone, Monitor, Download, BookOpen, UserPlus,
  PlusCircle, Settings, Moon, Sun,
} from 'lucide-react';

/* ─── Figma-inspired accent: lime #B9FF66 on dark #191A23 ── */
const LIME  = '#B9FF66';
const LIME2 = '#d4ff99';

/* ─── theme helpers ──────────────────────────────────────── */
function buildColors(isDark) {
  return {
    pageBg:       isDark ? '#191A23'                         : '#f5f6fa',
    navBg:        isDark ? 'rgba(25,26,35,0.92)'             : 'rgba(245,246,250,0.94)',
    sectionAlt:   isDark ? 'rgba(255,255,255,0.015)'         : 'rgba(0,0,0,0.018)',
    card:         isDark ? 'rgba(255,255,255,0.04)'          : '#ffffff',
    cardHover:    isDark ? 'rgba(255,255,255,0.07)'          : '#f8f8ff',
    border:       isDark ? 'rgba(255,255,255,0.08)'          : 'rgba(0,0,0,0.08)',
    borderMd:     isDark ? 'rgba(255,255,255,0.12)'          : 'rgba(0,0,0,0.12)',
    text:         isDark ? '#ffffff'                         : '#0d1226',
    text75:       isDark ? 'rgba(255,255,255,0.75)'         : 'rgba(13,18,38,0.78)',
    text60:       isDark ? 'rgba(255,255,255,0.6)'          : 'rgba(13,18,38,0.62)',
    text45:       isDark ? 'rgba(255,255,255,0.45)'         : 'rgba(13,18,38,0.52)',
    text40:       isDark ? 'rgba(255,255,255,0.4)'          : 'rgba(13,18,38,0.48)',
    text35:       isDark ? 'rgba(255,255,255,0.35)'         : 'rgba(13,18,38,0.42)',
    text28:       isDark ? 'rgba(255,255,255,0.28)'         : 'rgba(13,18,38,0.38)',
    text25:       isDark ? 'rgba(255,255,255,0.25)'         : 'rgba(13,18,38,0.35)',
    text18:       isDark ? 'rgba(255,255,255,0.18)'         : 'rgba(13,18,38,0.28)',
    mobileMenu:   isDark ? 'rgba(25,26,35,0.97)'            : 'rgba(245,246,250,0.99)',
    statsRow:     isDark ? 'rgba(255,255,255,0.02)'          : 'rgba(0,0,0,0.02)',
    statsBorder:  isDark ? 'rgba(255,255,255,0.06)'          : 'rgba(0,0,0,0.06)',
    stepNum:      isDark ? 'rgba(255,255,255,0.03)'          : 'rgba(0,0,0,0.045)',
    marqueeBg:    isDark ? 'rgba(255,255,255,0.015)'         : 'rgba(0,0,0,0.025)',
    marqueeText:  isDark ? 'rgba(255,255,255,0.3)'           : 'rgba(13,18,38,0.4)',
    faqBg:        isDark ? 'rgba(255,255,255,0.025)'         : '#ffffff',
    faqBgOpen:    isDark ? 'rgba(185,255,102,0.06)'          : 'rgba(185,255,102,0.06)',
    tutCard:      isDark ? 'rgba(255,255,255,0.025)'         : '#fafafa',
    footerBg:     isDark ? 'rgba(25,26,35,0.9)'             : 'rgba(245,246,250,0.95)',
    pricingCard:  isDark ? 'rgba(185,255,102,0.06)'          : 'rgba(185,255,102,0.06)',
  };
}

/* ─── motion preset ──────────────────────────────────────── */
const vu = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Section badge ──────────────────────────────────────── */
function SectionBadge({ color = LIME, bg, border, children }) {
  const _bg = bg || `${color}18`;
  const _border = border || `${color}40`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color, background: _bg, border: `1px solid ${_border}`, marginBottom: 18,
    }}>
      {children}
    </span>
  );
}

/* ─── Section heading ────────────────────────────────────── */
function SectionH2({ children, style = {}, textColor = '#ffffff' }) {
  return (
    <h2 style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 'clamp(30px, 4.2vw, 52px)',
      fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.08,
      color: textColor, margin: '0 auto',
      ...style,
    }}>
      {children}
    </h2>
  );
}

/* ─── App preview (always dark) ──────────────────────────── */
function AppPreview() {
  const reminders = [
    { title: 'Team standup', time: '09:00', priority: LIME, done: false },
    { title: 'Call with client', time: '11:30', priority: '#34d399', done: true },
    { title: 'Submit report', time: '17:00', priority: '#fbbf24', done: false },
  ];
  return (
    <div style={{
      background: '#12131c', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, overflow: 'hidden', maxWidth: 900, margin: '0 auto',
      boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px ${LIME}15`,
    }}>
      <div style={{ background: '#0d0e16', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', opacity: 0.8 }} />
        <div style={{ flex: 1, margin: '0 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>chronos.app/reminders</span>
        </div>
      </div>
      <div style={{ display: 'flex', height: 340 }}>
        <div style={{ width: 56, background: '#0d0e16', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${LIME},${LIME2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={13} color="#191A23" strokeWidth={2.5} />
          </div>
          {[BarChart2, Bell, Calendar, Shield].map((Icon, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i === 1 ? `${LIME}22` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color={i === 1 ? LIME : 'rgba(255,255,255,0.2)'} strokeWidth={2} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'hidden' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Today's Reminders</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Monday, 7 April 2026</div>
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
            {[{ n: '3', l: 'Active', c: LIME, bg: `${LIME}22`, br: `${LIME}40` }, { n: '1', l: 'Done', c: '#34d399', bg: 'rgba(255,255,255,0.03)', br: 'rgba(255,255,255,0.06)' }, { n: '2', l: 'Upcoming', c: '#fbbf24', bg: 'rgba(255,255,255,0.03)', br: 'rgba(255,255,255,0.06)' }].map(({ n, l, c, bg, br }) => (
              <div key={l} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: bg, border: `1px solid ${br}` }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: "'Space Grotesk',sans-serif" }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ item ───────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const theme = useUiStore(s => s.theme);
  const isDark = theme !== 'light' && !(theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const C = buildColors(isDark);

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${open ? `${LIME}50` : C.border}`,
      background: open ? C.faqBgOpen : C.faqBg,
      transition: 'border-color 200ms, background 200ms',
      boxShadow: open ? `0 4px 20px ${LIME}12` : 'none',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px', cursor: 'pointer', background: 'none', border: 'none',
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600,
        color: open ? C.text : C.text75, textAlign: 'left',
        transition: 'color 200ms',
      }}>
        {q}
        <ChevronDown size={18} color={open ? LIME : C.text35}
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
            <div style={{ padding: '0 22px 18px', fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: C.text45, lineHeight: 1.72 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tutorial step card ─────────────────────────────────── */
function TutorialCard({ step, index, isActive, onClick, C, t }) {
  const Icon = step.icon;
  return (
    <motion.div
      {...vu(index * 0.06)}
      onClick={onClick}
      style={{
        padding: '24px 22px', borderRadius: 16, cursor: 'pointer',
        background: isActive ? step.bg : C.tutCard,
        border: `1px solid ${isActive ? step.border : C.border}`,
        transition: 'all 200ms ease',
        boxShadow: isActive ? `0 8px 32px ${step.color}20` : 'none',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.cardHover; e.currentTarget.style.borderColor = step.border; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = C.tutCard; e.currentTarget.style.borderColor = C.border; } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${step.color},${step.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${step.color}38` }}>
          <Icon size={18} color="#fff" strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: '0.06em', fontFamily: "'Space Grotesk',sans-serif" }}>{t('landing.tutStep')} {step.n}</span>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '5px 0 7px' }}>{step.title}</h3>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: C.text45, lineHeight: 1.62 }}>{step.desc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
            {step.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: step.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.text35 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TutorialPreview({ step, t }) {
  if (!step) return null;
  const { preview, color, bg } = step;
  const baseCard = { padding: '24px', background: '#12131c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' };

  if (preview.type === 'form') return (
    <div style={{ ...baseCard, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {preview.fields.map((f, i) => (
        <div key={i}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{f}</div>
          <div style={{ height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
            <div style={{ width: i === 2 ? 80 : 140, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
          </div>
        </div>
      ))}
      <div style={{ height: 44, borderRadius: 12, background: `linear-gradient(135deg,${color},${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, boxShadow: `0 8px 28px ${color}40` }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#191A23' }}>{preview.button}</span>
      </div>
    </div>
  );

  if (preview.type === 'reminder') return (
    <div style={baseCard}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>{t('landing.tutNewReminder')}</div>
      {preview.items.map(item => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</span>
        </div>
      ))}
      <div style={{ marginTop: 20, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${color},${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 24px ${color}40` }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: '#191A23' }}>{t('landing.tutSave')}</span>
      </div>
    </div>
  );

  if (preview.type === 'repeat') return (
    <div style={baseCard}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>{t('landing.tutRepeatTitle')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {preview.options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: i === 0 ? bg : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? step.border : 'rgba(255,255,255,0.06)'}` }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${i === 0 ? color : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
            </div>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: i === 0 ? 600 : 400 }}>{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (preview.type === 'voice') return (
    <div style={baseCard}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>{t('landing.tut4VoiceLabel')}</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {preview.langs.map(({ l, active }) => (
          <div key={l} style={{ flex: 1, padding: '12px', borderRadius: 10, background: active ? bg : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? step.border : 'rgba(255,255,255,0.07)'}`, textAlign: 'center' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: active ? color : 'rgba(255,255,255,0.35)' }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Volume2 size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{t('landing.tut4VoiceTest')}</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{t('landing.tut4VoiceHint')}</div>
        </div>
      </div>
    </div>
  );

  if (preview.type === 'calendar') return (
    <div style={{ ...baseCard, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>{t('landing.tutCalMonth')}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['<', '>'].map(a => <div key={a} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a}</div>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {t('landing.tutCalDays').split(',').map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter',sans-serif", padding: '4px 0', fontWeight: 700 }}>{d}</div>
        ))}
        {[...Array(30)].map((_, i) => {
          const d = i + 1;
          const hasEvent = [3,7,12,15,18,22,25,28].includes(d);
          const isToday = d === 7;
          const overdue = [3,7].includes(d);
          return (
            <div key={i} style={{ textAlign: 'center', padding: '5px 2px', borderRadius: 7, background: isToday ? `linear-gradient(135deg,${LIME},${LIME2})` : 'transparent', position: 'relative' }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: isToday ? '#191A23' : 'rgba(255,255,255,0.5)', fontWeight: isToday ? 700 : 400 }}>{d}</span>
              {hasEvent && <div style={{ width: 4, height: 4, borderRadius: '50%', background: overdue ? '#f04e65' : '#34d399', margin: '2px auto 0' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (preview.type === 'settings') return (
    <div style={baseCard}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>{t('landing.tutSettings')}</div>
      {preview.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < preview.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{item}</span>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: `linear-gradient(90deg,${color},${color}99)`, position: 'relative' }}>
            <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
          </div>
        </div>
      ))}
    </div>
  );

  return null;
}

function TutorialContent({ C, t }) {
  const tutSteps = [
    { n: '01', icon: UserPlus,   color: LIME,      bg: `${LIME}18`, border: `${LIME}40`, title: t('landing.tut1Title'), desc: t('landing.tut1Desc'), tips: [t('landing.tut1Tip1'), t('landing.tut1Tip2'), t('landing.tut1Tip3')], preview: { type: 'form', fields: [t('landing.tut1Field1'), t('landing.tut1Field2'), t('landing.tut1Field3')], button: t('landing.tut1Button') } },
    { n: '02', icon: PlusCircle, color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)', title: t('landing.tut2Title'), desc: t('landing.tut2Desc'), tips: [t('landing.tut2Tip1'), t('landing.tut2Tip2'), t('landing.tut2Tip3')], preview: { type: 'reminder', items: [{ label: t('landing.tut2Label1'), value: t('landing.tut2Value1'), color: LIME }, { label: t('landing.tut2Label2'), value: t('landing.tut2Value2'), color: '#34d399' }, { label: t('landing.tut2Label3'), value: t('landing.tut2Value3'), color: '#fbbf24' }] } },
    { n: '03', icon: Repeat,     color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)', title: t('landing.tut3Title'), desc: t('landing.tut3Desc'), tips: [t('landing.tut3Tip1'), t('landing.tut3Tip2'), t('landing.tut3Tip3')], preview: { type: 'repeat', options: [t('landing.tut3Opt1'), t('landing.tut3Opt2'), t('landing.tut3Opt3'), t('landing.tut3Opt4')] } },
    { n: '04', icon: Volume2,    color: '#B9FF66', bg: 'rgba(185,255,102,0.1)', border: 'rgba(185,255,102,0.25)', title: t('landing.tut4Title'), desc: t('landing.tut4Desc'), tips: [t('landing.tut4Tip1'), t('landing.tut4Tip2'), t('landing.tut4Tip3')], preview: { type: 'voice', langs: [{ l: 'RU', active: true }, { l: 'EN', active: false }, { l: 'UZ', active: false }] } },
    { n: '05', icon: Calendar,   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)', title: t('landing.tut5Title'), desc: t('landing.tut5Desc'), tips: [t('landing.tut5Tip1'), t('landing.tut5Tip2'), t('landing.tut5Tip3')], preview: { type: 'calendar' } },
    { n: '06', icon: Settings,   color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)', title: t('landing.tut6Title'), desc: t('landing.tut6Desc'), tips: [t('landing.tut6Tip1'), t('landing.tut6Tip2'), t('landing.tut6Tip3')], preview: { type: 'settings', items: [t('landing.tut6Set1'), t('landing.tut6Set2'), t('landing.tut6Set3'), t('landing.tut6Set4')] } },
  ];

  const [active, setActive] = useState(0);
  const step = tutSteps[active];
  return (
    <div className="landing-tutorial-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tutSteps.map((s, i) => (
          <TutorialCard key={s.n} step={s} index={i} isActive={active === i} onClick={() => setActive(i)} C={C} t={t} />
        ))}
      </div>
      <div className="landing-tutorial-preview" style={{ position: 'sticky', top: 100 }}>
        <motion.div key={active} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
          <div style={{ marginBottom: 18, padding: '13px 18px', borderRadius: 12, background: step.bg, border: `1px solid ${step.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,${step.color},${step.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <step.icon size={14} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: '0.06em' }}>{t('landing.tutStep')} {step.n} / {tutSteps.length}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 1 }}>{step.title}</div>
            </div>
          </div>
          <TutorialPreview step={step} t={t} />
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'space-between' }}>
            <button onClick={() => setActive(a => Math.max(0, a - 1))} disabled={active === 0}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: active === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', cursor: active === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600 }}
            >{t('landing.tutBack')}</button>
            {active < tutSteps.length - 1 ? (
              <button onClick={() => setActive(a => a + 1)}
                style={{ flex: 1, padding: '11px', borderRadius: 10, background: `linear-gradient(135deg,${step.color},${step.color}99)`, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${step.color}40` }}
              >{t('landing.tutNext')}</button>
            ) : (
              <Link to="/register" style={{ flex: 1, padding: '11px', borderRadius: 10, background: `linear-gradient(135deg,${LIME},${LIME2})`, color: '#191A23', textDecoration: 'none', textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${LIME}55` }}>
                {t('landing.tutStart')}
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            {tutSteps.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 3, background: i === active ? step.color : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 250ms ease', padding: 0 }} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */
export default function Landing() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = useUiStore(s => s.theme);
  const setTheme = useUiStore(s => s.setTheme);
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const C = buildColors(isDark);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  /* ── Data built from t() ── */
  const FEATURES = [
    { icon: Volume2,   color: LIME,      bg: `${LIME}18`, border: `${LIME}40`, title: t('landing.feat1Title'), body: t('landing.feat1Body'), featured: true },
    { icon: Repeat,    color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  title: t('landing.feat2Title'), body: t('landing.feat2Body'), featured: true },
    { icon: Globe,     color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  title: t('landing.feat3Title'), body: t('landing.feat3Body') },
    { icon: Calendar,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  title: t('landing.feat4Title'), body: t('landing.feat4Body') },
    { icon: Shield,    color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)', title: t('landing.feat5Title'), body: t('landing.feat5Body') },
    { icon: BarChart2, color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)',  title: t('landing.feat6Title'), body: t('landing.feat6Body') },
    { icon: Layers,    color: '#B9FF66', bg: 'rgba(185,255,102,0.1)', border: 'rgba(185,255,102,0.25)', title: t('landing.feat7Title'), body: t('landing.feat7Body') },
    { icon: Mic,       color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  title: t('landing.feat8Title'), body: t('landing.feat8Body') },
  ];

  const STATS = [
    { n: '24/7', label: t('landing.stat1') },
    { n: '3',    label: t('landing.stat2') },
    { n: '6',    label: t('landing.stat3') },
    { n: '0 ₽', label: t('landing.stat4') },
  ];

  const MARQUEE_ITEMS = Array.from({ length: 12 }, (_, i) => t(`landing.marquee${i + 1}`));

  const STEPS = [
    { n: '01', color: LIME,      title: t('landing.step1Title'), body: t('landing.step1Body') },
    { n: '02', color: '#38bdf8', title: t('landing.step2Title'), body: t('landing.step2Body') },
    { n: '03', color: '#34d399', title: t('landing.step3Title'), body: t('landing.step3Body') },
  ];

  const TESTIMONIALS = [
    { name: t('landing.test1Name'), role: t('landing.test1Role'), text: t('landing.test1Text') },
    { name: t('landing.test2Name'), role: t('landing.test2Role'), text: t('landing.test2Text') },
    { name: t('landing.test3Name'), role: t('landing.test3Role'), text: t('landing.test3Text') },
  ];

  const FAQS = Array.from({ length: 5 }, (_, i) => ({ q: t(`landing.faq${i+1}Q`), a: t(`landing.faq${i+1}A`) }));

  const CHECKS = [t('landing.check1'), t('landing.check2'), t('landing.check3'), t('landing.check4')];
  const PRICE_FEATURES = [t('landing.priceF1'), t('landing.priceF2'), t('landing.priceF3'), t('landing.priceF4'), t('landing.priceF5'), t('landing.priceF6')];

  // Cursor glow
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
        cursorGlowRef.current.style.transform = `translate(${posRef.current.x - 300}px, ${posRef.current.y - 300}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ── Lime accent for buttons ── */
  const btnPrimary = { background: `linear-gradient(135deg,${LIME},${LIME2})`, color: '#191A23', boxShadow: `0 8px 32px ${LIME}44` };
  const btnPrimaryHover = { boxShadow: `0 14px 48px ${LIME}66` };

  return (
    <div data-theme={isDark ? 'dark' : 'light'} style={{ minHeight: '100dvh', background: C.pageBg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden', transition: 'background 300ms ease, color 300ms ease' }}>

      {/* ══ BACKGROUNDS ══ */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div ref={cursorGlowRef} style={{
          position: 'absolute', top: 0, left: 0, width: 600, height: 600, borderRadius: '50%',
          background: isDark ? `radial-gradient(circle, ${LIME}18 0%, transparent 65%)` : `radial-gradient(circle, ${LIME}0a 0%, transparent 65%)`,
          willChange: 'transform', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 60%)', bottom: 0, left: -200, animation: 'orbFloat 28s ease-in-out infinite reverse' }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
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
        background: C.navBg, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderBottom: `1px solid ${C.border}`,
        transition: 'background 300ms ease, border-color 300ms ease',
      }} id="top">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${LIME},${LIME2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${LIME}55` }}>
            <Clock size={17} color="#191A23" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.04em', color: C.text }}>Chronos</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[['#features', t('landing.navFeatures')],['#how', t('landing.navHow')],['#tutorial', t('landing.navTutorial')],['#faq','FAQ']].map(([href, label]) => (
              <a key={href} href={href} style={{ padding: '7px 14px', fontSize: 14, fontWeight: 500, color: C.text45, borderRadius: 8, textDecoration: 'none', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.text45; e.currentTarget.style.background = 'transparent'; }}
              >{label}</a>
            ))}
          </span>

          <div className="landing-lang-switcher" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 8, border: `1px solid ${C.border}`, margin: '0 4px' }}>
            {[['ru','RU'],['en','EN'],['uz','UZ']].map(([code, label]) => {
              const active = (i18n.language || '').split('-')[0] === code;
              return (
                <button key={code} onClick={() => setLanguage(code)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.04em', cursor: 'pointer', border: 'none',
                  background: active ? LIME : 'transparent',
                  color: active ? '#191A23' : C.text40,
                  transition: 'background 150ms, color 150ms',
                }}>
                  {label}
                </button>
              );
            })}
          </div>

          <button onClick={toggleTheme} title={isDark ? t('landing.lightTheme') : t('landing.darkTheme')}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 200ms', color: C.text60, margin: '0 2px' }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/login" className="nav-login" style={{ padding: '7px 16px', fontSize: 14, fontWeight: 500, color: C.text45, borderRadius: 8, textDecoration: 'none', transition: 'color 150ms, background 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.text45; e.currentTarget.style.background = 'transparent'; }}
          >
            {t('auth.login')}
          </Link>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', fontSize: 14, fontWeight: 700, ...btnPrimary, borderRadius: 10, textDecoration: 'none', transition: 'transform 150ms, box-shadow 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = btnPrimaryHover.boxShadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
          >
            {t('auth.register')} <ArrowRight size={14} strokeWidth={2.5} />
          </Link>

          <button className="landing-mobile-menu-btn" onClick={() => setMobileMenuOpen(o => !o)}
            style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', flexShrink: 0 }}
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: C.mobileMenu, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.border}`, padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {[['#features', t('landing.navFeatures')],['#how', t('landing.navHow')],['#tutorial', t('landing.navTutorial')],['#faq','FAQ']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', fontSize: 16, fontWeight: 600, color: C.text75, borderRadius: 10, textDecoration: 'none', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>{label}</a>
            ))}
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', fontSize: 16, fontWeight: 600, color: C.text75, borderRadius: 10, textDecoration: 'none', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>{t('auth.login')}</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ padding: '13px 16px', fontSize: 16, fontWeight: 700, ...btnPrimary, borderRadius: 10, textDecoration: 'none', textAlign: 'center', marginTop: 4 }}>{t('auth.register')}</Link>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 14, borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
              {[['ru','RU'],['en','EN'],['uz','UZ']].map(([code, label]) => {
                const active = (i18n.language || '').split('-')[0] === code;
                return (
                  <button key={code} onClick={() => setLanguage(code)} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? LIME : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), color: active ? '#191A23' : C.text45 }}>
                    {label}
                  </button>
                );
              })}
              <button onClick={toggleTheme} style={{ width: 44, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, cursor: 'pointer', flexShrink: 0 }}>
                {isDark ? <Sun size={16} color={C.text60} /> : <Moon size={16} color={C.text60} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO ══ */}
      <section className="landing-hero" style={{ position: 'relative', zIndex: 1, padding: '120px 24px 100px', textAlign: 'center', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ marginBottom: 32 }}>
            <SectionBadge><Sparkles size={11} /> {t('landing.heroBadge')}</SectionBadge>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(48px, 9vw, 100px)', fontWeight: 700, letterSpacing: '-0.048em', lineHeight: 0.97, color: C.text, marginBottom: 8 }}>
            {t('landing.hero')}
          </h1>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(48px, 9vw, 100px)', fontWeight: 700, letterSpacing: '-0.048em', lineHeight: 0.97, marginBottom: 32, background: `linear-gradient(135deg,${LIME} 0%,#34d399 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('landing.heroGradient')}
          </h1>

          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(16px, 2vw, 18px)', color: C.text45, fontWeight: 400, lineHeight: 1.72, maxWidth: 540, margin: '0 auto 48px' }}>
            {t('landing.heroSub')}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', fontSize: 15, fontWeight: 700, ...btnPrimary, borderRadius: 12, textDecoration: 'none', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = btnPrimaryHover.boxShadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
            >
              {t('landing.cta')} <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a href="#preview" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', fontSize: 15, fontWeight: 500, color: C.text60, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, textDecoration: 'none', transition: 'background 200ms, color 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = C.text60; }}
            >
              <Play size={14} fill="currentColor" /> {t('landing.watchDemo')}
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'center' }}>
            {CHECKS.map(x => (
              <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} color={LIME} strokeWidth={2.5} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: C.text35 }}>{x}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.marqueeBg, overflow: 'hidden', padding: '13px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeScroll 26s linear infinite', gap: 0 }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 26px', fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: C.marqueeText, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              <Zap size={10} color={LIME} fill={LIME} /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div style={{ position: 'relative', zIndex: 1, borderBottom: `1px solid ${C.border}`, background: C.statsRow }}>
        <div className="landing-stats-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map(({ n, label }, i) => (
            <motion.div key={i} {...vu(i * 0.08)} style={{ padding: '36px 16px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.statsBorder}` : 'none' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: LIME }}>{n}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: C.text28, marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ APP PREVIEW ══ */}
      <section id="preview" className="landing-preview-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge color="#38bdf8" bg="rgba(56,189,248,0.1)" border="rgba(56,189,248,0.2)"><Play size={10} fill="#38bdf8" /> {t('landing.previewBadge')}</SectionBadge>
            <SectionH2 textColor={C.text} style={{ maxWidth: 460 }}>
              {t('landing.previewTitle1')}{' '}
              <span style={{ background: `linear-gradient(135deg,${LIME},#34d399)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('landing.previewTitle2')}</span>
            </SectionH2>
          </motion.div>
          <motion.div {...vu(0.1)}><AppPreview /></motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="landing-features" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge><Sparkles size={11} /> {t('landing.featuresBadge')}</SectionBadge>
            <SectionH2 textColor={C.text} style={{ maxWidth: 520 }}>
              {t('landing.featuresTitle1')}{' '}
              <span style={{ background: `linear-gradient(135deg,${LIME},#34d399)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('landing.featuresTitle2')}</span>
            </SectionH2>
          </motion.div>

          <div className="landing-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {FEATURES.filter(f => f.featured).map(({ icon: Icon, color, bg, border, title, body }, i) => (
              <motion.div key={i} {...vu(i * 0.1)} style={{ padding: '40px 36px', borderRadius: 18, background: C.card, border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', transition: 'transform 220ms, border-color 220ms, box-shadow 220ms', cursor: 'default', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = isDark ? `0 24px 60px rgba(0,0,0,0.4)` : `0 16px 48px rgba(0,0,0,0.1)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 15, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color={color} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: 10 }}>{title}</h3>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: C.text45, lineHeight: 1.7 }}>{body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {FEATURES.filter(f => !f.featured).map(({ icon: Icon, color, bg, border, title, body }, i) => (
              <motion.div key={i} {...vu(i * 0.06)} style={{ padding: '28px 26px', borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', transition: 'transform 200ms, border-color 200ms, background 200ms, box-shadow 200ms', cursor: 'default', boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = border; e.currentTarget.style.background = bg; e.currentTarget.style.boxShadow = isDark ? `0 20px 48px rgba(0,0,0,0.36)` : `0 12px 36px rgba(0,0,0,0.09)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={18} color={color} strokeWidth={2} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '-0.025em', color: C.text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: C.text40, lineHeight: 1.68 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" className="landing-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}`, background: C.sectionAlt }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge color="#34d399" bg="rgba(52,211,153,0.1)" border="rgba(52,211,153,0.2)"><Play size={10} fill="#34d399" /> {t('landing.howBadge')}</SectionBadge>
            <SectionH2 textColor={C.text}>{t('landing.howTitle')}</SectionH2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {STEPS.map(({ n, color, title, body }, i) => (
              <motion.div key={n} {...vu(i * 0.12)} style={{ padding: '40px 32px', borderRadius: 18, background: C.card, border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ position: 'absolute', top: -14, right: 16, fontFamily: "'Space Grotesk',sans-serif", fontSize: 110, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.05em', color: C.stepNum, pointerEvents: 'none', userSelect: 'none' }}>{n}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}40`, marginBottom: 22 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color }}>{n}</span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: C.text40, lineHeight: 1.7 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TUTORIAL ══ */}
      <section id="tutorial" className="landing-tutorial-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge color="#B9FF66" bg="rgba(185,255,102,0.1)" border="rgba(185,255,102,0.2)"><BookOpen size={11} /> {t('landing.tutorialBadge')}</SectionBadge>
            <SectionH2 textColor={C.text} style={{ maxWidth: 560 }}>
              {t('landing.tutorialTitle1')}{' '}
              <span style={{ background: `linear-gradient(135deg,${LIME},#38bdf8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('landing.tutorialTitle2')}
              </span>
            </SectionH2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15.5, color: C.text40, lineHeight: 1.7, maxWidth: 500, margin: '16px auto 0' }}>
              {t('landing.tutorialSub')}
            </p>
          </motion.div>
          <TutorialContent C={C} t={t} />
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="landing-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}`, background: C.sectionAlt }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionBadge color="#fbbf24" bg="rgba(251,191,36,0.1)" border="rgba(251,191,36,0.2)"><Star size={11} fill="#fbbf24" /> {t('landing.testBadge')}</SectionBadge>
            <SectionH2 textColor={C.text}>{t('landing.testTitle')}</SectionH2>
          </motion.div>
          <div className="landing-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {TESTIMONIALS.map(({ name, role, text }, i) => (
              <motion.div key={i} {...vu(i * 0.1)} style={{ padding: '30px 26px', borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: C.text60, lineHeight: 1.7, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${LIME},${LIME2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#191A23' }}>{name[0]}</div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{name}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.text35 }}>{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="landing-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...vu()}>
            <SectionBadge color="#34d399" bg="rgba(52,211,153,0.1)" border="rgba(52,211,153,0.2)">{t('landing.priceBadge')}</SectionBadge>
            <SectionH2 textColor={C.text} style={{ marginBottom: 44 }}>{t('landing.priceTitle')}</SectionH2>

            <div style={{ padding: '48px 40px', borderRadius: 22, background: C.pricingCard, border: `1px solid ${LIME}40`, position: 'relative', overflow: 'hidden', boxShadow: isDark ? `0 20px 80px ${LIME}12` : `0 8px 48px ${LIME}14` }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${LIME}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 62, fontWeight: 700, letterSpacing: '-0.05em', color: LIME, lineHeight: 1 }}>{t('landing.priceFree')}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: C.text40, marginTop: 8, marginBottom: 34 }}>{t('landing.priceForever')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 34, textAlign: 'left' }}>
                  {PRICE_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={15} color={LIME} strokeWidth={2.5} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14.5, color: C.text60 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', fontSize: 15, fontWeight: 700, ...btnPrimary, borderRadius: 12, textDecoration: 'none', transition: 'transform 200ms, box-shadow 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = btnPrimaryHover.boxShadow; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
                >
                  {t('landing.priceBtn')} <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ DOWNLOAD ══ */}
      <section id="download" className="landing-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}`, background: C.sectionAlt }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...vu()}>
            <SectionBadge color="#38bdf8" bg="rgba(56,189,248,0.1)" border="rgba(56,189,248,0.2)"><Download size={11} /> {t('landing.dlBadge')}</SectionBadge>
            <SectionH2 textColor={C.text} style={{ marginBottom: 14 }}>{t('landing.dlTitle')}</SectionH2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, color: C.text40, lineHeight: 1.65, maxWidth: 460, margin: '0 auto 52px' }}>{t('landing.dlSub')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <motion.div {...vu(0.08)} style={{ padding: '36px 32px', borderRadius: 20, background: C.card, border: '1px solid rgba(52,211,153,0.22)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Smartphone size={22} color="#34d399" strokeWidth={2} /></div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Android</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: C.text40, lineHeight: 1.6, marginBottom: 24 }}>{t('landing.dlAndroidDesc')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
                  {[t('landing.dlAndroidF1'), t('landing.dlAndroidF2'), t('landing.dlAndroidF3')].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={13} color="#34d399" strokeWidth={2.5} /><span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: C.text45 }}>{f}</span></div>
                  ))}
                </div>
                <a href="https://github.com/XasanMhls/-/releases/download/v1.0.0/app-debug.apk" download style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#0a0c14', background: '#34d399', borderRadius: 12, textDecoration: 'none', boxShadow: '0 6px 28px rgba(52,211,153,0.38)', transition: 'transform 200ms, box-shadow 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                ><Download size={14} strokeWidth={2.5} /> {t('landing.dlAndroidBtn')}</a>
              </motion.div>

              <motion.div {...vu(0.14)} style={{ padding: '36px 32px', borderRadius: 20, background: C.card, border: '1px solid rgba(56,189,248,0.22)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Monitor size={22} color="#38bdf8" strokeWidth={2} /></div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Windows</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: C.text40, lineHeight: 1.6, marginBottom: 24 }}>{t('landing.dlWindowsDesc')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
                  {[t('landing.dlWindowsF1'), t('landing.dlWindowsF2'), t('landing.dlWindowsF3')].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={13} color="#38bdf8" strokeWidth={2.5} /><span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: C.text45 }}>{f}</span></div>
                  ))}
                </div>
                <a href="https://github.com/XasanMhls/-/releases/download/v1.0.0/chronos-windows.zip" download style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#0a0c14', background: '#38bdf8', borderRadius: 12, textDecoration: 'none', boxShadow: '0 6px 28px rgba(56,189,248,0.38)', transition: 'transform 200ms, box-shadow 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                ><Download size={14} strokeWidth={2.5} /> {t('landing.dlWindowsBtn')}</a>
              </motion.div>
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12.5, color: C.text25, marginTop: 26 }}>{t('landing.dlCloud')}</p>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="landing-section" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <motion.div {...vu()} style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge>FAQ</SectionBadge>
            <SectionH2 textColor={C.text}>{t('landing.faqTitle')}</SectionH2>
          </motion.div>
          <motion.div {...vu(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map(({ q, a }, i) => <FaqItem key={i} q={q} a={a} />)}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="landing-cta-banner" style={{ position: 'relative', zIndex: 1, margin: '80px 40px', borderRadius: 22, overflow: 'hidden', padding: '80px 48px', textAlign: 'center', background: isDark ? `linear-gradient(135deg,${LIME}14 0%,rgba(52,211,153,0.06) 100%)` : `linear-gradient(135deg,${LIME}0a 0%,rgba(52,211,153,0.04) 100%)`, border: `1px solid ${LIME}${isDark ? '30' : '25'}` }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${LIME}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <SectionBadge><Zap size={11} fill={LIME} /> {t('landing.ctaBadge')}</SectionBadge>
          </div>
          <SectionH2 textColor={C.text} style={{ marginBottom: 18 }}>{t('landing.ctaTitle')}</SectionH2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16.5, color: C.text45, lineHeight: 1.65, maxWidth: 400, margin: '0 auto 36px' }}>{t('landing.ctaSub')}</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', fontSize: 15, fontWeight: 700, ...btnPrimary, borderRadius: 12, textDecoration: 'none', transition: 'transform 200ms, box-shadow 200ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = btnPrimaryHover.boxShadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
          >
            {t('landing.cta')} <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="landing-footer landing-footer-grid" style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${C.border}`, padding: '40px 56px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'start', gap: 40, background: C.footerBg, backdropFilter: 'blur(20px)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${LIME},${LIME2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color="#191A23" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.04em', color: C.text }}>Chronos</span>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: C.text28, lineHeight: 1.65, maxWidth: 220 }}>{t('landing.footerTagline')}</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.text18, marginTop: 14 }}>© 2025 Chronos</p>
        </div>
        {[
          { title: t('landing.footerProduct'), links: [['#features', t('landing.footerFeatures')],['#how', t('landing.footerHowItWorks')],['#faq','FAQ']] },
          { title: t('landing.footerAccount'), links: [['/login', t('landing.footerLogin')],['/register', t('landing.footerRegister')]] },
          { title: t('landing.footerLegal'),   links: [['#', t('landing.footerPrivacy')],['#', t('landing.footerTerms')]] },
        ].map(({ title, links }) => (
          <div key={title}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: C.text35, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(([href, label]) => (
                href.startsWith('/') ? (
                  <Link key={label} to={href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: C.text40, textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.text40}
                  >{label}</Link>
                ) : (
                  <a key={label} href={href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: C.text40, textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.text40}
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
