import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing the alarm notification sound.
 * - Creates a single reusable AudioContext stored in a ref
 * - Auto-unlocks on the first user interaction (browser autoplay policy)
 * - Plays a 4-note victory fanfare: C5 → E5 → G5 → C6
 *
 * @returns {Function} playNotificationSound
 */
export default function useAudio() {
  const audioCtxRef = useRef(null);

  // Resume or create AudioContext
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Warm up the AudioContext on first user interaction
  useEffect(() => {
    const unlock = () => { getAudioCtx(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [getAudioCtx]);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      // 4-note victory fanfare: C5 → E5 → G5 → C6
      const notes = [
        { freq: 523.25, start: 0.0,  dur: 0.18 },
        { freq: 659.25, start: 0.18, dur: 0.18 },
        { freq: 783.99, start: 0.36, dur: 0.18 },
        { freq: 1046.5, start: 0.54, dur: 0.55 },
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.38, now + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch (err) {
      console.warn('Could not play alarm sound:', err);
    }
  }, [getAudioCtx]);

  return playNotificationSound;
}
