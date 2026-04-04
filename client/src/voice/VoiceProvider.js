/**
 * VoiceProvider — abstraction layer for TTS.
 * Switch provider here to use ElevenLabs, OpenAI TTS, etc.
 *
 * Provider interface:
 *   isSupported(): boolean
 *   speak(text, lang, options?): Promise<void>
 *   stop(): void
 *   getVoices(lang?): Voice[]
 *   buildReminderText(reminder, lang): string
 */
import { elevenLabsProvider } from './elevenLabsProvider.js';
import { speechSynthesisProvider } from './speechSynthesisProvider.js';

// ElevenLabs — основной провайдер (Jarvis-like голос, мультиязычный)
// Если запрос упадёт — fallback на браузерный TTS
const activeProvider = elevenLabsProvider;

export const voice = {
  isSupported: () => activeProvider.isSupported(),

  async speak(text, lang = 'ru', options = {}) {
    try {
      return await activeProvider.speak(text, lang, options);
    } catch (err) {
      // Fallback to browser TTS if ElevenLabs fails
      console.warn('[VoiceProvider] ElevenLabs failed, falling back to browser TTS:', err?.message);
      if (speechSynthesisProvider.isSupported()) {
        return speechSynthesisProvider.speak(text, lang, options);
      }
    }
  },

  stop: () => activeProvider.stop?.(),

  getVoices: (lang) => activeProvider.getVoices?.(lang) || [],

  buildReminderText: (reminder, lang) =>
    activeProvider.buildReminderText(reminder, lang),

  async speakReminder(reminder) {
    // Priority: reminder explicit lang → app language setting → auto-detect from text
    let lang;
    if (reminder.language && reminder.language !== 'auto') {
      lang = reminder.language;
    } else {
      lang = localStorage.getItem('chronos_lang') || detectLanguage(reminder);
    }
    const text = activeProvider.buildReminderText(reminder, lang);
    return activeProvider.speak(text, lang);
  },
};

/**
 * Auto-detect language from text content.
 * Simple heuristic: check for Cyrillic vs Latin characters.
 */
function detectLanguage(reminder) {
  const text = `${reminder.title} ${reminder.description || ''}`;
  const cyrillic = /[\u0400-\u04FF]/.test(text);
  if (!cyrillic) return 'en';

  // Uzbek-specific characters
  const uzbekChars = /[ğşçüöıƏəÜÖŞİĞÇ]/i.test(text);
  if (uzbekChars) return 'uz';

  return 'ru';
}
