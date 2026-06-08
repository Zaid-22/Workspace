/**
 * Premium Sound Engine for Study Space
 * Uses Web Audio API with layered synthesis, reverb convolution, and careful EQ
 * to produce warm, satisfying notification sounds.
 */

let _ctx = null;
let _reverbBuffer = null;

/**
 * Get (or create) the shared AudioContext.
 */
function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

/**
 * Warm up the AudioContext on first user interaction.
 */
export function warmUp() {
  const unlock = () => { getCtx(); };
  window.addEventListener('pointerdown', unlock, { once: true });
  return () => window.removeEventListener('pointerdown', unlock);
}

// ─── Reverb impulse generation ───────────────────────────────────────────────
/**
 * Create a synthetic convolution reverb impulse response.
 * This gives sounds a warm, spatial quality instead of dry oscillators.
 */
function createReverbImpulse(ctx, duration = 1.5, decay = 2.5) {
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // Exponentially decaying noise
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function getReverb(ctx) {
  if (!_reverbBuffer) {
    _reverbBuffer = createReverbImpulse(ctx, 1.8, 3.0);
  }
  return _reverbBuffer;
}

// ─── Utility: play a single bell-like tone ───────────────────────────────────
/**
 * Creates a rich bell tone by layering a fundamental with quieter harmonics.
 * Returns the gain node so callers can connect it to any destination.
 */
function createBellTone(ctx, freq, startTime, duration, volume = 0.15) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, startTime);
  master.gain.linearRampToValueAtTime(volume, startTime + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  // Harmonics that make it sound bell-like (relative freq, relative volume)
  const harmonics = [
    { ratio: 1.0,  vol: 1.0,   type: 'sine'     },
    { ratio: 2.0,  vol: 0.35,  type: 'sine'     },
    { ratio: 3.0,  vol: 0.12,  type: 'sine'     },
    { ratio: 4.17, vol: 0.08,  type: 'sine'     }, // inharmonic partial → bell character
    { ratio: 5.43, vol: 0.04,  type: 'sine'     }, // another inharmonic
  ];

  harmonics.forEach(({ ratio, vol, type }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq * ratio, startTime);

    // Higher harmonics decay faster
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol * volume, startTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * (1 / ratio + 0.3));

    osc.connect(g);
    g.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });

  return master;
}

// ─── Sound: Timer Complete (warm rising chime with reverb) ───────────────────
/**
 * A beautiful 3-bell ascending chime: G5 → B5 → D6
 * Layered with harmonics and convolution reverb for a warm, spatial feel.
 * ~1.8 seconds total.
 */
export function playTimerComplete() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Create reverb convolver
    const convolver = ctx.createConvolver();
    convolver.buffer = getReverb(ctx);

    // Dry / Wet mix
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.value = 0.6;
    wetGain.gain.value = 0.4;

    dryGain.connect(ctx.destination);
    convolver.connect(wetGain);
    wetGain.connect(ctx.destination);

    // Merge node for routing bells to both dry and wet
    const merge = ctx.createGain();
    merge.gain.value = 1.0;
    merge.connect(dryGain);
    merge.connect(convolver);

    // 3-bell ascending chime: warm and triumphant
    const bells = [
      { freq: 783.99, start: 0.0,  dur: 1.2, vol: 0.12 },  // G5
      { freq: 987.77, start: 0.25, dur: 1.1, vol: 0.10 },  // B5
      { freq: 1174.66, start: 0.50, dur: 1.5, vol: 0.09 }, // D6
    ];

    bells.forEach(({ freq, start, dur, vol }) => {
      const bell = createBellTone(ctx, freq, now + start, dur, vol);
      bell.connect(merge);
    });

    // Soft sub-bass pad under the chime for warmth
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(196.0, now); // G3
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    sub.connect(subGain);
    subGain.connect(merge);
    sub.start(now);
    sub.stop(now + 1.6);

  } catch (err) {
    console.warn('Could not play timer complete sound:', err);
  }
}

// ─── Sound: Task Complete (satisfying soft "ding") ───────────────────────────
/**
 * A quick, satisfying confirmation ding — like marking something done.
 * Single bell with a tiny sparkle on top. ~0.5 seconds.
 */
export function playTaskComplete() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Main ding - E6 (bright, clear)
    const bell = createBellTone(ctx, 1318.51, now, 0.5, 0.10);
    bell.connect(ctx.destination);

    // Tiny sparkle partial above
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(2637.02, now); // E7
    sparkleGain.gain.setValueAtTime(0, now);
    sparkleGain.gain.linearRampToValueAtTime(0.03, now + 0.005);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkle.start(now);
    sparkle.stop(now + 0.2);

  } catch (err) {
    console.warn('Could not play task complete sound:', err);
  }
}

// ─── Sound: Task Uncomplete (soft descending note) ──────────────────────────
/**
 * A gentle descending tone to indicate un-checking. ~0.3 seconds.
 */
export function playTaskUncomplete() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);       // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.2); // slide down to A4

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

  } catch (err) {
    console.warn('Could not play task uncomplete sound:', err);
  }
}

// ─── Sound: Task Delete (soft "whoosh" noise sweep) ──────────────────────────
/**
 * A quick, soft noise sweep that feels like something being whisked away.
 * Uses filtered noise. ~0.25 seconds.
 */
export function playTaskDelete() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const duration = 0.25;
    const rate = ctx.sampleRate;
    const length = rate * duration;

    // Create short noise buffer
    const buffer = ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter that sweeps downward for "whoosh" feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration + 0.05);

  } catch (err) {
    console.warn('Could not play task delete sound:', err);
  }
}

// ─── Sound: Soft UI Click (subtle tactile feedback) ──────────────────────────
/**
 * A very subtle, short click for UI interactions like adding tasks.
 * ~0.08 seconds.
 */
export function playUIClick() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

  } catch (err) {
    console.warn('Could not play UI click sound:', err);
  }
}

// ─── Sound: Timer Start (gentle upward "boop") ──────────────────────────────
/**
 * A quick, warm ascending note that signals "let's go". ~0.15 seconds.
 */
export function playTimerStart() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);       // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // up to A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

  } catch (err) {
    console.warn('Could not play timer start sound:', err);
  }
}

// ─── Sound: Timer Pause (gentle downward "boop") ────────────────────────────
/**
 * The reverse of start — a quick descending note. ~0.15 seconds.
 */
export function playTimerPause() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);       // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1); // down to A4

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

  } catch (err) {
    console.warn('Could not play timer pause sound:', err);
  }
}
