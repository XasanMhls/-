/**
 * ElevenLabs TTS Provider
 * Calls /api/tts (backend proxy) → returns audio/mpeg → plays via Audio element.
 * Voice: Adam (eleven_multilingual_v2) — clear, professional, Jarvis-like.
 */

import api from '../services/api.js';

let currentAudio = null;

export const elevenLabsProvider = {
  isSupported() {
    return true;
  },

  async speak(text, lang = 'ru', _options = {}) {
    this.stop();

    try {
      const response = await api.post(
        '/tts',
        { text, lang },
        { responseType: 'blob' }
      );

      const blob = response.data;
      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        const audio = new Audio(url);
        currentAudio = audio;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        audio.play().catch((err) => {
          console.warn('[ElevenLabs] autoplay blocked — click page first:', err.message);
          cleanup();
        });
      });
    } catch (err) {
      console.warn('[ElevenLabs] speak() error:', err.message);
      throw err; // propagate so VoiceProvider can fallback to browser TTS
    }
  },

  stop() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ''; } catch (_) {}
      currentAudio = null;
    }
  },

  getVoices() {
    return [{ name: 'Adam (ElevenLabs)', lang: 'multilingual' }];
  },

  buildReminderText(reminder, lang = 'ru') {
    const templates = {
      ru: { word: 'Напоминание', for: 'для' },
      en: { word: 'Reminder',    for: 'for' },
      uz: { word: 'Eslatma',     for: 'uchun' },
    };
    const t = templates[lang] || templates.en;
    const parts = [`${t.word}: ${reminder.title}`];
    if (reminder.guestName) parts.push(`${t.for} ${reminder.guestName}`);
    if (reminder.description) parts.push(reminder.description);
    return parts.join('. ');
  },
};
