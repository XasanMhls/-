/**
 * useSelectionSpeech — speaks selected text aloud via AI voice.
 *
 * Shows a small floating "speak" button near the selection.
 * On click/tap, reads the selected text using VoiceProvider with auto language detection.
 *
 * Supports both desktop (mouseup) and mobile (touch selection via selectionchange).
 */
import { useEffect, useRef, useCallback } from 'react';
import { voice } from '../voice/VoiceProvider.js';
import { detectLang } from './useLanguageDetect.js';

export function useSelectionSpeech() {
  const btnRef = useRef(null);
  const activeRef = useRef(false);
  const touchSelectionTimer = useRef(null);

  const cleanup = useCallback(() => {
    if (btnRef.current) {
      btnRef.current.remove();
      btnRef.current = null;
    }
    activeRef.current = false;
    if (touchSelectionTimer.current) {
      clearTimeout(touchSelectionTimer.current);
      touchSelectionTimer.current = null;
    }
  }, []);

  const speakText = useCallback((text) => {
    if (!text || !voice.isSupported()) return;
    voice.stop();
    const { lang } = detectLang(text);
    voice.speak(text, lang);
  }, []);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function createBtn(x, y, text) {
      cleanup();

      const btn = document.createElement('button');
      btn.className = 'selection-speak-btn';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      btn.title = 'Speak selected text';

      const btnSize = isTouchDevice ? 42 : 36;

      Object.assign(btn.style, {
        position: 'fixed',
        left: `${Math.min(Math.max(x - btnSize / 2, 8), window.innerWidth - btnSize - 8)}px`,
        top: `${Math.max(y - btnSize - 8, 8)}px`,
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${btnSize}px`,
        height: `${btnSize}px`,
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #B9FF66, #d4ff99)',
        color: '#191A23',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(185,255,102,0.4), 0 2px 4px rgba(0,0,0,0.2)',
        animation: 'fadeIn 150ms ease',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      });

      if (!isTouchDevice) {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'scale(1.12)';
          btn.style.boxShadow = '0 6px 24px rgba(185,255,102,0.55), 0 2px 6px rgba(0,0,0,0.25)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'scale(1)';
          btn.style.boxShadow = '0 4px 16px rgba(185,255,102,0.4), 0 2px 4px rgba(0,0,0,0.2)';
        });
      }

      // Use click for both mouse and touch — it fires on both and counts as user gesture
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        speakText(text);

        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          if (btn.parentNode) btn.style.transform = 'scale(1)';
        }, 100);

        setTimeout(cleanup, 600);
      });

      // Prevent mousedown from clearing selection
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // Prevent touch from clearing selection
      btn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });

      document.body.appendChild(btn);
      btnRef.current = btn;
      activeRef.current = true;
    }

    function showBtnForSelection() {
      const sel = window.getSelection();
      const text = sel?.toString().trim();

      if (text && text.length >= 2) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;
          createBtn(rect.left + rect.width / 2, rect.top, text);
        } catch (_) {}
      }
    }

    // ── Desktop: mouseup/mousedown ──
    function onMouseUp(e) {
      if (isTouchDevice) return;
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (text && text.length >= 2) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          createBtn(rect.left + rect.width / 2, rect.top, text);
        } else {
          if (btnRef.current && !btnRef.current.contains(e.target)) {
            cleanup();
          }
        }
      }, 10);
    }

    function onMouseDown(e) {
      if (isTouchDevice) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      cleanup();
    }

    // ── Mobile: selectionchange ──
    // On mobile, users long-press to select text. The browser fires
    // selectionchange events as the selection handles are moved.
    function onSelectionChange() {
      if (!isTouchDevice) return;

      // Debounce — wait for selection to stabilize
      if (touchSelectionTimer.current) clearTimeout(touchSelectionTimer.current);

      touchSelectionTimer.current = setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (text && text.length >= 2) {
          showBtnForSelection();
        } else {
          // Only clean up if not clicking the speak button
          if (btnRef.current) cleanup();
        }
      }, 300);
    }

    // On mobile, touching elsewhere should dismiss the button
    function onTouchStart(e) {
      if (!isTouchDevice) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      // Small delay to allow selectionchange to fire first
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text || text.length < 2) {
          cleanup();
        }
      }, 100);
    }

    function onKeyDown() {
      cleanup();
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('keydown', onKeyDown);
      cleanup();
    };
  }, [cleanup, speakText]);
}
