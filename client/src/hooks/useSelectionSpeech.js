/**
 * useSelectionSpeech — speaks selected text with a floating mini-player.
 *
 * States:
 *   idle     → [🔊]        user sees speaker button, click to start
 *   speaking → [⏸][✕]     playing, click pause or stop
 *   paused   → [▶][✕]     paused, click resume or stop
 *
 * Speech ends naturally → panel auto-dismisses.
 */
import { useEffect, useRef, useCallback } from 'react';
import { detectLang } from './useLanguageDetect.js';
import { useSpeech } from './useSpeech.js';

const ICON_SPEAKER = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
const ICON_PAUSE  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>`;
const ICON_PLAY   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const ICON_STOP   = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

export function useSelectionSpeech() {
  const { speak, stop, pause, resume, speaking, paused } = useSpeech();

  const panelRef       = useRef(null);
  const textRef        = useRef('');
  const touchTimerRef  = useRef(null);
  // Always-fresh handler refs so DOM listeners never go stale
  const toggleRef      = useRef(null);
  const stopRef        = useRef(null);

  const isTouchDevice = typeof window !== 'undefined'
    ? 'ontouchstart' in window || navigator.maxTouchPoints > 0
    : false;

  // ── Cleanup ────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    panelRef.current?.remove();
    panelRef.current = null;
    textRef.current = '';
    clearTimeout(touchTimerRef.current);
    touchTimerRef.current = null;
  }, []);

  // ── Handlers (updated every render via refs) ───────────────
  toggleRef.current = () => {
    if (!speaking && !paused) {
      const text = textRef.current;
      if (!text) return;
      const { lang } = detectLang(text);
      speak(text, lang);
    } else if (speaking && !paused) {
      pause();
    } else if (paused) {
      resume();
    }
  };

  stopRef.current = () => {
    stop();
    cleanup();
  };

  // ── Auto-dismiss when speech ends naturally ────────────────
  useEffect(() => {
    if (!speaking && !paused && panelRef.current) {
      const t = setTimeout(() => {
        if (!speaking && !paused) cleanup();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [speaking, paused, cleanup]);

  // ── Update toggle button icon on state change ──────────────
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const toggleBtn = panel.querySelector('.sp-toggle');
    const stopBtn   = panel.querySelector('.sp-stop');
    if (!toggleBtn) return;

    if (paused) {
      toggleBtn.innerHTML = ICON_PLAY;
      toggleBtn.title = 'Продолжить';
    } else if (speaking) {
      toggleBtn.innerHTML = ICON_PAUSE;
      toggleBtn.title = 'Пауза';
    } else {
      toggleBtn.innerHTML = ICON_SPEAKER;
      toggleBtn.title = 'Озвучить';
    }

    // Stop button visible only while speech is active
    if (stopBtn) {
      stopBtn.style.display = (speaking || paused) ? 'flex' : 'none';
    }
  }, [speaking, paused]);

  // ── Create floating panel ──────────────────────────────────
  const createPanel = useCallback((x, y, text) => {
    panelRef.current?.remove();
    textRef.current = text;

    const btnSize = isTouchDevice ? 40 : 34;
    const gap     = 4;
    const totalW  = btnSize * 2 + gap;
    const left    = Math.min(Math.max(x - btnSize / 2, 8), window.innerWidth - totalW - 8);
    const top     = Math.max(y - btnSize - 10, 8);

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'fixed',
      left: `${left}px`,
      top:  `${top}px`,
      zIndex: '9999',
      display: 'flex',
      gap: `${gap}px`,
      animation: 'fadeIn 150ms ease',
    });

    const mkBtn = (cls, icon, title, bg, color, shadow) => {
      const btn = document.createElement('button');
      btn.className = cls;
      btn.innerHTML = icon;
      btn.title = title;
      Object.assign(btn.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${btnSize}px`,
        height: `${btnSize}px`,
        borderRadius: '10px',
        border: 'none',
        background: bg,
        color,
        cursor: 'pointer',
        boxShadow: shadow,
        transition: 'transform 120ms ease',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        flexShrink: '0',
      });
      return btn;
    };

    const toggleBtn = mkBtn(
      'sp-toggle',
      ICON_SPEAKER,
      'Озвучить',
      'linear-gradient(135deg, #B9FF66, #d4ff99)',
      '#191A23',
      '0 4px 16px rgba(185,255,102,0.4), 0 2px 4px rgba(0,0,0,0.2)',
    );

    const stopBtn = mkBtn(
      'sp-stop',
      ICON_STOP,
      'Остановить',
      'rgba(28, 28, 38, 0.92)',
      '#aaa',
      '0 4px 12px rgba(0,0,0,0.3)',
    );
    stopBtn.style.display = 'none'; // hidden until speech starts

    if (!isTouchDevice) {
      const addHover = (el) => {
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.1)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
      };
      addHover(toggleBtn);
      addHover(stopBtn);
    }

    // Prevent mousedown from collapsing the text selection
    const noDefault = (e) => { e.preventDefault(); e.stopPropagation(); };
    toggleBtn.addEventListener('mousedown', noDefault);
    stopBtn.addEventListener('mousedown', noDefault);

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleRef.current?.();
    });

    stopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopRef.current?.();
    });

    // Mobile: prevent touchstart from triggering selectionchange cleanup
    panel.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });

    panel.appendChild(toggleBtn);
    panel.appendChild(stopBtn);
    document.body.appendChild(panel);
    panelRef.current = panel;
  }, [isTouchDevice]);

  // ── Event wiring ───────────────────────────────────────────
  useEffect(() => {
    function getSelectionPos() {
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (!text || text.length < 2) return null;
      try {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;
        return { x: rect.left + rect.width / 2, y: rect.top, text };
      } catch (_) { return null; }
    }

    function onMouseUp(e) {
      if (isTouchDevice) return;
      setTimeout(() => {
        const pos = getSelectionPos();
        if (pos) {
          createPanel(pos.x, pos.y, pos.text);
        } else if (panelRef.current && !panelRef.current.contains(e.target)) {
          // Only cleanup if no speech active
          if (!speaking && !paused) cleanup();
        }
      }, 10);
    }

    function onMouseDown(e) {
      if (isTouchDevice) return;
      if (panelRef.current?.contains(e.target)) return;
      // Dismiss idle panel; keep panel if speech is active
      if (!speaking && !paused) cleanup();
    }

    function onSelectionChange() {
      if (!isTouchDevice) return;
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
        const pos = getSelectionPos();
        if (pos) {
          createPanel(pos.x, pos.y, pos.text);
        } else if (!speaking && !paused) {
          cleanup();
        }
      }, 300);
    }

    function onTouchStart(e) {
      if (!isTouchDevice) return;
      if (panelRef.current?.contains(e.target)) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if ((!sel?.toString().trim()) && !speaking && !paused) cleanup();
      }, 120);
    }

    function onKeyDown() {
      if (!speaking && !paused) cleanup();
    }

    document.addEventListener('mouseup',         onMouseUp);
    document.addEventListener('mousedown',        onMouseDown);
    document.addEventListener('selectionchange',  onSelectionChange);
    document.addEventListener('touchstart',       onTouchStart,  { passive: true });
    document.addEventListener('keydown',          onKeyDown);

    return () => {
      document.removeEventListener('mouseup',         onMouseUp);
      document.removeEventListener('mousedown',        onMouseDown);
      document.removeEventListener('selectionchange',  onSelectionChange);
      document.removeEventListener('touchstart',       onTouchStart);
      document.removeEventListener('keydown',          onKeyDown);
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanup, createPanel, isTouchDevice, speaking, paused]);
}
