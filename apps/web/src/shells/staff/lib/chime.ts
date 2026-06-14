import type { Urgency } from "@office/shared";

type ACType = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: ACType }).webkitAudioContext;
    if (!AC) return null;

    const w = window as unknown as { __officeAc?: AudioContext };
    w.__officeAc = w.__officeAc ?? new AC();
    return w.__officeAc;
  } catch {
    return null;
  }
}

/** Resume AudioContext after a user gesture (autoplay policy). */
export function unlockStaffAudio() {
  const ac = getAudioContext();
  if (ac?.state === "suspended") void ac.resume();
}

function playTone(
  ac: AudioContext,
  freq: number,
  delay: number,
  volume: number,
  duration: number,
) {
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ac.destination);
  gain.gain.setValueAtTime(0, t0 + delay);
  gain.gain.linearRampToValueAtTime(volume, t0 + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0008, t0 + delay + duration);
  osc.start(t0 + delay);
  osc.stop(t0 + delay + duration + 0.05);
}

/** Two-tone chime for instant new-request push (plan §18, prototype playChime). */
export function playNewRequestChime(urg: Urgency = "normal") {
  try {
    const ac = getAudioContext();
    if (!ac) return;

    if (urg === "urgent") {
      playTone(ac, 880, 0, 0.22, 0.35);
      playTone(ac, 1175, 0.12, 0.22, 0.35);
      playTone(ac, 880, 0.28, 0.2, 0.35);
      playTone(ac, 1175, 0.4, 0.2, 0.4);
      return;
    }

    playTone(ac, 784, 0, 0.16, 0.5);
    playTone(ac, 1175, 0.13, 0.16, 0.5);
  } catch {
    // Web Audio unavailable — silent fallback
  }
}
