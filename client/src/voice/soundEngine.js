/**
 * Web Audio API sound engine.
 * Generates sounds without external audio files.
 */

let audioCtx = null;

function getContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export async function unlockAudio() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play silent buffer to unlock
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    return true;
  } catch {
    return false;
  }
}

function playTone(opts) {
  try {
    const ctx = getContext();
    const { type = 'sine', freq, duration, gain = 0.6, delay = 0 } = opts;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch {
    /* silently fail */
  }
}

const SOUNDS = {
  bell: () => {
    playTone({ freq: 830, duration: 0.8, gain: 0.5, type: 'sine' });
    playTone({ freq: 1108, duration: 0.6, gain: 0.3, delay: 0.1, type: 'sine' });
  },
  chime: () => {
    [0, 0.18, 0.36].forEach((delay, i) => {
      const freqs = [523, 659, 784];
      playTone({ freq: freqs[i], duration: 0.6, gain: 0.4, delay, type: 'sine' });
    });
  },
  pulse: () => {
    [0, 0.3].forEach((delay) => {
      playTone({ freq: 440, duration: 0.2, gain: 0.5, delay, type: 'square' });
    });
  },
  notification: () => {
    playTone({ freq: 587, duration: 0.15, gain: 0.5, type: 'sine' });
    playTone({ freq: 784, duration: 0.25, gain: 0.4, delay: 0.18, type: 'sine' });
  },
  none: () => {},
};

export function playSound(soundName = 'chime') {
  const fn = SOUNDS[soundName] || SOUNDS.chime;
  try {
    fn();
  } catch {
    /* silently fail */
  }
}

export function isAudioSupported() {
  return !!(window.AudioContext || window.webkitAudioContext);
}
