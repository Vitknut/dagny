import { Screen, VIEW_W, VIEW_H } from '../engine/screen';
import { Input, Act } from '../engine/input';
import { AudioEngine } from '../engine/audio';
import { SafeLocalStore } from '../engine/storage';
import { TouchControls } from '../engine/touch';
import { setHapticsEnabled, vibrate } from '../engine/haptics';
import { drawText, measure } from '../engine/text';
import { TONES, PALETTE, type ToneFilter } from '../data/palettes';
import { STR } from '../data/strings';
import { TEMPLES } from '../data/temples';
import { SpellRite } from './rite';
import { SignalScene } from './signal';
import { DialogOverlay } from './dialog';
import type { Condition, DialogAction } from '../data/types';
import { loadSettings, saveSettings, PLACEMENT_OFFSETS, type Settings } from './settings';
import { readSave, writeSave } from './save';
import { MAX_LIVES, addContainer, hasFlag, hasItem, hpMax, mpMax, setFlag, type GameState } from './state';

export interface Scene {
  /** Music id to play while this scene is active. */
  music(): string | null;
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
  /** Called after the scene becomes active. */
  enter?(): void;
  /** Called when the game is about to be saved (store exact position). */
  capture?(state: GameState): void;
  /** Called when the scene is left. */
  exit?(): void;
}

export interface Overlay {
  /** Return false to close. */
  update(): boolean;
  render(ctx: CanvasRenderingContext2D): void;
  /** Hide the HUD while open. */
  hideHud?: boolean;
  /** Don't draw the overlays beneath this one while it is open. */
  hidesBelow?: boolean;
}

interface Toast {
  text: string;
  life: number;
}

/**
 * The game shell: owns the screen, input, audio, storage and settings, runs
 * the current scene and a stack of overlays (dialog, menus).
 */
export class Game {
  readonly screen: Screen;
  readonly ctx: CanvasRenderingContext2D;
  readonly input = new Input();
  readonly audio: AudioEngine;
  readonly store = new SafeLocalStore();
  readonly touch: TouchControls;
  settings: Settings;
  state: GameState | null = null;
  scene: Scene | null = null;
  overlays: Overlay[] = [];
  /** Logic frames since start. */
  frame = 0;
  /** The frame the last overlay (dialog, menu) closed. */
  overlayClosedAt = -1000;
  /**
   * Buns, thermoses and lingonberries lying in rooms that Dagny has taken
   * (by room position). They stay gone until she rests or wakes in a village
   * (a new day), so going in and out of a place refills nothing. Meetings on
   * the map are fresh ground each time (game/flow.ts).
   */
  readonly taken = new Set<string>();
  private fade = 0;
  private fadeDir = 0;
  private fadeCb: (() => void) | null = null;
  private toasts: Toast[] = [];
  private vignettes = new Map<string, HTMLCanvasElement>();
  /** True while the app is in the background (audio stays silent). */
  paused = false;
  /** Set by the main module – draws the "turn your phone" screen. */
  rotateScreen: { update(): void; render(ctx: CanvasRenderingContext2D): void } | null = null;
  /** Opens the pause menu (set by main to avoid an import cycle). */
  openPause: (() => void) | null = null;
  fps = 60;
  debug = false;

  constructor(canvas: HTMLCanvasElement, controlsRoot: HTMLElement, audio: AudioEngine) {
    this.screen = new Screen(canvas);
    this.ctx = this.screen.ctx;
    this.audio = audio;
    this.settings = loadSettings(this.store);
    this.input.attach();
    this.touch = new TouchControls(controlsRoot, this.input, this.layout());
    this.input.onSourceChange = (s) => this.touch.setVisible(s === 'touch');
    this.input.onGesture = () => this.audio.unlock();
    this.touch.onFullscreen = () => this.toggleFullscreen();
    this.touch.onPause = () => this.openPause?.();
    // Taps on the canvas (menus, NPCs). Also unlock audio and show touch controls.
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // preventDefault also stops the browser moving keyboard focus here – and
      // when the game runs inside a frame (a web page, the demo), the keys would
      // keep going to the page around it. Take focus ourselves.
      window.focus();
      this.audio.unlock();
      if (e.pointerType === 'touch') {
        this.input.setSource('touch');
        this.touch.setVisible(true);
      }
      const p = this.screen.toGame(e.clientX, e.clientY);
      this.input.addTap(p.x, p.y);
    });
    controlsRoot.addEventListener('pointerdown', () => this.audio.unlock(), { capture: true });
    // Any click or touch anywhere gives the game the keyboard (see above).
    document.addEventListener('pointerdown', () => window.focus(), { capture: true });
    window.focus();
    for (const ev of ['touchstart', 'touchend', 'gesturestart', 'dblclick', 'contextmenu'] as const) {
      document.addEventListener(ev, (e) => {
        if (ev === 'touchstart' || ev === 'touchend') this.audio.unlock();
        if ((e.target as HTMLElement | null)?.tagName !== 'INPUT') e.preventDefault();
      }, { passive: false });
    }
    this.applySettings();
  }

  layout(): import('../engine/touch').TouchLayout {
    const off = PLACEMENT_OFFSETS[this.settings.placement] ?? PLACEMENT_OFFSETS[0];
    return {
      mode: this.settings.stickMode,
      scale: this.settings.controlScale,
      opacity: this.settings.controlOpacity,
      lowButton: this.settings.lowButton,
      offsetX: off.x,
      offsetY: off.y,
    };
  }

  applySettings(): void {
    this.audio.setVolumes(this.settings.music / 10, this.settings.sfx / 10);
    setHapticsEnabled(this.settings.vibration);
    this.touch?.apply(this.layout());
    saveSettings(this.store, this.settings);
  }

  toggleFullscreen(): void {
    const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    // Not allowed here: inside a frame that forbids it (e.g. a preview page),
    // or a browser without fullscreen for pages (iPhone Safari). Say so.
    const explain = (): void => this.toast(STR.noFullscreen, 4);
    try {
      if (document.fullscreenElement || d.webkitFullscreenElement) {
        if (document.exitFullscreen) void document.exitFullscreen();
        else d.webkitExitFullscreen?.();
      } else if (!(document.fullscreenEnabled || d.webkitFullscreenEnabled)) {
        explain();
      } else if (el.requestFullscreen) {
        void el.requestFullscreen({ navigationUI: 'hide' }).then(() => {
          const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
          o?.lock?.('landscape').catch(() => undefined);
        }).catch(explain);
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        explain();
      }
    } catch {
      explain();
    }
  }

  // --- Flow ------------------------------------------------------------------

  setScene(scene: Scene): void {
    this.scene?.exit?.();
    this.scene = scene;
    scene.enter?.();
    this.audio.playMusic(scene.music());
  }

  /** Fade out, run `cb` (usually a scene change), fade in. */
  transition(cb: () => void): void {
    if (this.fadeDir !== 0) return;
    this.fadeDir = 1;
    this.fadeCb = cb;
  }

  get transitioning(): boolean {
    return this.fadeDir !== 0;
  }

  pushOverlay(o: Overlay): void {
    this.overlays.push(o);
    this.input.consume();
  }

  get modal(): boolean {
    return this.overlays.length > 0;
  }

  toast(text: string, seconds = 1.6): void {
    this.toasts.push({ text, life: Math.round(seconds * 60) });
    if (this.toasts.length > 3) this.toasts.shift();
  }

  vibrate(ms: number | number[]): void {
    vibrate(ms);
  }

  // --- Saving -------------------------------------------------------------------

  save(showToast = false): void {
    if (!this.state) return;
    this.scene?.capture?.(this.state);
    const ok = writeSave(this.store, this.state);
    if (showToast) this.toast(ok ? STR.saved : STR.noStorage);
  }

  loadSave(): GameState | null {
    return readSave(this.store)?.state ?? null;
  }

  // --- Visibility / pause ----------------------------------------------------------

  /** App went to the background: pause, silence and save. */
  suspend(): void {
    if (this.paused) return;
    this.paused = true;
    this.input.releaseAll();
    this.audio.suspend();
    this.save();
  }

  resumeFromBackground(): void {
    if (!this.paused) return;
    this.paused = false;
    this.audio.resume();
    // Come back into the pause menu so a phone call never gets Dagny hurt.
    if (this.state && this.scene && !this.modal) this.openPause?.();
  }

  // --- Conditions & actions used by dialog ---------------------------------------------

  check(conds: Condition[] | undefined): boolean {
    const s = this.state;
    if (!conds || !conds.length) return true;
    if (!s) return false;
    return conds.every((c) => {
      if ('flag' in c) return hasFlag(s, c.flag);
      if ('notFlag' in c) return !hasFlag(s, c.notFlag);
      if ('item' in c) return hasItem(s, c.item);
      if ('notItem' in c) return !hasItem(s, c.notItem);
      if ('spell' in c) return s.spells.includes(c.spell);
      if ('notSpell' in c) return !s.spells.includes(c.notSpell);
      return true;
    });
  }

  /** Hook for scenes that need to react to actions (e.g. resting heals visually). */
  onAction: ((a: DialogAction) => void) | null = null;
  /** Story scenes (the ending, the credits), wired up in main.ts. */
  onScene: ((scene: 'ending' | 'credits') => void) | null = null;
  onTravel: ((area: string) => void) | null = null;

  runAction(a: DialogAction): void {
    const s = this.state;
    if (!s) return;
    switch (a.type) {
      case 'flag':
        setFlag(s, a.flag);
        break;
      case 'learnSpell':
        if (!s.spells.includes(a.spell)) s.spells.push(a.spell);
        s.selectedSpell ??= a.spell;
        this.audio.jingle('lara');
        // The rite: the reading is written in the air before the teacher goes on.
        this.pushOverlay(new SpellRite(this, a.spell));
        break;
      case 'learnSkill':
        if (!s.skills.includes(a.skill)) s.skills.push(a.skill);
        this.audio.jingle('lara');
        break;
      case 'rest':
        this.taken.clear();
        s.hp = hpMax(s);
        s.mp = mpMax(s);
        this.audio.play('heal');
        break;
      case 'heal':
        s.hp = hpMax(s);
        this.audio.play('heal');
        break;
      case 'magic':
        s.mp = mpMax(s);
        this.audio.play('heal');
        break;
      case 'xp':
        s.xp += a.amount;
        this.audio.play('xp');
        break;
      case 'giveItem':
        if (!s.items.includes(a.item)) s.items.push(a.item);
        this.audio.jingle('fynd');
        break;
      case 'takeItem':
        s.items = s.items.filter((i) => i !== a.item);
        break;
      case 'scene':
        this.onScene?.(a.scene);
        break;
      case 'travel':
        this.onTravel?.(a.area);
        break;
      case 'container':
        if (addContainer(s, a.kind, a.id)) this.audio.jingle('fynd');
        break;
      case 'life':
        if (!s.opened.includes(`liv1:${a.id}`)) {
          s.opened.push(`liv1:${a.id}`);
          s.lives = Math.min(MAX_LIVES, s.lives + 1);
          this.audio.jingle('fynd');
          this.toast(STR.extraLife, 3);
        }
        break;
      case 'signal': {
        const then = a.then;
        this.pushOverlay(new SignalScene(this, () => this.pushOverlay(new DialogOverlay(this, then))));
        break;
      }
    }
    this.onAction?.(a);
    if (a.type === 'rest') this.save();
  }

  /** Number of temples restored – the summer light comes back piece by piece. */
  restoredCount(): number {
    const s = this.state;
    if (!s) return 0;
    return TEMPLES.filter((t) => hasFlag(s, `${t.id}_klar`)).length;
  }

  // --- Main loop -------------------------------------------------------------------

  update(): void {
    this.input.poll();
    if (this.paused) return;
    this.frame++;
    if (this.screen.portrait && this.rotateScreen) {
      this.rotateScreen.update();
      return;
    }
    if (this.fadeDir !== 0) {
      this.fade += this.fadeDir * (1 / 12);
      if (this.fade >= 1) {
        this.fade = 1;
        const cb = this.fadeCb;
        this.fadeCb = null;
        cb?.();
        this.fadeDir = -1;
        this.input.consume();
      } else if (this.fade <= 0) {
        this.fade = 0;
        this.fadeDir = 0;
      }
      return;
    }
    if (this.state) this.state.playTime += 1 / 60;
    if (this.input.pressed(Act.Pause) && !this.modal && this.state && this.scene) {
      this.openPause?.();
      return;
    }
    if (this.overlays.length) {
      const top = this.overlays[this.overlays.length - 1];
      if (!top.update()) {
        const i = this.overlays.lastIndexOf(top);
        if (i >= 0) this.overlays.splice(i, 1);
        this.input.consume();
        this.overlayClosedAt = this.frame;
      }
    } else {
      this.scene?.update();
    }
    for (const t of this.toasts) t.life--;
    this.toasts = this.toasts.filter((t) => t.life > 0);
  }

  render(): void {
    const ctx = this.ctx;
    if (this.screen.portrait && this.rotateScreen) {
      this.rotateScreen.render(ctx);
      return;
    }
    ctx.fillStyle = PALETTE.k;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.scene?.render(ctx);
    // An overlay that takes the whole stage (the rite) hides the ones beneath it.
    let from = 0;
    this.overlays.forEach((o, i) => { if (o.hidesBelow) from = i; });
    for (const o of this.overlays.slice(from)) o.render(ctx);
    this.renderToasts(ctx);
    if (this.fade > 0) {
      ctx.globalAlpha = Math.min(1, this.fade);
      ctx.fillStyle = PALETTE.k;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalAlpha = 1;
    }
    if (this.settings.showFps) drawText(ctx, `${this.fps} fps`, 4, VIEW_H - 12, 'Y', { outline: 'k' });
  }

  get hudHidden(): boolean {
    return this.overlays.some((o) => o.hideHud);
  }

  private renderToasts(ctx: CanvasRenderingContext2D): void {
    let y = 26;
    for (const t of this.toasts) {
      const w = measure(t.text) + 10;
      const x = Math.round((VIEW_W - w) / 2);
      const a = Math.min(1, t.life / 15);
      ctx.globalAlpha = a;
      ctx.fillStyle = PALETTE.k;
      ctx.fillRect(x, y, w, 13);
      ctx.fillStyle = PALETTE.y;
      ctx.fillRect(x, y + 12, w, 1);
      drawText(ctx, t.text, x + 5, y + 1, 'W');
      ctx.globalAlpha = 1;
      y += 16;
    }
  }

  /**
   * Applies an area's tone filter: tint, faded-photo wash, vignette and the
   * "dark summer" gloom that lifts as temples are restored.
   */
  applyTone(ctx: CanvasRenderingContext2D, toneId: string, outdoor: boolean): void {
    const tone: ToneFilter = TONES[toneId] ?? TONES.sommarkvall;
    ctx.globalCompositeOperation = tone.mode;
    ctx.globalAlpha = tone.alpha;
    ctx.fillStyle = tone.tint;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (outdoor) {
      const gloom = Math.max(0, (7 - this.restoredCount()) / 7) * 0.2;
      if (gloom > 0) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = gloom;
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    if (tone.fade > 0) {
      ctx.globalAlpha = tone.fade;
      ctx.fillStyle = '#f3e6c8';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    ctx.globalAlpha = 1;
    if (tone.vignette > 0) ctx.drawImage(this.vignette(toneId, tone.vignette), 0, 0);
  }

  private vignette(id: string, strength: number): HTMLCanvasElement {
    let c = this.vignettes.get(id);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = VIEW_W;
    c.height = VIEW_H;
    const v = c.getContext('2d') as CanvasRenderingContext2D;
    const g = v.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.62);
    g.addColorStop(0, 'rgba(43,34,51,0)');
    g.addColorStop(1, `rgba(43,34,51,${strength})`);
    v.fillStyle = g;
    v.fillRect(0, 0, VIEW_W, VIEW_H);
    this.vignettes.set(id, c);
    return c;
  }
}
