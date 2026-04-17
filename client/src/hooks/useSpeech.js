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
import { useCallback } from 'react';
import { voice } from '../voice/VoiceProvider.js';
import { detectLang } from './useLanguageDetect.js';
import useSpeechStore from '../store/speechStore.js';

let activeSessionId = 0;

export function useSpeech() {
  const supported = voice.isSupported();
  const speaking = useSpeechStore((state) => state.speaking);
  const paused = useSpeechStore((state) => state.paused);
  const error = useSpeechStore((state) => state.error);
  const setSpeechState = useSpeechStore((state) => state.setState);
  const resetSpeech = useSpeechStore((state) => state.reset);

  const _withState = useCallback(async (fn) => {
    if (!supported) return;
    const sessionId = ++activeSessionId;
    setSpeechState({ speaking: true, paused: false, error: null });
    try {
      await fn();
    } catch (err) {
      if (sessionId === activeSessionId) {
        setSpeechState({ error: err?.message ?? 'Speech failed' });
      }
    } finally {
      if (sessionId === activeSessionId) {
        resetSpeech();
      }
    }
  }, [resetSpeech, setSpeechState, supported]);

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
    activeSessionId += 1;
    voice.stop();
    resetSpeech();
  }, [resetSpeech]);

  const pause = useCallback(() => {
    if (!speaking || paused) return;
    voice.pause?.();
    setSpeechState({ paused: true, speaking: true });
  }, [paused, setSpeechState, speaking]);

  const resume = useCallback(() => {
    if (!speaking || !paused) return;
    voice.resume?.();
    setSpeechState({ paused: false, speaking: true });
  }, [paused, setSpeechState, speaking]);

  return { speak, stop, pause, resume, speakReminder, speaking, paused, error, supported };
}
