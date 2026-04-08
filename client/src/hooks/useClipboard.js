/**
 * useClipboard — global clipboard hook.
 *
 * Usage:
 *   const { copy, paste, copied, supported } = useClipboard();
 *
 * - copy(text)   writes to clipboard, sets copied=true for resetDelay ms
 * - paste()      reads from clipboard (requires permission), returns string|null
 * - copied       true briefly after a successful copy (use for UI feedback)
 * - supported    false if neither Clipboard API nor execCommand is available
 * - error        last error message, or null
 */
import { useState, useCallback, useRef } from 'react';

export function useClipboard({ resetDelay = 2000 } = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError]   = useState(null);
  const timerRef = useRef(null);

  const supported =
    typeof navigator !== 'undefined' &&
    (!!navigator.clipboard || typeof document.execCommand === 'function');

  const _flash = useCallback(() => {
    clearTimeout(timerRef.current);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), resetDelay);
  }, [resetDelay]);

  /**
   * Copy text to clipboard.
   * Tries modern Clipboard API first, falls back to execCommand.
   * @param {string} text
   * @returns {Promise<boolean>} true on success
   */
  const copy = useCallback(async (text) => {
    if (!text) return false;
    setError(null);

    // Modern Clipboard API (HTTPS or localhost only)
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        _flash();
        return true;
      } catch (_) {
        // Fallthrough to legacy method (e.g. clipboard-read permission not granted)
      }
    }

    // Legacy execCommand fallback (works in HTTP, iframe, etc.)
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      if (ok) { _flash(); return true; }
      throw new Error('execCommand returned false');
    } catch (err) {
      setError(err?.message ?? 'Copy failed');
      return false;
    }
  }, [_flash]);

  /**
   * Read text from clipboard.
   * Requires user gesture + clipboard-read permission in Chrome.
   * @returns {Promise<string|null>}
   */
  const paste = useCallback(async () => {
    setError(null);
    if (navigator?.clipboard?.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        setError(err?.message ?? 'Paste failed');
      }
    }
    return null;
  }, []);

  return { copy, paste, copied, error, supported };
}
