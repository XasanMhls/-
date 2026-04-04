import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Adam voice — professional, clear, Jarvis-like
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
const MODEL = 'eleven_multilingual_v2';

router.post('/', protect, async (req, res) => {
  const { text, lang = 'ru' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  const trimmed = text.trim().slice(0, 500); // safety cap

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'TTS not configured' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
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
      console.error('[TTS] ElevenLabs error:', response.status, err);
      return res.status(502).json({ error: 'TTS upstream error' });
    }

    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[TTS] fetch failed:', err.message);
    res.status(502).json({ error: 'TTS request failed' });
  }
});

export default router;
