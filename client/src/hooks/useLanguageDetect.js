/**
 * useLanguageDetect — global language detection hook.
 *
 * Exports:
 *   detectLang(text)  — pure function, returns { lang, confidence }
 *   useLanguageDetect() — React hook with reactive state
 */
import { useState, useCallback, useRef } from 'react';

const LANG_LABELS = { ru: 'RU', en: 'EN', uz: 'UZ' };
const LANG_FLAGS  = { ru: '🇷🇺', en: '🇬🇧', uz: '🇺🇿' };

/**
 * Pure language detector — no React state, can be used anywhere.
 * @param {string} text
 * @returns {{ lang: 'ru'|'en'|'uz', confidence: number }}
 */
export function detectLang(text) {
  if (!text || !text.trim()) return { lang: 'en', confidence: 0 };

  const t = text.trim();
  const cyrillicCount = (t.match(/[\u0400-\u04FF]/g) || []).length;
  const latinCount    = (t.match(/[a-zA-Z]/g) || []).length;
  const totalAlpha    = cyrillicCount + latinCount;

  if (totalAlpha === 0) return { lang: 'en', confidence: 0 };

  const cyrillicRatio = cyrillicCount / totalAlpha;

  // Predominantly Cyrillic
  if (cyrillicRatio >= 0.5) {
    // Uzbek Cyrillic has exclusive chars: Ўў Ҳҳ Ққ Ғғ
    if (/[ЎўҲҳҚқҒғ]/.test(t)) return { lang: 'uz', confidence: 0.92 };
    return { lang: 'ru', confidence: Math.min(0.97, 0.55 + cyrillicRatio * 0.44) };
  }

  // Predominantly Latin
  if (cyrillicRatio <= 0.2) {
    // Modern Uzbek Latin: ʻ (U+02BB) or ʼ (U+02BC), or casual o` g`
    if (/[ʻʼ]/.test(t)) return { lang: 'uz', confidence: 0.88 };
    if (/\b(o[`']|g[`'])\b/i.test(t)) return { lang: 'uz', confidence: 0.82 };
    // Frequent Uzbek function words unlikely in English
    if (/\b(va\b|bu\b|bir\b|uchun|bilan|kerak|ham\b|emas\b|bor\b|siz\b|men\b|sen\b)\b/i.test(t)) {
      return { lang: 'uz', confidence: 0.72 };
    }
    return { lang: 'en', confidence: Math.min(0.97, 0.55 + (1 - cyrillicRatio) * 0.44) };
  }

  // Mixed script — default to English
  return { lang: 'en', confidence: 0.3 };
}

/** Human-readable label for a lang code */
export function langLabel(lang) { return LANG_LABELS[lang] ?? lang?.toUpperCase() ?? 'EN'; }
export function langFlag(lang)  { return LANG_FLAGS[lang]  ?? '🌐'; }

/**
 * React hook — detects language reactively as text changes.
 * @param {string} [initialText='']
 * @returns {{ lang, confidence, detect, label, flag }}
 */
export function useLanguageDetect(initialText = '') {
  const [result, setResult] = useState(() => detectLang(initialText));
  const debounceRef = useRef(null);

  /** Call with text input to update detected language (debounced 200ms). */
  const detect = useCallback((text) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResult(detectLang(text));
    }, 200);
    // Return synchronous result immediately for callers who need it now
    return detectLang(text).lang;
  }, []);

  return {
    lang:       result.lang,
    confidence: result.confidence,
    label:      langLabel(result.lang),
    flag:       langFlag(result.lang),
    detect,
  };
}
