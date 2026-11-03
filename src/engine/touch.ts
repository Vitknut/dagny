import { Act, type Action, type Input } from './input';

export type StickMode = 'stick' | 'dpad';

export interface TouchLayout {
  mode: StickMode;
  /** 0.75 – 1.6 */
  scale: number;
  /** 0.15 – 0.9 */
  opacity: number;
  /** Distance from the screen edges in CSS px (placement). */
  offsetX: number;
  offsetY: number;
  /** Show an extra "LÅGT" button for a low strike. */
  lowButton: boolean;
}

/**
 * On-screen controls as DOM elements on top of the canvas, so they are
 * crisp, at least 48×48 CSS px and independent of the game resolution.
 * Pointer events with per-pointer tracking give full multitouch: walk,
 * jump and strike at the same time.
 */
export class TouchControls {
  private readonly root: HTMLElement;
  private stickEl!: HTMLElement;
  private knob: HTMLElement | null = null;
  private arms: Record<string, HTMLElement> = {};
  private stickPointer: number | null = null;
  private dirs = { left: false, right: false, up: false, down: false };
  private layout: TouchLayout;
  onPause: (() => void) | null = null;
  onFullscreen: (() => void) | null = null;

  constructor(root: HTMLElement, private readonly input: Input, layout: TouchLayout) {
    this.root = root;
    this.layout = layout;
    this.build();
    this.apply(layout);
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    this.setVisible(coarse || 'ontouchstart' in window);
  }

  setVisible(v: boolean): void {
    this.root.classList.toggle('hidden', !v);
    if (!v) this.clearStick();
  }

  get visible(): boolean {
    return !this.root.classList.contains('hidden');
  }

  apply(layout: TouchLayout): void {
    const modeChanged = layout.mode !== this.layout.mode;
    this.layout = layout;
    const s = document.documentElement.style;
    s.setProperty('--ctl-scale', String(layout.scale));
    s.setProperty('--ctl-opacity', String(layout.opacity));
    s.setProperty('--ctl-offset-x', `${layout.offsetX}px`);
    s.setProperty('--ctl-offset-y', `${layout.offsetY}px`);
    this.root.classList.toggle('no-low', !layout.lowButton);
    if (modeChanged) {
      this.stickEl.remove();
      this.buildStick();
    }
  }

  private build(): void {
    this.root.innerHTML = '';
    this.buildStick();
    this.button('ctl-btn ctl-jump', 'HOPPA', Act.Jump);
    this.button('ctl-btn ctl-sword', 'SVÄRD', Act.Sword);
    this.button('ctl-btn ctl-magic', 'MAGI', Act.Magic);
    this.button('ctl-btn ctl-low', 'LÅGT', Act.LowSword);
    const pause = this.el('ctl ctl-small ctl-pause', 'II');
    pause.setAttribute('aria-label', 'Paus');
    pause.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.input.setSource('touch');
      this.onPause?.();
    });
    const fs = this.el('ctl ctl-small ctl-fullscreen', '⛶');
    fs.setAttribute('aria-label', 'Helskärm');
    fs.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.onFullscreen?.();
    });
  }

  private el(cls: string, text: string): HTMLElement {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = text;
    d.addEventListener('contextmenu', (e) => e.preventDefault());
    this.root.appendChild(d);
    return d;
  }

  /** The action buttons, and which fingers hold each (a thumb may slide from one to the next). */
  private buttons = new Map<HTMLElement, { action: Action; pointers: Set<number> }>();
  /** Which button each finger is on now. */
  private fingers = new Map<number, HTMLElement>();

  private button(cls: string, label: string, action: Action): void {
    const d = this.el(`ctl ${cls}`, label);
    this.buttons.set(d, { action, pointers: new Set() });
    d.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      try {
        d.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      this.input.setSource('touch');
      this.hold(e.pointerId, d);
    });
    // A thumb that slides off one button onto another lets go of the first and
    // presses the second – jump, then roll onto the sword, without lifting.
    d.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.fingers.has(e.pointerId)) return;
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.ctl-btn') as HTMLElement | null;
      if (hit && hit !== this.fingers.get(e.pointerId) && this.buttons.has(hit)) this.hold(e.pointerId, hit);
    });
    const up = (e: PointerEvent): void => this.hold(e.pointerId, null);
    d.addEventListener('pointerup', up);
    d.addEventListener('pointercancel', up);
    d.addEventListener('lostpointercapture', up);
  }

  /** Moves a finger onto a button (or off all of them), pressing and releasing as it goes. */
  private hold(pointer: number, el: HTMLElement | null): void {
    const was = this.fingers.get(pointer);
    if (was === el) return;
    if (was) {
      const b = this.buttons.get(was)!;
      b.pointers.delete(pointer);
      if (b.pointers.size === 0) {
        was.classList.remove('pressed');
        this.input.release(b.action);
      }
      this.fingers.delete(pointer);
    }
    if (el) {
      const b = this.buttons.get(el)!;
      if (b.pointers.size === 0) {
        el.classList.add('pressed');
        this.input.press(b.action);
      }
      b.pointers.add(pointer);
      this.fingers.set(pointer, el);
    }
  }

  private buildStick(): void {
    const dpad = this.layout.mode === 'dpad';
    const zone = document.createElement('div');
    zone.className = dpad ? 'ctl ctl-dpad' : 'ctl ctl-stick';
    zone.addEventListener('contextmenu', (e) => e.preventDefault());
    this.arms = {};
    this.knob = null;
    if (dpad) {
      for (const k of ['up', 'down', 'left', 'right']) {
        const a = document.createElement('div');
        a.className = `arm ${k}`;
        zone.appendChild(a);
        this.arms[k] = a;
      }
    } else {
      this.knob = document.createElement('div');
      this.knob.className = 'knob';
      zone.appendChild(this.knob);
    }
    this.root.insertBefore(zone, this.root.firstChild);
    this.stickEl = zone;

    const move = (e: PointerEvent): void => {
      if (e.pointerId !== this.stickPointer) return;
      e.preventDefault();
      const r = zone.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const radius = r.width / 2;
      let dx = (e.clientX - cx) / radius;
      let dy = (e.clientY - cy) / radius;
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      const dead = dpad ? 0.2 : 0.3;
      const mag = Math.hypot(dx, dy);
      let l = false, rr = false, u = false, d = false;
      if (mag > dead) {
        // Left and right get the widest slices (±30°), so walking never turns
        // into a duck or an up-thrust by a slightly slanted thumb; straight up
        // and down get ±25°, and the diagonals what is left between.
        const slope = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
        const horiz = slope < 65;
        const vert = slope > 30;
        if (horiz) {
          l = dx < 0;
          rr = dx > 0;
        }
        if (vert) {
          u = dy < 0;
          d = dy > 0;
        }
      }
      this.setDirs(l, rr, u, d);
      if (this.knob) {
        this.knob.style.transform = `translate(${dx * 70}%, ${dy * 70}%)`;
      }
    };
    zone.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.stickPointer !== null) return;
      this.stickPointer = e.pointerId;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      this.input.setSource('touch');
      move(e);
    });
    zone.addEventListener('pointermove', move);
    const end = (e: PointerEvent): void => {
      if (e.pointerId !== this.stickPointer) return;
      this.clearStick();
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
    zone.addEventListener('lostpointercapture', end);
  }

  private clearStick(): void {
    this.stickPointer = null;
    this.setDirs(false, false, false, false);
    if (this.knob) this.knob.style.transform = '';
  }

  private setDirs(l: boolean, r: boolean, u: boolean, d: boolean): void {
    const set = (key: 'left' | 'right' | 'up' | 'down', on: boolean, a: Action): void => {
      if (this.dirs[key] === on) return;
      this.dirs[key] = on;
      if (on) this.input.press(a);
      else this.input.release(a);
      this.arms[key]?.classList.toggle('on', on);
    };
    set('left', l, Act.Left);
    set('right', r, Act.Right);
    set('up', u, Act.Up);
    set('down', d, Act.Down);
  }
}
