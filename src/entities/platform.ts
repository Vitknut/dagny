import { drawSprite } from '../engine/sprites';
import { PALETTE } from '../data/palettes';
import type { PlatformDef } from '../data/types';

const T = 16;

/**
 * Lifts, mine carts, floating logs and water-wheel paddles: solid from above,
 * they carry whoever stands on them. The scene moves the rider by (dx, dy)
 * each step before the rider's own update.
 */
export class MovingPlatform {
  x: number;
  y: number;
  readonly w: number;
  readonly h: number;
  /** Movement this step. */
  dx = 0;
  dy = 0;
  private readonly ax: number;
  private readonly ay: number;
  private readonly bx: number;
  private readonly by: number;
  private readonly speed: number;
  /** 0 → at A, 1 → at B. */
  private pos = 0;
  private dir: 1 | -1 = 1;
  private pause = 0;
  /** Steps Dagny has waited at the other end of an empty ride platform. */
  private waited = 0;
  private wheel = 0;
  /** Water wheels: centre, radius and current angle. */
  private readonly cx: number;
  private readonly cy: number;
  private readonly radius: number;
  private readonly radiusY: number;
  private angle: number;
  /** The first paddle of a wheel draws the hub. */
  readonly hub: boolean;

  constructor(readonly def: PlatformDef, nearX: number, index = 0) {
    const k = def.kind;
    const round = k === 'wheel' || k === 'carousel';
    this.w = k === 'cart' || round ? 24 : 32;
    this.h = k === 'cart' ? 10 : round ? 6 : 8;
    const off = k === 'cart' ? 2 : k === 'log' ? T : 0;
    this.ax = def.tx * T;
    this.ay = def.ty * T + off;
    this.bx = def.toTx * T;
    this.by = def.toTy * T + off;
    this.speed = def.speed ?? (k === 'cart' ? 1.1 : round ? 0.012 : 0.6);
    this.cx = def.tx * T + T / 2;
    this.cy = def.ty * T + T / 2;
    this.radius = (def.radius ?? 3) * T;
    this.radiusY = (def.radiusY ?? (k === 'carousel' ? 0.5 : def.radius ?? 3)) * T;
    const count = def.count ?? 4;
    this.angle = (index / count) * Math.PI * 2;
    this.hub = round && index === 0;
    // Ride platforms start at the end nearest to Dagny, so she is never stranded.
    const nearB = def.mode === 'ride' && Math.abs(nearX - this.bx) < Math.abs(nearX - this.ax);
    if (nearB) {
      this.pos = 1;
      this.dir = -1;
    }
    this.x = 0;
    this.y = 0;
    this.place();
  }

  /** All platforms described by one definition (a wheel has several paddles). */
  static create(def: PlatformDef, nearX: number): MovingPlatform[] {
    if (def.kind !== 'wheel' && def.kind !== 'carousel') return [new MovingPlatform(def, nearX)];
    return Array.from({ length: def.count ?? 4 }, (_, i) => new MovingPlatform(def, nearX, i));
  }

  private place(): void {
    if (this.def.kind === 'wheel' || this.def.kind === 'carousel') {
      this.x = this.cx + Math.cos(this.angle) * this.radius - this.w / 2;
      this.y = this.cy + Math.sin(this.angle) * this.radiusY - this.h / 2;
    } else {
      this.x = this.ax + (this.bx - this.ax) * this.pos;
      this.y = this.ay + (this.by - this.ay) * this.pos;
    }
  }

  private get length(): number {
    return Math.hypot(this.bx - this.ax, this.by - this.ay) || 1;
  }

  /**
   * `waiting` is where Dagny stands on firm ground (not aboard), if she does:
   * an empty ride platform at the far end comes back for her after a moment,
   * so a fall from a cart never strands her on the wrong side.
   */
  update(ridden: boolean, waiting: number | null = null): void {
    const ox = this.x;
    const oy = this.y;
    if (this.def.kind === 'wheel' || this.def.kind === 'carousel') {
      this.angle += this.speed;
    } else {
      const stepFrac = this.speed / this.length;
      if (this.def.mode === 'loop') {
        if (this.pause > 0) this.pause--;
        else {
          this.pos += this.dir * stepFrac;
          if (this.pos >= 1 || this.pos <= 0) {
            this.pos = Math.max(0, Math.min(1, this.pos));
            this.dir = this.dir === 1 ? -1 : 1;
            this.pause = this.def.kind === 'log' ? 20 : 45;
          }
        }
      } else if (ridden && this.pause === 0) {
        this.pos += this.dir * stepFrac;
        if (this.pos >= 1 || this.pos <= 0) {
          this.pos = Math.max(0, Math.min(1, this.pos));
          this.dir = this.dir === 1 ? -1 : 1;
          // Rest at the end until Dagny steps off and on again.
          this.pause = -1;
        }
      } else if (!ridden) {
        if (this.pause === -1) this.pause = 0;
        const home = waiting === null ? null : Math.abs(waiting - (this.ax + this.w / 2)) < Math.abs(waiting - (this.bx + this.w / 2)) ? 0 : 1;
        if (home === null || home === this.pos) this.waited = 0;
        else if (++this.waited > 45) {
          // Roll back to her end, then set off the other way when she boards.
          this.pos += (home === 0 ? -1 : 1) * stepFrac;
          if (this.pos >= 1 || this.pos <= 0) {
            this.pos = home;
            this.dir = home === 0 ? 1 : -1;
            this.waited = 0;
          }
        }
      }
    }
    this.place();
    this.dx = this.x - ox;
    this.dy = this.y - oy;
    if (this.dx !== 0) this.wheel++;
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const x = Math.round(this.x - camX);
    const y = Math.round(this.y - camY);
    switch (this.def.kind) {
      case 'lift':
        // Cables up to the top of the screen.
        ctx.fillStyle = PALETTE.G;
        ctx.fillRect(x + 2, 0, 1, Math.max(0, y));
        ctx.fillRect(x + this.w - 3, 0, 1, Math.max(0, y));
        drawSprite(ctx, 'lift', 0, x, y);
        break;
      case 'cart':
        drawSprite(ctx, 'cart', Math.floor(this.wheel / 6) % 2, x, y);
        break;
      case 'log': {
        const bob = Math.round(Math.sin(this.wheel / 12) * 0.6);
        drawSprite(ctx, 'log', 0, x, y + bob);
        break;
      }
      case 'carousel': {
        // Brass pole up to the canopy, then the horse.
        const top = Math.round(this.cy - this.radiusY - 34 - camY);
        ctx.fillStyle = PALETTE.y;
        ctx.fillRect(x + 11, top, 2, Math.max(0, y - top));
        drawSprite(ctx, 'carouselHorse', 0, x, y - 2, Math.sin(this.angle) < 0);
        break;
      }
      case 'wheel': {
        // Spoke from the hub to this paddle.
        const hx = this.cx - camX;
        const hy = this.cy - camY;
        const px = x + this.w / 2;
        const py = y + this.h / 2;
        const steps = Math.ceil(this.radius / 2);
        for (const [col, size] of [[PALETTE.k, 4], [PALETTE.t, 2]] as const) {
          ctx.fillStyle = col;
          for (let i = 0; i <= steps; i++) {
            const k = i / steps;
            ctx.fillRect(Math.round(hx + (px - hx) * k) - size / 2, Math.round(hy + (py - hy) * k) - size / 2, size, size);
          }
        }
        drawSprite(ctx, 'paddle', 0, x, y);
        break;
      }
    }
  }

  renderHub(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (!this.hub) return;
    if (this.def.kind === 'wheel') {
      drawSprite(ctx, 'hub', 0, this.cx - 6 - camX, this.cy - 6 - camY);
      return;
    }
    // Carousel canopy: a striped tent roof with a pennant.
    const cx = Math.round(this.cx - camX);
    const top = Math.round(this.cy - this.radiusY - 34 - camY);
    const half = this.radius + 18;
    for (let row = 0; row < 14; row++) {
      const w = Math.round(half * (0.35 + 0.65 * (row / 13)));
      for (let x = -w; x < w; x += 8) {
        ctx.fillStyle = Math.floor((x + 400) / 8) % 2 === 0 ? PALETTE.R : PALETTE.W;
        ctx.fillRect(cx + x, top - 14 + row, Math.min(8, w - x), 1);
      }
    }
    ctx.fillStyle = PALETTE.y;
    ctx.fillRect(cx - half, top, half * 2, 2);
    ctx.fillRect(cx, top - 22, 1, 8);
    ctx.fillStyle = PALETTE.U;
    ctx.fillRect(cx + 1, top - 22, 5, 3);
  }
}
