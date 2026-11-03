import { VIEW_W, VIEW_H } from '../engine/screen';
import { PALETTE } from '../data/palettes';
import type { Game, Overlay } from './game';

/** Three short, three long, three short – Dagmar's signal – in sixtieths of a second. */
function morse(): Array<[on: number, off: number]> {
  const s: Array<[number, number]> = [];
  for (let i = 0; i < 3; i++) s.push([10, 10]);
  s[2][1] = 22;
  for (let i = 0; i < 3; i++) s.push([30, 10]);
  s[5][1] = 22;
  for (let i = 0; i < 3; i++) s.push([10, 10]);
  return s;
}
const SIGNAL = morse();
const SIGNAL_LEN = SIGNAL.reduce((a, [on, off]) => a + on + off, 0);
/** Dagny blinks, a long silence, the belfry answers, and it stays lit a while. */
const ANSWER_AT = SIGNAL_LEN + 150;
const LEN = ANSWER_AT + SIGNAL_LEN + 120;

/** Is the light on at frame t of the signal? */
function lit(t: number): boolean {
  if (t < 0) return false;
  for (const [on, off] of SIGNAL) {
    if (t < on) return true;
    t -= on;
    if (t < off) return false;
    t -= off;
  }
  return false;
}

/**
 * Dagny signals across the lake, as Dagmar did: the evening lake, the belfry
 * in Kyrkbyn tiny on the far shore, her flashlight blinking – then nothing,
 * for a long while – and then a light up in the belfry, blinking back.
 * Pushed by the 'signal' action; `onDone` goes on with the dialog.
 */
export class SignalScene implements Overlay {
  hideHud = true;
  hidesBelow = true;
  private t = 0;

  constructor(private readonly game: Game, private readonly onDone: () => void) {}

  update(): boolean {
    this.t++;
    const t = this.t;
    if (lit(t - 40) && !lit(t - 41)) this.game.audio.play('menu');
    if (lit(t - ANSWER_AT) && !lit(t - ANSWER_AT - 1)) this.game.audio.play('select');
    if (t >= LEN || (t > ANSWER_AT + SIGNAL_LEN && (this.game.input.confirm() || this.game.input.taps.length > 0))) {
      this.onDone();
      return false;
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const t = this.t;
    const fade = Math.min(1, t / 30) * (t > LEN - 20 ? (LEN - t) / 20 : 1);
    ctx.globalAlpha = fade;
    // Evening sky and the lake.
    const sky = ctx.createLinearGradient(0, 0, 0, 100);
    sky.addColorStop(0, '#2f3b55');
    sky.addColorStop(1, '#6b4a6e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, 100);
    ctx.fillStyle = '#3f5f7a';
    ctx.fillRect(0, 100, VIEW_W, VIEW_H - 100);
    for (let i = 0; i < 26; i++) {
      const y = 104 + ((i * 37) % 60);
      const x = ((i * 83 + Math.floor(t / 3)) % (VIEW_W + 40)) - 20;
      ctx.fillStyle = 'rgba(169,198,207,0.35)';
      ctx.fillRect(x, y, 6 + (i % 3) * 3, 1);
    }
    // The far shore with Kyrkbyn's belfry, small.
    ctx.fillStyle = PALETTE.k;
    ctx.fillRect(0, 96, VIEW_W, 5);
    for (let x = 0; x < VIEW_W; x += 9) ctx.fillRect(x, 93 + ((x * 7) % 4), 6, 4);
    const bx = 228;
    ctx.fillRect(bx, 80, 5, 17);
    ctx.fillRect(bx - 1, 78, 7, 3);
    ctx.fillRect(bx + 1, 74, 3, 4);
    ctx.fillRect(bx + 2, 71, 1, 3);
    // The belfry's answer.
    if (lit(t - ANSWER_AT)) {
      const g = ctx.createRadialGradient(bx + 2.5, 84, 0, bx + 2.5, 84, 14);
      g.addColorStop(0, 'rgba(240,210,122,0.9)');
      g.addColorStop(1, 'rgba(240,210,122,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 12, 70, 29, 29);
      ctx.fillStyle = PALETTE.Y;
      ctx.fillRect(bx + 1, 83, 3, 2);
      ctx.fillStyle = 'rgba(240,210,122,0.25)';
      ctx.fillRect(bx, 101, 5, 30);
    }
    // The near shore: the signal stone and Dagny's flashlight.
    ctx.fillStyle = '#2b2233';
    ctx.beginPath();
    ctx.moveTo(0, VIEW_H);
    ctx.lineTo(0, 150);
    ctx.lineTo(70, 146);
    ctx.lineTo(110, 156);
    ctx.lineTo(130, VIEW_H);
    ctx.fill();
    ctx.fillStyle = PALETTE.g;
    ctx.fillRect(36, 128, 14, 20);
    ctx.fillRect(38, 125, 10, 3);
    ctx.fillStyle = PALETTE.h;
    ctx.fillRect(64, 132, 5, 5);
    ctx.fillStyle = PALETTE.M;
    ctx.fillRect(63, 137, 7, 9);
    if (lit(t - 40)) {
      const g = ctx.createRadialGradient(72, 138, 0, 72, 138, 22);
      g.addColorStop(0, 'rgba(243,230,200,0.95)');
      g.addColorStop(1, 'rgba(243,230,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(50, 116, 44, 44);
      ctx.fillStyle = 'rgba(243,230,200,0.12)';
      ctx.beginPath();
      ctx.moveTo(72, 137);
      ctx.lineTo(bx, 78);
      ctx.lineTo(bx, 92);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
