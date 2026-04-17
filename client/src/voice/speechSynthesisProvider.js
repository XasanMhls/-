/**
 * speechSynthesis Voice Provider
 * Tuned for broad Android/Huawei compatibility + natural prosody.
 *
 * Fallback priority for voices:
 *   1. Best scored voice for requested language
 *   2. Best scored English voice (if requested lang ≠ en and no lang voice available)
 *   3. First available voice (last resort — better than silence)
 *   4. null → browser speaks with lang hint only (some browsers still work)
 *
 * Android/Huawei fixes:
 *   - keepAlive interval resumes synthesis if it pauses (screen-dim bug)
 *   - Hard timeout so speak() always resolves (onend never fires on some devices)
 *   - voiceschanged listener uses both addEventListener + onvoiceschanged for compat
 */

const LANG_CODES = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en-AU', 'en'],
  uz: ['uz-UZ', 'uz'],
};

const TOP_VOICE_NAMES = {
  ru: [
    'microsoft dmitri online (natural)',
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
    'microsoft guy online (natural)',
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
  uz: [
    'microsoft dilnoza online (natural)',
    'microsoft dilnoza online',
    'dilnoza online (natural)',
    'dilnoza online',
    'dilnoza',
    'microsoft sardor online (natural)',
    'microsoft sardor online',
    'sardor online (natural)',
    'sardor online',
    'sardor',
  ],
};

const QUALITY_KEYWORDS = ['natural', 'neural', 'online', 'enhanced', 'premium', 'wavenet', 'studio'];

/** Hard timeout — Android/Huawei onend may never fire */
const SPEAK_TIMEOUT_MS = 300_000;
/** Interval to fight Android background-pause synthesis bug */
const KEEP_ALIVE_INTERVAL_MS = 800;
let manuallyPaused = false;

function scoreVoice(v, lang) {
  const name = v.name.toLowerCase();
  let score = 0;
  const topNames = TOP_VOICE_NAMES[lang] || [];
  for (let i = 0; i < topNames.length; i++) {
    if (name.includes(topNames[i])) { score += 100 - i * 5; break; }
  }
  for (const kw of QUALITY_KEYWORDS) if (name.includes(kw)) score += 15;
  if (name.includes('microsoft')) score += 6;
  if (name.includes('google'))    score += 5;
  if (!v.localService)            score += 3;
  return score;
}

/**
 * Get the best voice for a language with graceful fallback.
 * @param {string} lang - 'ru' | 'en' | 'uz'
 * @param {boolean} [allowEnFallback=true] - try English voices if lang not found
 * @returns {SpeechSynthesisVoice|null}
 */
function getBestVoice(lang, allowEnFallback = true) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;

  const preferred = LANG_CODES[lang] || LANG_CODES.en;
  const candidates = [];

  for (const code of preferred) {
    const root = code.split('-')[0];
    const matches = voices.filter(v => v.lang === code || v.lang.startsWith(root));
    candidates.push(...matches);
  }

  if (candidates.length) {
    const unique = [...new Map(candidates.map(v => [v.name, v])).values()];
    unique.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
    return unique[0];
  }

  // No voice for requested language — fall back to English
  if (allowEnFallback && lang !== 'en') {
    console.warn(`[Voice] No voice found for "${lang}", trying English voices`);
    const enVoice = getBestVoice('en', false);
    if (enVoice) return enVoice;
  }

  // Last resort: any available voice (browser may handle lang hint on its own)
  console.warn('[Voice] No language-specific voice found, using first available voice');
  return voices[0] ?? null;
}

let voicesLoaded = false;

function waitForVoices() {
  return new Promise(resolve => {
    const current = window.speechSynthesis?.getVoices() ?? [];
    if (current.length > 0) { voicesLoaded = true; resolve(current); return; }

    let resolved = false;
    const done = (voices) => {
      if (resolved) return;
      resolved = true;
      voicesLoaded = true;
      resolve(voices);
    };

    const handler = () => done(window.speechSynthesis.getVoices());
    try { window.speechSynthesis.addEventListener('voiceschanged', handler); } catch (_) {}
    window.speechSynthesis.onvoiceschanged = handler;

    // Hard timeout — some Huawei builds never fire voiceschanged
    setTimeout(() => done(window.speechSynthesis?.getVoices() ?? []), 3000);
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
  if (lang === 'uz') {
    t = t.replace(/\s+(va|lekin|yoki|chunki|agar|shuning uchun)\s+/gi, ', $1 ');
  }
  return t;
}

export const speechSynthesisProvider = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  async speak(text, lang = 'en', options = {}) {
    if (!this.isSupported()) {
      console.warn('[Voice] Web Speech API is not supported in this browser');
      return;
    }

    // Cancel any ongoing utterance first
    try { window.speechSynthesis.cancel(); } catch (_) {}
    manuallyPaused = false;

    if (!voicesLoaded) {
      await waitForVoices();
    }

    const allVoices = window.speechSynthesis?.getVoices() ?? [];
    if (allVoices.length === 0) {
      console.warn('[Voice] No TTS voices installed on this device — skipping speech');
      return;
    }

    const processed = preprocessText(text, lang);
    const utterance = new SpeechSynthesisUtterance(processed);

    // Set language hint so browser can select a voice even if we can't find one
    utterance.lang = LANG_CODES[lang]?.[0] ?? LANG_CODES.en[0];

    const voice = getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      // If we fell back to a different language voice, update the lang hint to match
      if (!LANG_CODES[lang]?.some(c => voice.lang.startsWith(c.split('-')[0]))) {
        const voiceLangRoot = voice.lang.split('-')[0];
        utterance.lang = voice.lang;
        console.info(`[Voice] Using "${voice.name}" (${voice.lang}) for "${lang}" text`);
      }
    }

    utterance.rate   = options.rate   ?? 1.05;
    utterance.pitch  = options.pitch  ?? 0.9;
    utterance.volume = options.volume ?? 1.0;

    return new Promise((resolve) => {
      let done = false;
      let keepAliveId = null;

      const finish = () => {
        if (done) return;
        done = true;
        if (keepAliveId) clearInterval(keepAliveId);
        resolve();
      };

      const timeout = setTimeout(() => {
        console.warn('[Voice] speak() timed out — resolving');
        finish();
      }, SPEAK_TIMEOUT_MS);

      utterance.onend = () => { clearTimeout(timeout); finish(); };
      utterance.onerror = (e) => {
        clearTimeout(timeout);
        // interrupted/canceled are normal lifecycle events, not real errors
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[Voice] SpeechSynthesis error:', e.error);
        }
        finish();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[Voice] speak() threw synchronously:', e?.message);
        clearTimeout(timeout);
        finish();
        return;
      }

      // Android background-pause bug: periodically call resume()
      keepAliveId = setInterval(() => {
        if (done) { clearInterval(keepAliveId); return; }
        try {
          if (window.speechSynthesis.paused && !manuallyPaused) window.speechSynthesis.resume();
        } catch (_) {}
      }, KEEP_ALIVE_INTERVAL_MS);
    });
  },

  stop() {
    manuallyPaused = false;
    try { window.speechSynthesis?.cancel(); } catch (_) {}
  },

  pause() {
    manuallyPaused = true;
    try { window.speechSynthesis?.pause(); } catch (_) {}
  },

  resume() {
    manuallyPaused = false;
    try { window.speechSynthesis?.resume(); } catch (_) {}
  },

  getVoices(lang) {
    const voices = window.speechSynthesis?.getVoices() ?? [];
    if (!lang) return voices;
    const codes = LANG_CODES[lang] ?? [];
    return voices
      .filter(v => codes.some(c => v.lang.startsWith(c.split('-')[0])))
      .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
  },

  buildReminderText(reminder, lang = 'en') {
    const templates = {
      ru: { reminder: 'Напоминание', for: 'для' },
      en: { reminder: 'Reminder',    for: 'for' },
      uz: { reminder: 'Eslatma',     for: 'uchun' },
    };
    const t = templates[lang] ?? templates.en;
    const parts = [`${t.reminder}: ${reminder.title}`];
    if (reminder.guestName)   parts.push(`${t.for} ${reminder.guestName}`);
    if (reminder.description) parts.push(reminder.description);
    return parts.join('. ');
  },
};
