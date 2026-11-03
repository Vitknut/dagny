/**
 * Shared input model. Keyboard, gamepad and touch all write into their own
 * per-source state; once per logic step `poll()` merges them into `down`
 * and computes edges (`pressed` / `released`).
 *
 * Short taps that start and end between two logic steps are latched so
 * they are never lost.
 */
export const Act = {
  Left: 0,
  Right: 1,
  Up: 2,
  Down: 3,
  Jump: 4,
  Sword: 5,
  Magic: 6,
  Pause: 7,
  Confirm: 8,
  /** Touch only (optional button): a low strike, the same as Down + Sword. */
  LowSword: 9,
} as const;
export type Action = (typeof Act)[keyof typeof Act];
const COUNT = 10;

export type InputSource = 'keyboard' | 'gamepad' | 'touch';

const KEYMAP: Record<string, Action> = {
  ArrowLeft: Act.Left,
  KeyA: Act.Left,
  ArrowRight: Act.Right,
  KeyD: Act.Right,
  ArrowUp: Act.Up,
  KeyW: Act.Up,
  ArrowDown: Act.Down,
  KeyS: Act.Down,
  KeyZ: Act.Jump,
  Space: Act.Jump,
  KeyX: Act.Sword,
  KeyC: Act.Magic,
  Escape: Act.Pause,
  KeyP: Act.Pause,
  Enter: Act.Confirm,
  NumpadEnter: Act.Confirm,
};

export interface Tap {
  x: number;
  y: number;
}

export class Input {
  readonly down = new Array<boolean>(COUNT).fill(false);
  private readonly prev = new Array<boolean>(COUNT).fill(false);
  readonly keyboard = new Array<boolean>(COUNT).fill(false);
  readonly touch = new Array<boolean>(COUNT).fill(false);
  readonly gamepad = new Array<boolean>(COUNT).fill(false);
  private readonly latch = new Array<boolean>(COUNT).fill(false);
  /** Canvas taps (game coordinates) since the last poll – used by menus. */
  readonly taps: Tap[] = [];
  private pendingTaps: Tap[] = [];
  /** Which device was used most recently. */
  lastSource: InputSource = 'keyboard';
  /** Called when the most recent source changes. */
  onSourceChange: ((s: InputSource) => void) | null = null;
  /** Called on any user gesture – used to unlock audio on iOS. */
  onGesture: (() => void) | null = null;
  /** Called immediately (outside the logic step) when pause is pressed. */
  onPauseKey: (() => void) | null = null;
  private padWasActive = false;

  attach(target: Window = window): void {
    target.addEventListener('keydown', (e) => {
      const a = KEYMAP[e.code];
      if (a === undefined) return;
      e.preventDefault();
      if (!e.repeat) {
        this.keyboard[a] = true;
        this.latch[a] = true;
      }
      this.setSource('keyboard');
      this.onGesture?.();
    });
    target.addEventListener('keyup', (e) => {
      const a = KEYMAP[e.code];
      if (a === undefined) return;
      e.preventDefault();
      this.keyboard[a] = false;
    });
    target.addEventListener('blur', () => this.releaseAll());
  }

  /** Touch controls call this when a virtual button goes down. */
  press(a: Action): void {
    this.touch[a] = true;
    this.latch[a] = true;
    this.setSource('touch');
  }

  release(a: Action): void {
    this.touch[a] = false;
  }

  addTap(x: number, y: number): void {
    this.pendingTaps.push({ x, y });
  }

  releaseAll(): void {
    this.keyboard.fill(false);
    this.touch.fill(false);
    this.gamepad.fill(false);
    this.latch.fill(false);
  }

  setSource(s: InputSource): void {
    if (s !== this.lastSource) {
      this.lastSource = s;
      this.onSourceChange?.(s);
    }
  }

  private pollGamepad(): void {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const g = this.gamepad;
    g.fill(false);
    let active = false;
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const b = (i: number): boolean => !!p.buttons[i]?.pressed;
      const ax = p.axes[0] ?? 0;
      const ay = p.axes[1] ?? 0;
      g[Act.Left] ||= b(14) || ax < -0.45;
      g[Act.Right] ||= b(15) || ax > 0.45;
      g[Act.Up] ||= b(12) || ay < -0.5;
      g[Act.Down] ||= b(13) || ay > 0.5;
      g[Act.Jump] ||= b(0);
      g[Act.Sword] ||= b(1) || b(2);
      g[Act.Magic] ||= b(3);
      g[Act.Pause] ||= b(9);
    }
    for (let i = 0; i < COUNT; i++) if (g[i]) active = true;
    if (active && !this.padWasActive) {
      this.setSource('gamepad');
      this.onGesture?.();
    }
    this.padWasActive = active;
  }

  /** Call once per logic step, before game logic. */
  poll(): void {
    this.pollGamepad();
    for (let i = 0; i < COUNT; i++) {
      this.prev[i] = this.down[i];
      this.down[i] = this.keyboard[i] || this.touch[i] || this.gamepad[i] || this.latch[i];
      this.latch[i] = false;
    }
    this.taps.length = 0;
    if (this.pendingTaps.length) {
      for (const t of this.pendingTaps) this.taps.push(t);
      this.pendingTaps = [];
    }
  }

  held(a: Action): boolean {
    return this.down[a];
  }

  pressed(a: Action): boolean {
    return this.down[a] && !this.prev[a];
  }

  released(a: Action): boolean {
    return !this.down[a] && this.prev[a];
  }

  /** Menu "OK": jump, Enter or a gamepad A. */
  confirm(): boolean {
    return this.pressed(Act.Jump) || this.pressed(Act.Confirm);
  }

  /** Menu "back": sword / B. */
  back(): boolean {
    return this.pressed(Act.Sword);
  }

  /** Forget current state, e.g. when a menu opens so a held button doesn't leak through. */
  consume(): void {
    for (let i = 0; i < COUNT; i++) this.prev[i] = this.down[i];
    this.taps.length = 0;
  }
}
