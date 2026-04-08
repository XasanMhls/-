/**
 * VoiceProvider — abstraction layer for TTS.
 *
 * Fallback chain:
 *   1. Preferred provider for lang (ElevenLabs for ru/en, browser TTS for uz)
 *   2. Browser TTS with detected language
 *   3. Browser TTS with English voices
 *   4. Browser TTS with any available voice
 *   5. Silent fail (never throws to caller)
 *
 * Language detection: Cyrillic script → ru (or uz if Uzbek Cyrillic chars present),
 * Latin script → en (or uz if Uzbek Latin markers present). Default = 'en'.
 */
import { elevenLabsProvider } from './elevenLabsProvider.js';
import { speechSynthesisProvider } from './speechSynthesisProvider.js';

const SUPPORTED_LANGS = new Set(['ru', 'en', 'uz']);

function getProviderForLang(lang) {
  // Use browser TTS directly when no ElevenLabs key is configured
  if (!elevenLabsProvider.isSupported()) return speechSynthesisProvider;
  if (lang === 'uz') return speechSynthesisProvider;
  return elevenLabsProvider;
}

export const voice = {
  isSupported: () => elevenLabsProvider.isSupported() || speechSynthesisProvider.isSupported(),

  async speak(text, lang = 'en', options = {}) {
    const safeLang = SUPPORTED_LANGS.has(lang) ? lang : 'en';
    const provider = getProviderForLang(safeLang);

    try {
      await provider.speak(text, safeLang, options);
    } catch (err) {
      console.warn('[VoiceProvider] provider failed:', err?.message);
      // Fallback to browser TTS if a different provider was used
      if (provider !== speechSynthesisProvider && speechSynthesisProvider.isSupported()) {
        try {
          await speechSynthesisProvider.speak(text, safeLang, options);
        } catch (e2) {
          console.warn('[VoiceProvider] browser TTS fallback also failed:', e2?.message);
        }
      }
    }
  },

  stop: () => {
    elevenLabsProvider.stop?.();
    speechSynthesisProvider.stop?.();
  },

  getVoices: (lang) => getProviderForLang(lang ?? 'en').getVoices?.(lang) || [],

  buildReminderText: (reminder, lang) =>
    getProviderForLang(SUPPORTED_LANGS.has(lang) ? lang : 'en').buildReminderText(reminder, lang ?? 'en'),

  /**
   * Speak a reminder using the best available language and provider.
   * Never throws — all errors are caught and logged silently.
   */
  async speakReminder(reminder) {
    const lang = resolveLang(reminder);
    const provider = getProviderForLang(lang);
    const text = provider.buildReminderText(reminder, lang);

    // Attempt 1: preferred provider
    try {
      return await provider.speak(text, lang);
    } catch (err) {
      console.warn(`[VoiceProvider] ${lang} provider failed:`, err?.message);
    }

    if (!speechSynthesisProvider.isSupported()) {
      console.warn('[VoiceProvider] Web Speech API not available — voice skipped');
      return;
    }

    // Attempt 2: browser TTS with same language
    if (provider !== speechSynthesisProvider) {
      try {
        return await speechSynthesisProvider.speak(text, lang);
      } catch (err) {
        console.warn('[VoiceProvider] browser TTS failed for', lang, ':', err?.message);
      }
    }

    // Attempt 3: browser TTS with English as fallback language
    if (lang !== 'en') {
      try {
        const enText = speechSynthesisProvider.buildReminderText(reminder, 'en');
        return await speechSynthesisProvider.speak(enText, 'en');
      } catch (err) {
        console.warn('[VoiceProvider] English browser TTS fallback failed:', err?.message);
      }
    }

    // All attempts exhausted — silent fail (sound + toast still work)
  },
};

/* ─── Language resolution ────────────────────────────────── */

/**
 * Resolve language for a reminder:
 *   1. reminder.language (explicit user setting, not 'auto')
 *   2. localStorage chronos_lang (app UI language)
 *   3. Auto-detect from text content
 *   4. English default
 */
function resolveLang(reminder) {
  if (reminder.language && reminder.language !== 'auto' && SUPPORTED_LANGS.has(reminder.language)) {
    return reminder.language;
  }

  const stored = localStorage.getItem('chronos_lang');
  if (stored && SUPPORTED_LANGS.has(stored)) return stored;

  return detectLanguage(reminder);
}

/**
 * Auto-detect language from reminder text.
 *
 * Algorithm:
 * - Count Cyrillic vs Latin characters to determine primary script
 * - In Cyrillic text: check for Uzbek Cyrillic exclusive letters (Ўў Ҳҳ Ққ Ғғ)
 * - In Latin text: check for Uzbek Latin markers (ʻ ʼ) or common Uzbek words
 * - Ambiguous / no text → English (safe default for international users)
 */
function detectLanguage(reminder) {
  const text = `${reminder.title || ''} ${reminder.description || ''}`.trim();

  if (!text) return 'en';

  const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) || []).length;
  const latinCount    = (text.match(/[a-zA-Z]/g) || []).length;
  const totalAlpha    = cyrillicCount + latinCount;

  if (totalAlpha === 0) return 'en';

  const cyrillicRatio = cyrillicCount / totalAlpha;

  if (cyrillicRatio >= 0.5) {
    // Predominantly Cyrillic — Uzbek Cyrillic has unique chars not in Russian
    // Ўў = U+040E/U+045E, Ҳҳ = U+04B2/U+04B3, Ққ = U+049A/U+049B, Ғғ = U+0492/U+0493
    if (/[ЎўҲҳҚқҒғ]/.test(text)) return 'uz';
    return 'ru';
  }

  if (cyrillicRatio <= 0.2) {
    // Predominantly Latin — check Uzbek Latin script markers
    // Modern Uzbek Latin: ʻ (U+02BB modifier letter turned comma) and ʼ (U+02BC)
    // Also accept backtick/apostrophe substitutes like o` g` used in casual writing
    if (/[ʻʼ]/.test(text)) return 'uz';
    if (/\b(o[`']|g[`'])\b/i.test(text)) return 'uz';

    // Common short Uzbek function words (unlikely in English/Russian Latin)
    if (/\b(va|bu|bir|uchun|bilan|kerak|yo[qʻ`']|ham\b|emas|bor\b|siz|men\b|sen\b)\b/i.test(text)) return 'uz';

    return 'en';
  }

  // Mixed script (e.g. code + human text) — default to English
  return 'en';
}
