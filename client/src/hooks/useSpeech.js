/**
 * useSpeech — global TTS hook.
 *
 * Usage:
 *   const { speak, stop, speakReminder, speaking, supported } = useSpeech();
 *
 * - speak(text, lang?)      auto-detects language if lang is omitted
 * - speakReminder(reminder) full reminder speak with lang resolution
 * - stop()                  cancel current utterance
 * - speaking                true while TTS is active
 * - supported               false if neither ElevenLabs nor Web Speech is available
 */
import { useState, useCallback, useRef } from 'react';
import { voice } from '../voice/VoiceProvider.js';
import { detectLang } from './useLanguageDetect.js';

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError]       = useState(null);
  const cancelRef = useRef(false);

  const supported = voice.isSupported();

  const _withState = useCallback(async (fn) => {
    if (!supported) return;
    cancelRef.current = false;
    setSpeaking(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      if (!cancelRef.current) setError(err?.message ?? 'Speech failed');
    } finally {
      if (!cancelRef.current) setSpeaking(false);
    }
  }, [supported]);

  /**
   * Speak arbitrary text.
   * @param {string} text
   * @param {string} [lang] — 'ru'|'en'|'uz'. Auto-detected from text if omitted.
   */
  const speak = useCallback((text, lang) => {
    if (!text) return;
    const resolvedLang = lang || detectLang(text).lang;
    return _withState(() => voice.speak(text, resolvedLang));
  }, [_withState]);

  /**
   * Speak a full reminder object (uses VoiceProvider lang resolution).
   */
  const speakReminder = useCallback((reminder) => {
    return _withState(() => voice.speakReminder(reminder));
  }, [_withState]);

  /** Cancel current utterance immediately. */
  const stop = useCallback(() => {
    cancelRef.current = true;
    voice.stop();
    setSpeaking(false);
    setError(null);
  }, []);

  return { speak, stop, speakReminder, speaking, error, supported };
}
