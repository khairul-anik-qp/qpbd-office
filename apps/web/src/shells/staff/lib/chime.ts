/** Two-tone chime for instant new-request push (plan §18, prototype playChime). */
export function playNewRequestChime() {
  try {
    type ACType = typeof AudioContext;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: ACType }).webkitAudioContext;
    if (!AC) return;

    const w = window as unknown as { __officeAc?: AudioContext };
    w.__officeAc = w.__officeAc ?? new AC();
    const ac = w.__officeAc;
    const t0 = ac.currentTime;

    ([[784, 0], [1175, 0.13]] as const).forEach(([freq, delay]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(0, t0 + delay);
      gain.gain.linearRampToValueAtTime(0.16, t0 + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + delay + 0.5);
      osc.start(t0 + delay);
      osc.stop(t0 + delay + 0.55);
    });
  } catch {
    // Web Audio unavailable — silent fallback
  }
}
