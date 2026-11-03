import type { KeyValueStore } from '../engine/storage';
import type { StickMode } from '../engine/touch';

export interface Settings {
  music: number; // 0–10
  sfx: number; // 0–10
  calm: boolean;
  stickMode: StickMode;
  controlScale: number; // 0.75–1.6
  controlOpacity: number; // 0.15–0.9
  /** 0 = near the edge, 1 = middle, 2 = further in. */
  placement: number;
  vibration: boolean;
  showFps: boolean;
  /** Extra touch button for a low strike (instead of Down + Sword). */
  lowButton: boolean;
}

export const SETTINGS_KEY = 'dagny.settings';

export const DEFAULT_SETTINGS: Settings = {
  music: 6,
  sfx: 7,
  calm: false,
  stickMode: 'stick',
  controlScale: 1,
  controlOpacity: 0.45,
  placement: 0,
  vibration: true,
  showFps: false,
  lowButton: false,
};

const clamp = (v: unknown, lo: number, hi: number, d: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d;

export function loadSettings(store: KeyValueStore): Settings {
  const s = { ...DEFAULT_SETTINGS };
  try {
    const raw = JSON.parse(store.get(SETTINGS_KEY) ?? 'null') as Partial<Settings> | null;
    if (raw && typeof raw === 'object') {
      s.music = Math.round(clamp(raw.music, 0, 10, s.music));
      s.sfx = Math.round(clamp(raw.sfx, 0, 10, s.sfx));
      s.calm = raw.calm === true;
      s.stickMode = raw.stickMode === 'dpad' ? 'dpad' : 'stick';
      s.controlScale = clamp(raw.controlScale, 0.75, 1.6, s.controlScale);
      s.controlOpacity = clamp(raw.controlOpacity, 0.15, 0.9, s.controlOpacity);
      s.placement = Math.round(clamp(raw.placement, 0, 2, s.placement));
      s.vibration = raw.vibration !== false;
      s.showFps = raw.showFps === true;
      s.lowButton = raw.lowButton === true;
    }
  } catch {
    /* defaults */
  }
  return s;
}

export function saveSettings(store: KeyValueStore, s: Settings): void {
  store.set(SETTINGS_KEY, JSON.stringify(s));
}

/** Placement presets in CSS px (offset from the screen edges). */
export const PLACEMENT_OFFSETS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 24, y: 16 },
  { x: 56, y: 28 },
];
