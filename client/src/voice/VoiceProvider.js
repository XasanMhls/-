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
import { speechSynthesisProvider } from './speechSynthesisProvider.js';

// Future: import { elevenLabsProvider } from './elevenLabsProvider.js';
// Future: import { openAiTtsProvider } from './openAiTtsProvider.js';

const activeProvider = speechSynthesisProvider;

export const voice = {
  isSupported: () => activeProvider.isSupported(),

  async speak(text, lang = 'ru', options = {}) {
    if (!activeProvider.isSupported()) {
      console.warn('[VoiceProvider] TTS not supported in this browser');
      return;
    }
    return activeProvider.speak(text, lang, options);
  },

  stop: () => activeProvider.stop?.(),

  getVoices: (lang) => activeProvider.getVoices?.(lang) || [],

  buildReminderText: (reminder, lang) =>
    activeProvider.buildReminderText(reminder, lang),

  async speakReminder(reminder) {
    const lang = reminder.language === 'auto'
      ? detectLanguage(reminder)
      : reminder.language;
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
