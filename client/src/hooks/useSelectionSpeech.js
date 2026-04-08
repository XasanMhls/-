/**
 * useSelectionSpeech — speaks selected text aloud via AI voice.
 *
 * Shows a small floating "speak" button near the selection.
 * On click, reads the selected text using VoiceProvider with auto language detection.
 */
import { useEffect, useRef, useCallback } from 'react';
import { voice } from '../voice/VoiceProvider.js';
import { detectLang } from './useLanguageDetect.js';

export function useSelectionSpeech() {
  const btnRef = useRef(null);
  const activeRef = useRef(false);

  const cleanup = useCallback(() => {
    if (btnRef.current) {
      btnRef.current.remove();
      btnRef.current = null;
    }
    activeRef.current = false;
  }, []);

  const speakText = useCallback((text) => {
    if (!text || !voice.isSupported()) return;
    voice.stop();
    const { lang } = detectLang(text);
    voice.speak(text, lang);
  }, []);

  useEffect(() => {
    function createBtn(x, y, text) {
      cleanup();

      const btn = document.createElement('button');
      btn.className = 'selection-speak-btn';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      btn.title = 'Speak selected text';

      Object.assign(btn.style, {
        position: 'fixed',
        left: `${Math.min(x, window.innerWidth - 48)}px`,
        top: `${Math.max(y - 44, 4)}px`,
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #B9FF66, #d4ff99)',
        color: '#191A23',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(185,255,102,0.4), 0 2px 4px rgba(0,0,0,0.2)',
        animation: 'fadeIn 150ms ease',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.12)';
        btn.style.boxShadow = '0 6px 24px rgba(185,255,102,0.55), 0 2px 6px rgba(0,0,0,0.25)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 16px rgba(185,255,102,0.4), 0 2px 4px rgba(0,0,0,0.2)';
      });

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        speakText(text);

        // Animate the button on click
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 100);

        // Remove after short delay
        setTimeout(cleanup, 600);
      });

      document.body.appendChild(btn);
      btnRef.current = btn;
      activeRef.current = true;
    }

    function onMouseUp(e) {
      // Small delay to let the browser finalize selection
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (text && text.length >= 2) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          createBtn(rect.left + rect.width / 2 - 18, rect.top, text);
        } else {
          // Don't remove if clicking the speak button itself
          if (btnRef.current && !btnRef.current.contains(e.target)) {
            cleanup();
          }
        }
      }, 10);
    }

    function onMouseDown(e) {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      cleanup();
    }

    function onKeyDown() {
      cleanup();
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      cleanup();
    };
  }, [cleanup, speakText]);
}
