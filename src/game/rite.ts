import { VIEW_W, VIEW_H } from '../engine/screen';
import { drawText, measure } from '../engine/text';
import { FONT_HEIGHT } from '../art/font';
import { PALETTE } from '../data/palettes';
import { SPELLS } from '../data/spells';
import type { SpellId } from '../data/types';
import type { Game, Overlay } from './game';

/** Each reading's own colour in the rite. */
const COLOUR: Readonly<Record<SpellId, string>> = {
  lakning: 'l', skydd: 'W', hopp: 'U', lyse: 'Y', eld: 'o', hamn: 'P', aska: 'C',
};

/** Little marks like the ones cut in rune stones, drawn as 3×5 pixel strokes. */
const RUNES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [0, 1], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 0]],
  [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [0, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [2, 1], [1, 2]],
  [[1, 0], [0, 1], [2, 1], [1, 2], [1, 3], [1, 4]],
];

const LEN = 240;

/**
 * Learning a reading: the room goes dark, a ring of runes turns and closes in
 * on Dagny, sparks rise, a flash – and the reading's name stands written in
 * the air. Pushed by the learnSpell action, over the teacher's dialog, which
 * goes on when the rite is over.
 */
export class SpellRite implements Overlay {
  hideHud = true;
  hidesBelow = true;
  private t = 0;
  private readonly sparks: Array<{ x: number; y: number; vy: number; life: number }> = [];
  private readonly name: HTMLCanvasElement | null;

  constructor(private readonly game: Game, private readonly spell: SpellId) {
    this.name = scaled(SPELLS[spell].name.toUpperCase(), COLOUR[spell], 2);
    game.audio.play('magic');
  }

  update(): boolean {
    this.t++;
    const { x, y } = this.centre();
    if (this.t < 170 && this.t % 2 === 0) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 18;
      this.sparks.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.6 + 8, vy: -0.4 - Math.random() * 0.8, life: 40 + Math.random() * 30 });
    }
    for (const s of this.sparks) { s.y += s.vy; s.life--; }
    for (let i = this.sparks.length - 1; i >= 0; i--) if (this.sparks[i].life <= 0) this.sparks.splice(i, 1);
    if (this.t === 150) {
      this.game.audio.play('unlock');
      this.game.vibrate([30, 30, 80]);
    }
    // Can be cut short once the flash has come.
    if (this.t > 160 && (this.game.input.confirm() || this.game.input.taps.length > 0)) return false;
    return this.t < LEN;
  }

  /** Where Dagny stands on the screen (the middle, if the scene can't say). */
  private centre(): { x: number; y: number } {
    const sc = this.game.scene as unknown as { playerCenter?: () => { x: number; y: number }; camX?: number; camY?: number };
    if (sc.playerCenter && sc.camX !== undefined && sc.camY !== undefined) {
      const c = sc.playerCenter();
      return { x: c.x - sc.camX, y: c.y - sc.camY };
    }
    return { x: VIEW_W / 2, y: VIEW_H / 2 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const t = this.t;
    const col = PALETTE[COLOUR[this.spell]];
    const { x, y } = this.centre();
    // The dark comes down, and lifts at the end.
    const dark = Math.min(1, t / 40) * (t > LEN - 30 ? (LEN - t) / 30 : 1);
    ctx.fillStyle = `rgba(20, 14, 26, ${0.78 * dark})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // A glow on Dagny.
    const g = ctx.createRadialGradient(x, y, 2, x, y, 40);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.35 * dark;
    ctx.fillStyle = g;
    ctx.fillRect(x - 40, y - 40, 80, 80);
    ctx.globalAlpha = 1;
    // The ring of runes, turning and closing in until the flash.
    if (t < 160) {
      const r = 70 - Math.min(1, t / 150) * 46;
      const n = 12;
      ctx.fillStyle = col;
      for (let i = 0; i < n; i++) {
        if (i / n > t / 50) continue;
        const a = (i / n) * Math.PI * 2 + t * 0.03;
        const rx = Math.round(x + Math.cos(a) * r) - 1;
        const ry = Math.round(y + Math.sin(a) * r * 0.75) - 2;
        for (const [px, py] of RUNES[i % RUNES.length]) ctx.fillRect(rx + px, ry + py, 1, 1);
      }
    }
    // Sparks rising.
    ctx.fillStyle = col;
    for (const s of this.sparks) ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, s.life > 20 ? 2 : 1);
    // The flash.
    if (t >= 150 && t < 166) {
      ctx.fillStyle = `rgba(243, 230, 200, ${1 - (t - 150) / 16})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    // The name, written in the air.
    if (t >= 154 && this.name) {
      const a = Math.min(1, (t - 154) / 12) * (t > LEN - 30 ? (LEN - t) / 30 : 1);
      ctx.globalAlpha = a;
      ctx.drawImage(this.name, Math.round(VIEW_W / 2 - this.name.width / 2), 40);
      drawText(ctx, SPELLS[this.spell].description, VIEW_W / 2, 64, 'W', { align: 'center', shadow: 'k' });
      ctx.globalAlpha = 1;
    }
  }
}

/** A line of text drawn big (whole-pixel scaling, with a dark outline). */
function scaled(text: string, colour: string, k: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const w = measure(text) + 2;
  const h = FONT_HEIGHT + 2;
  const small = document.createElement('canvas');
  small.width = w;
  small.height = h;
  drawText(small.getContext('2d') as CanvasRenderingContext2D, text, 1, 1, colour, { outline: 'k' });
  const big = document.createElement('canvas');
  big.width = w * k;
  big.height = h * k;
  const ctx = big.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, w * k, h * k);
  return big;
}
