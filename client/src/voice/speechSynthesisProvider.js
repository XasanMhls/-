/**
 * speechSynthesis Voice Provider
 * Implements the VoiceProvider interface using the Web Speech API.
 * Tuned to select neural/natural voices and apply human-like prosody.
 */

const LANG_CODES = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en-AU', 'en'],
  uz: ['uz-UZ', 'uz', 'ru-RU'],
};

// Voices to always prefer (exact substring, case-insensitive), ordered by quality.
// "Irina" and "Dmitri" are Microsoft's Russian Neural Online voices — closest to Yandex Alice.
const TOP_VOICE_NAMES = {
  ru: ['irina online (natural)', 'irina online', 'irina', 'dmitri online (natural)', 'dmitri online', 'dmitri', 'svetlana'],
  en: ['aria online (natural)', 'aria online', 'aria', 'guy online (natural)', 'jenny online (natural)', 'jenny', 'samantha'],
  uz: ['irina', 'dmitri'], // fallback to Russian neural for Uzbek
};

// General quality keywords — give bonus points
const QUALITY_KEYWORDS = ['natural', 'neural', 'online', 'enhanced', 'premium', 'wavenet', 'studio'];

/**
 * Score a voice — higher = more human-sounding.
 */
function scoreVoice(v, lang) {
  const name = v.name.toLowerCase();
  let score = 0;

  // Top bonus: exact named match for this language
  const topNames = TOP_VOICE_NAMES[lang] || [];
  for (let i = 0; i < topNames.length; i++) {
    if (name.includes(topNames[i])) { score += 100 - i * 5; break; }
  }

  for (const kw of QUALITY_KEYWORDS) if (name.includes(kw)) score += 15;
  if (name.includes('microsoft')) score += 6;
  if (name.includes('google')) score += 5;
  if (!v.localService) score += 3; // cloud voices sound better
  return score;
}

function getBestVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const preferred = LANG_CODES[lang] || LANG_CODES.en;

  // Gather all voices that match this language
  const candidates = [];
  for (const code of preferred) {
    const matches = voices.filter(
      (v) => v.lang === code || v.lang.startsWith(code.split('-')[0])
    );
    candidates.push(...matches);
  }

  if (candidates.length === 0) return voices[0] || null;

  // Remove duplicates and pick highest-scoring voice
  const unique = [...new Map(candidates.map((v) => [v.name, v])).values()];
  unique.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
  return unique[0];
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
    setTimeout(() => resolve([]), 2500);
  });
}

/**
 * Preprocess text for more natural cadence:
 *  - Expand abbreviations
 *  - Ensure punctuation-based pauses are present
 *  - Split lists with natural pauses
 */
function preprocessText(text, lang) {
  let t = text.trim();

  // Ensure sentence-ending punctuation for a natural final pause
  if (!/[.!?…]$/.test(t)) t += '.';

  // Collapse multiple spaces/newlines
  t = t.replace(/\s+/g, ' ');

  // For Russian: add pause hints via comma after short conjunctions at clause boundaries
  if (lang === 'ru') {
    t = t.replace(/\s+(и|а|но|или|что|как|когда|если|потому что)\s+/gi, ', $1 ');
  }

  // For English: natural pause before "and" / "but" in long sentences
  if (lang === 'en') {
    t = t.replace(/\s+(and|but|or|so|because|when|if)\s+/gi, ', $1 ');
  }

  return t;
}

/**
 * Add tiny random variation to prosody to avoid the robot-flat effect.
 */
function humanizeProsody(base) {
  const jitter = () => (Math.random() - 0.5) * 0.04;
  return {
    rate: Math.max(0.75, Math.min(1.0, base.rate + jitter())),
    pitch: Math.max(0.85, Math.min(1.15, base.pitch + jitter())),
  };
}

export const speechSynthesisProvider = {
  isSupported() {
    return 'speechSynthesis' in window;
  },

  async speak(text, lang = 'ru', options = {}) {
    if (!this.isSupported()) return;

    window.speechSynthesis.cancel();

    if (!voicesLoaded) {
      await waitForVoices();
      voicesLoaded = true;
    }

    const processed = preprocessText(text, lang);
    const utterance = new SpeechSynthesisUtterance(processed);

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.lang = LANG_CODES[lang]?.[0] || 'en-US';

    // Base prosody — slightly slower than default for clarity
    const base = {
      rate: options.rate ?? 0.90,
      pitch: options.pitch ?? 1.0,
      volume: options.volume ?? 1.0,
    };

    const { rate, pitch } = humanizeProsody(base);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = base.volume;

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
    return voices
      .filter((v) => codes.some((c) => v.lang.startsWith(c.split('-')[0])))
      .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
  },

  buildReminderText(reminder, lang = 'ru') {
    const parts = [];
    const templates = {
      ru: { reminder: 'Напоминание', for: 'для' },
      en: { reminder: 'Reminder', for: 'for' },
      uz: { reminder: 'Eslatma', for: 'uchun' },
    };
    const t = templates[lang] || templates.en;

    parts.push(`${t.reminder}: ${reminder.title}`);
    if (reminder.guestName) parts.push(`${t.for} ${reminder.guestName}`);
    if (reminder.description) parts.push(reminder.description);

    return parts.join('. ');
  },
};
