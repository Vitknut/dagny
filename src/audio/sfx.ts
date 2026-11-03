import type { SfxStep } from '../engine/audio';

/** Sound effects as synth parameters. */
export const SFX: Record<string, SfxStep[]> = {
  jump: [{ wave: 'square', from: 260, to: 520, dur: 0.12, vol: 0.35 }],
  sword: [
    { wave: 'noise', from: 3000, to: 900, dur: 0.09, vol: 0.5 },
    { wave: 'triangle', from: 900, to: 500, dur: 0.06, vol: 0.2 },
  ],
  hit: [
    { wave: 'square', from: 220, to: 90, dur: 0.1, vol: 0.45 },
    { wave: 'noise', from: 1500, to: 400, dur: 0.08, vol: 0.4 },
  ],
  block: [
    { wave: 'triangle', from: 1400, to: 1300, dur: 0.12, vol: 0.4 },
    { wave: 'square', from: 2100, to: 2000, dur: 0.05, vol: 0.15 },
  ],
  /** A bird about to dive: a short rising shriek. */
  screech: [
    { wave: 'sawtooth', from: 900, to: 1700, dur: 0.12, vol: 0.22 },
    { wave: 'sawtooth', from: 1100, to: 1900, dur: 0.1, vol: 0.18, at: 0.13 },
  ],
  hurt: [
    { wave: 'sawtooth', from: 380, to: 120, dur: 0.22, vol: 0.4 },
    { wave: 'noise', from: 800, to: 200, dur: 0.15, vol: 0.3 },
  ],
  puff: [{ wave: 'noise', from: 1200, to: 200, dur: 0.35, vol: 0.4 }],
  xp: [
    { wave: 'square', from: 880, dur: 0.06, vol: 0.25 },
    { wave: 'square', from: 1320, dur: 0.08, vol: 0.25, at: 0.06 },
  ],
  pickup: [
    { wave: 'triangle', from: 660, dur: 0.07, vol: 0.4 },
    { wave: 'triangle', from: 990, dur: 0.1, vol: 0.4, at: 0.07 },
  ],
  key: [
    { wave: 'triangle', from: 990, dur: 0.08, vol: 0.4 },
    { wave: 'triangle', from: 1320, dur: 0.08, vol: 0.4, at: 0.08 },
    { wave: 'triangle', from: 1760, dur: 0.15, vol: 0.4, at: 0.16 },
  ],
  levelup: [
    { wave: 'square', from: 523, dur: 0.1, vol: 0.3 },
    { wave: 'square', from: 659, dur: 0.1, vol: 0.3, at: 0.1 },
    { wave: 'square', from: 784, dur: 0.1, vol: 0.3, at: 0.2 },
    { wave: 'square', from: 1047, dur: 0.3, vol: 0.3, at: 0.3 },
  ],
  dialog: [{ wave: 'square', from: 700, dur: 0.025, vol: 0.12 }],
  door: [
    { wave: 'noise', from: 400, to: 150, dur: 0.25, vol: 0.5 },
    { wave: 'triangle', from: 110, to: 70, dur: 0.25, vol: 0.4 },
  ],
  unlock: [
    { wave: 'triangle', from: 1500, dur: 0.05, vol: 0.4 },
    { wave: 'noise', from: 600, to: 200, dur: 0.2, vol: 0.4, at: 0.05 },
  ],
  water: [
    { wave: 'noise', from: 900, to: 300, dur: 0.3, vol: 0.5 },
    { wave: 'sine', from: 600, to: 200, dur: 0.15, vol: 0.3 },
  ],
  /** A reading cast: a quick rising run of blips that ends in a shimmer. */
  magic: [
    { wave: 'square', from: 392, dur: 0.05, vol: 0.22 },
    { wave: 'square', from: 523, dur: 0.05, vol: 0.22, at: 0.05 },
    { wave: 'square', from: 659, dur: 0.05, vol: 0.22, at: 0.1 },
    { wave: 'square', from: 784, dur: 0.05, vol: 0.22, at: 0.15 },
    { wave: 'square', from: 1047, dur: 0.05, vol: 0.22, at: 0.2 },
    { wave: 'square', from: 1319, dur: 0.06, vol: 0.22, at: 0.25 },
    { wave: 'triangle', from: 1047, to: 2093, dur: 0.32, vol: 0.28, at: 0.31 },
    { wave: 'sine', from: 2093, to: 2637, dur: 0.3, vol: 0.14, at: 0.36 },
    { wave: 'square', from: 1568, dur: 0.04, vol: 0.1, at: 0.5 },
    { wave: 'square', from: 2093, dur: 0.04, vol: 0.08, at: 0.58 },
  ],
  heal: [
    { wave: 'sine', from: 523, dur: 0.12, vol: 0.4 },
    { wave: 'sine', from: 659, dur: 0.12, vol: 0.4, at: 0.1 },
    { wave: 'sine', from: 880, dur: 0.25, vol: 0.4, at: 0.2 },
  ],
  thunder: [
    { wave: 'noise', from: 2000, to: 60, dur: 0.9, vol: 0.8 },
    { wave: 'sawtooth', from: 80, to: 30, dur: 0.7, vol: 0.4 },
  ],
  fire: [{ wave: 'noise', from: 2500, to: 600, dur: 0.18, vol: 0.4 }],
  menu: [{ wave: 'square', from: 520, dur: 0.04, vol: 0.2 }],
  select: [
    { wave: 'square', from: 660, dur: 0.05, vol: 0.25 },
    { wave: 'square', from: 990, dur: 0.07, vol: 0.25, at: 0.05 },
  ],
  cancel: [{ wave: 'square', from: 440, to: 300, dur: 0.08, vol: 0.2 }],
  checkpoint: [
    { wave: 'triangle', from: 392, dur: 0.15, vol: 0.4 },
    { wave: 'triangle', from: 587, dur: 0.15, vol: 0.4, at: 0.12 },
    { wave: 'triangle', from: 784, dur: 0.3, vol: 0.4, at: 0.24 },
  ],
  roar: [
    { wave: 'sawtooth', from: 140, to: 60, dur: 0.8, vol: 0.5 },
    { wave: 'noise', from: 500, to: 120, dur: 0.8, vol: 0.4 },
  ],
  /** Bergakungen's laugh on the Game Over screen: seven deep, falling "ha"s. */
  laugh: [
    { wave: 'sawtooth', from: 200, to: 140, dur: 0.15, vol: 0.45 },
    { wave: 'square', from: 400, to: 260, dur: 0.1, vol: 0.12 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25 },
    { wave: 'sawtooth', from: 190, to: 133, dur: 0.15, vol: 0.45, at: 0.2 },
    { wave: 'square', from: 380, to: 247, dur: 0.1, vol: 0.12, at: 0.2 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 0.2 },
    { wave: 'sawtooth', from: 180, to: 125, dur: 0.15, vol: 0.45, at: 0.4 },
    { wave: 'square', from: 360, to: 234, dur: 0.1, vol: 0.12, at: 0.4 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 0.4 },
    { wave: 'sawtooth', from: 170, to: 118, dur: 0.15, vol: 0.45, at: 0.6 },
    { wave: 'square', from: 340, to: 221, dur: 0.1, vol: 0.12, at: 0.6 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 0.6 },
    { wave: 'sawtooth', from: 160, to: 112, dur: 0.15, vol: 0.45, at: 0.8 },
    { wave: 'square', from: 320, to: 208, dur: 0.1, vol: 0.12, at: 0.8 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 0.8 },
    { wave: 'sawtooth', from: 150, to: 105, dur: 0.15, vol: 0.45, at: 1.0 },
    { wave: 'square', from: 300, to: 195, dur: 0.1, vol: 0.12, at: 1.0 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 1.0 },
    { wave: 'sawtooth', from: 135, to: 94, dur: 0.15, vol: 0.45, at: 1.2 },
    { wave: 'square', from: 270, to: 175, dur: 0.1, vol: 0.12, at: 1.2 },
    { wave: 'noise', from: 900, to: 400, dur: 0.12, vol: 0.25, at: 1.2 },
  ],
  bell: [
    { wave: 'sine', from: 440, dur: 1.2, vol: 0.4 },
    { wave: 'sine', from: 1056, dur: 0.8, vol: 0.2 },
  ],
  horn: [
    { wave: 'sawtooth', from: 196, to: 220, dur: 0.5, vol: 0.4 },
    { wave: 'sawtooth', from: 294, to: 330, dur: 0.7, vol: 0.35, at: 0.45 },
  ],
  wind: [{ wave: 'noise', from: 600, to: 1400, dur: 0.6, vol: 0.25 }],
  // The radio's static, louder the closer a secret is.
  static: [{ wave: 'noise', from: 2400, to: 900, dur: 0.12, vol: 0.18 }],
  // Heard through the night forest: a fiddle at the dance (an own little run) and the train.
  fiddle: [
    { wave: 'triangle', from: 587, dur: 0.18, vol: 0.3 },
    { wave: 'triangle', from: 740, dur: 0.18, vol: 0.3, at: 0.18 },
    { wave: 'triangle', from: 659, dur: 0.12, vol: 0.28, at: 0.36 },
    { wave: 'triangle', from: 587, dur: 0.12, vol: 0.28, at: 0.48 },
    { wave: 'triangle', from: 494, dur: 0.4, vol: 0.3, at: 0.6 },
  ],
  whistle: [
    { wave: 'sine', from: 520, to: 540, dur: 1.0, vol: 0.3 },
    { wave: 'sine', from: 655, to: 680, dur: 1.0, vol: 0.22 },
    { wave: 'noise', from: 3000, dur: 0.9, vol: 0.08 },
  ],
  land: [{ wave: 'noise', from: 300, to: 100, dur: 0.06, vol: 0.25 }],
  step: [{ wave: 'noise', from: 200, to: 120, dur: 0.03, vol: 0.12 }],
};
