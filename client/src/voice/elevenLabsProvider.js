/**
 * ElevenLabs TTS Provider
 * Calls ElevenLabs API directly from the browser (no backend proxy needed).
 * Voice: Adam (eleven_multilingual_v2) — clear, professional, Jarvis-like.
 */

const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam
const MODEL    = 'eleven_multilingual_v2';
const API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY;

let currentAudio = null;

export const elevenLabsProvider = {
  isSupported() {
    return !!API_KEY;
  },

  async speak(text, lang = 'ru', _options = {}) {
    this.stop();

    if (!API_KEY) {
      throw new Error('[ElevenLabs] VITE_ELEVENLABS_API_KEY not set');
    }

    const trimmed = text.trim().slice(0, 500);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: MODEL,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.80,
            style: 0.10,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[ElevenLabs] API error ${response.status}: ${err}`);
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);

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
        console.warn('[ElevenLabs] autoplay blocked:', err.message);
        cleanup();
      });
    });
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
    if (reminder.guestName)  parts.push(`${t.for} ${reminder.guestName}`);
    if (reminder.description) parts.push(reminder.description);
    return parts.join('. ');
  },
};
