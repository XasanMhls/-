/**
 * speechSynthesis Voice Provider
 * Implements the VoiceProvider interface using the Web Speech API.
 * Designed to be swapped for ElevenLabs or OpenAI TTS later.
 */

const LANG_CODES = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en'],
  uz: ['uz-UZ', 'uz', 'ru-RU'], // fallback to Russian if Uzbek not available
};

function getBestVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const preferred = LANG_CODES[lang] || LANG_CODES.en;

  for (const code of preferred) {
    const match = voices.find(
      (v) => v.lang === code || v.lang.startsWith(code.split('-')[0])
    );
    if (match) return match;
  }
  return voices[0] || null;
}

let voicesLoaded = false;

function waitForVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback
    setTimeout(() => resolve([]), 2000);
  });
}

export const speechSynthesisProvider = {
  isSupported() {
    return 'speechSynthesis' in window;
  },

  async speak(text, lang = 'ru', options = {}) {
    if (!this.isSupported()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!voicesLoaded) {
      await waitForVoices();
      voicesLoaded = true;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.lang = LANG_CODES[lang]?.[0] || 'en-US';
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') resolve();
        else reject(e);
      };
      window.speechSynthesis.speak(utterance);
    });
  },

  stop() {
    window.speechSynthesis?.cancel();
  },

  getVoices(lang) {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (!lang) return voices;
    const codes = LANG_CODES[lang] || [];
    return voices.filter((v) => codes.some((c) => v.lang.startsWith(c.split('-')[0])));
  },

  buildReminderText(reminder, lang = 'ru') {
    const parts = [];
    const templates = {
      ru: {
        reminder: 'Напоминание',
        for: 'для',
        desc: '',
      },
      en: {
        reminder: 'Reminder',
        for: 'for',
        desc: '',
      },
      uz: {
        reminder: 'Eslatma',
        for: 'uchun',
        desc: '',
      },
    };
    const t = templates[lang] || templates.en;

    parts.push(`${t.reminder}: ${reminder.title}`);
    if (reminder.guestName) {
      parts.push(`${t.for} ${reminder.guestName}`);
    }
    if (reminder.description) {
      parts.push(reminder.description);
    }

    return parts.join('. ');
  },
};
