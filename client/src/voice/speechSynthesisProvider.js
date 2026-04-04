/**
 * speechSynthesis Voice Provider
 * Tuned for broad Android/Huawei compatibility + natural prosody.
 *
 * Key Huawei/Android fixes:
 *  - keepAlive interval resumes synthesis if it pauses (Android screen-dim bug)
 *  - Hard timeout so speak() always resolves (onend never fires on some devices)
 *  - Graceful fallback when no voices are installed
 *  - voiceschanged listener uses both addEventListener + onvoiceschanged for compat
 */

const LANG_CODES = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en-AU', 'en'],
  // Узбекского голоса в браузерах нет — используем русский neural
  uz: ['ru-RU', 'ru', 'uz-UZ', 'uz'],
};

// Приоритет: мужские Neural голоса звучат чётко и профессионально (как Jarvis)
const TOP_VOICE_NAMES = {
  ru: [
    'microsoft dmitri online (natural)',  // лучший — чёткий мужской
    'microsoft dmitri online',
    'dmitri online (natural)',
    'dmitri online',
    'dmitri',
    'microsoft irina online (natural)',
    'microsoft irina online',
    'irina online (natural)',
    'irina online',
    'irina',
    'google русский',
  ],
  en: [
    'microsoft guy online (natural)',     // лучший — профессиональный мужской
    'microsoft guy online',
    'guy online (natural)',
    'guy online',
    'microsoft ryan online (natural)',
    'microsoft ryan online',
    'ryan online',
    'microsoft aria online (natural)',
    'microsoft aria online',
    'aria online (natural)',
    'aria online',
    'aria',
    'google us english',
    'daniel',
    'alex',
  ],
  // Для узбекского — лучший доступный мужской русский голос
  uz: [
    'microsoft dmitri online (natural)',
    'microsoft dmitri online',
    'dmitri online (natural)',
    'dmitri online',
    'dmitri',
    'microsoft irina online (natural)',
    'irina online',
    'irina',
  ],
};

const QUALITY_KEYWORDS = ['natural', 'neural', 'online', 'enhanced', 'premium', 'wavenet', 'studio'];

// Max time we wait for speak() to complete before resolving anyway (Android bug)
const SPEAK_TIMEOUT_MS = 12_000;
// How often we ping resume() to fight Android's background-pause bug
const KEEP_ALIVE_INTERVAL_MS = 800;

function scoreVoice(v, lang) {
  const name = v.name.toLowerCase();
  let score = 0;
  const topNames = TOP_VOICE_NAMES[lang] || [];
  for (let i = 0; i < topNames.length; i++) {
    if (name.includes(topNames[i])) { score += 100 - i * 5; break; }
  }
  for (const kw of QUALITY_KEYWORDS) if (name.includes(kw)) score += 15;
  if (name.includes('microsoft')) score += 6;
  if (name.includes('google')) score += 5;
  if (!v.localService) score += 3;
  return score;
}

function getBestVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;

  const preferred = LANG_CODES[lang] || LANG_CODES.en;
  const candidates = [];
  for (const code of preferred) {
    const matches = voices.filter(
      v => v.lang === code || v.lang.startsWith(code.split('-')[0])
    );
    candidates.push(...matches);
  }

  if (!candidates.length) {
    // Fallback: pick any voice rather than silence
    return voices[0];
  }

  const unique = [...new Map(candidates.map(v => [v.name, v])).values()];
  unique.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
  return unique[0];
}

let voicesLoaded = false;

function waitForVoices() {
  return new Promise(resolve => {
    // Already loaded
    const current = window.speechSynthesis?.getVoices() || [];
    if (current.length > 0) { voicesLoaded = true; resolve(current); return; }

    let resolved = false;
    const done = (voices) => {
      if (resolved) return;
      resolved = true;
      voicesLoaded = true;
      resolve(voices);
    };

    // Both event styles for maximum browser compat (Huawei uses older Chromium)
    const handler = () => done(window.speechSynthesis.getVoices());
    try {
      window.speechSynthesis.addEventListener('voiceschanged', handler);
    } catch (_) { /* ignore */ }
    window.speechSynthesis.onvoiceschanged = handler;

    // Hard timeout — some Huawei builds never fire voiceschanged
    setTimeout(() => done(window.speechSynthesis?.getVoices() || []), 3000);
  });
}

function preprocessText(text, lang) {
  let t = text.trim();
  if (!/[.!?…]$/.test(t)) t += '.';
  t = t.replace(/\s+/g, ' ');
  if (lang === 'ru') {
    t = t.replace(/\s+(и|а|но|или|что|как|когда|если|потому что)\s+/gi, ', $1 ');
  }
  if (lang === 'en') {
    t = t.replace(/\s+(and|but|or|so|because|when|if)\s+/gi, ', $1 ');
  }
  return t;
}

function humanizeProsody(base) {
  const jitter = () => (Math.random() - 0.5) * 0.04;
  return {
    rate: Math.max(0.75, Math.min(1.0, base.rate + jitter())),
    pitch: Math.max(0.85, Math.min(1.15, base.pitch + jitter())),
  };
}

export const speechSynthesisProvider = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  async speak(text, lang = 'ru', options = {}) {
    if (!this.isSupported()) return;

    // Cancel any ongoing utterance
    try { window.speechSynthesis.cancel(); } catch (_) { /* ignore */ }

    if (!voicesLoaded) {
      await waitForVoices();
    }

    const allVoices = window.speechSynthesis?.getVoices() || [];

    // If device has zero voices, skip TTS silently — sound + toast still work
    if (allVoices.length === 0) {
      console.warn('[Voice] No TTS voices installed on this device (Huawei / no Google TTS)');
      return;
    }

    const processed = preprocessText(text, lang);
    const utterance = new SpeechSynthesisUtterance(processed);

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.lang = LANG_CODES[lang]?.[0] || 'en-US';

    const base = {
      rate: options.rate ?? 1.05,   // Чуть быстрее — звучит чётче и увереннее
      pitch: options.pitch ?? 0.9,  // Чуть ниже тон — как у Jarvis/профессиональный AI
      volume: options.volume ?? 1.0,
    };
    utterance.rate = base.rate;
    utterance.pitch = base.pitch;
    utterance.volume = base.volume;

    return new Promise(resolve => {
      let done = false;
      let keepAliveId = null;

      const finish = () => {
        if (done) return;
        done = true;
        if (keepAliveId) clearInterval(keepAliveId);
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        // interrupted/canceled are normal — resolve cleanly
        if (e.error === 'interrupted' || e.error === 'canceled') finish();
        else { console.warn('[Voice] SpeechSynthesis error:', e.error); finish(); }
      };

      // Hard timeout — Android/Huawei onend may never fire
      const timeout = setTimeout(() => {
        console.warn('[Voice] speak() timed out — resolving anyway');
        finish();
      }, SPEAK_TIMEOUT_MS);

      // Override finish to also clear the timeout
      const origFinish = finish;
      // reassign references
      utterance.onend = () => { clearTimeout(timeout); origFinish(); };
      utterance.onerror = (e) => { clearTimeout(timeout); if (e.error !== 'interrupted' && e.error !== 'canceled') console.warn('[Voice] error:', e.error); origFinish(); };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[Voice] speak() threw:', e);
        clearTimeout(timeout);
        finish();
        return;
      }

      // Android background-pause bug: synthesis pauses when screen dims.
      // Periodically call resume() to keep it alive.
      keepAliveId = setInterval(() => {
        if (done) { clearInterval(keepAliveId); return; }
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } catch (_) { /* ignore */ }
      }, KEEP_ALIVE_INTERVAL_MS);
    });
  },

  stop() {
    try { window.speechSynthesis?.cancel(); } catch (_) { /* ignore */ }
  },

  getVoices(lang) {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (!lang) return voices;
    const codes = LANG_CODES[lang] || [];
    return voices
      .filter(v => codes.some(c => v.lang.startsWith(c.split('-')[0])))
      .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
  },

  buildReminderText(reminder, lang = 'ru') {
    const templates = {
      ru: { reminder: 'Напоминание', for: 'для' },
      en: { reminder: 'Reminder', for: 'for' },
      uz: { reminder: 'Eslatma', for: 'uchun' },
    };
    const t = templates[lang] || templates.en;
    const parts = [`${t.reminder}: ${reminder.title}`];
    if (reminder.guestName) parts.push(`${t.for} ${reminder.guestName}`);
    if (reminder.description) parts.push(reminder.description);
    return parts.join('. ');
  },
};
