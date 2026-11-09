import { drawSprite } from '../../engine/sprites';
import { PALETTE } from '../../data/palettes';
import type { Enemy } from '../../entities/enemy';

/**
 * Someone who follows Dagny out of a dark place (Olle in Dagmars ort). He walks
 * exactly where she walked, a little behind, so every jump she makes he can make
 * too. He will not go on if she runs too far ahead (he stands and cries until
 * she comes back), and he cowers while a bat is close.
 */
const DELAY = 22;
/** How far ahead (pixels) Dagny may get before he stops and cries. */
const TOO_FAR = 110;
/** How close a flying creature must come before he cowers. */
const AFRAID = 44;

export class Follower {
  /** Feet, in pixels (centre bottom). */
  x: number;
  y: number;
  facing: 1 | -1 = 1;
  t = 0;
  crying = false;
  scared = false;
  private trail: Array<{ x: number; y: number }> = [];

  constructor(readonly sprite: string, x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Close enough to count as with her (to take him out through a door). */
  near(px: number, py: number): boolean {
    return Math.hypot(px - this.x, py - this.y) < 56;
  }

  /** `feet` is Dagny's feet; `walking` is false while she is a bird or dead (he waits). */
  update(feet: { x: number; y: number }, walking: boolean, enemies: readonly Enemy[]): void {
    this.t++;
    const last = this.trail[this.trail.length - 1];
    if (walking && (!last || Math.abs(last.x - feet.x) + Math.abs(last.y - feet.y) > 0.5)) this.trail.push({ x: feet.x, y: feet.y });
    this.scared = enemies.some((e) => !e.dead && !!e.def.flying && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - (this.y - 12)) < AFRAID);
    const far = Math.hypot(feet.x - this.x, feet.y - this.y) > TOO_FAR;
    this.crying = far || this.scared;
    if (this.crying || this.trail.length <= DELAY) return;
    const next = this.trail.shift()!;
    if (next.x !== this.x) this.facing = next.x > this.x ? 1 : -1;
    this.x = next.x;
    this.y = next.y;
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const frame = this.scared ? 0 : Math.floor(this.t / 10) % 2;
    // Cowering: drawn a little lower, as if crouched.
    const dy = this.scared ? 3 : 0;
    drawSprite(ctx, this.sprite, frame, this.x - 8 - camX, this.y - 24 + dy - camY, this.facing === -1);
    if (this.crying && Math.floor(this.t / 8) % 2 === 0) {
      // Tears.
      ctx.fillStyle = PALETTE.U;
      const tx = this.x + this.facing * 2 - camX;
      ctx.fillRect(Math.round(tx - 3), Math.round(this.y - 17 + dy + ((this.t >> 2) % 4) - camY), 1, 2);
      ctx.fillRect(Math.round(tx + 3), Math.round(this.y - 16 + dy + ((this.t >> 2) % 3) - camY), 1, 2);
    }
  }
}
