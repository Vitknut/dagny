import { moveBody, type Rect, type TileGrid } from '../engine/collision';
import { drawSprite, spriteSize } from '../engine/sprites';
import { disc } from '../engine/draw';
import { PALETTE } from '../data/palettes';
import type { NpcDef } from '../data/types';
import type { ProjectileInit } from './types';

/** A villager standing in a side-view area. */
export class Npc {
  x: number;
  y: number;
  readonly w: number;
  readonly h: number;
  facing: 1 | -1 = -1;
  private t: number;

  constructor(readonly def: NpcDef, px: number, py: number) {
    if (def.still) this.facing = 1;
    const size = spriteSize(def.sprite);
    this.w = size.w;
    this.h = size.h;
    this.x = px - size.w / 2;
    this.y = py - size.h;
    this.t = Math.floor(px * 7) % 100;
  }

  get box(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(playerX: number): void {
    this.t++;
    const cx = this.x + this.w / 2;
    if (!this.def.still && Math.abs(playerX - cx) < 64) this.facing = playerX < cx ? -1 : 1;
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const idle = this.def.idle;
    const step = Math.floor(this.t / (idle.every * 60)) % idle.frames.length;
    drawSprite(ctx, this.def.sprite, idle.frames[step], this.x - camX, this.y - camY, this.facing === -1);
  }
}

export type PickupKind = 'bulle' | 'termos' | 'lingon' | 'key' | 'treasure' | 'cat' | 'quest' | 'container' | 'life';

export class Pickup {
  vy = 0;
  t = 0;
  taken = false;
  /** Dropped pickups fall and blink out after a while; placed ones stay. */
  life: number;
  readonly w: number;
  readonly h: number;

  constructor(
    readonly kind: PickupKind,
    public x: number,
    public y: number,
    readonly sprite: string,
    dropped: boolean,
    /** Persistence id for keys / treasures ("area:x,y"). */
    readonly pid: string | null = null,
  ) {
    this.life = dropped ? 600 : Infinity;
    this.vy = dropped ? -2 : 0;
    this.w = kind === 'treasure' ? 16 : kind === 'cat' ? 14 : kind === 'container' ? 12 : 8;
    this.h = kind === 'termos' ? 12 : kind === 'treasure' ? 10 : kind === 'cat' ? 10 : kind === 'container' ? 12 : 8;
    this.dropped = dropped;
  }

  private readonly dropped: boolean;

  get box(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(grid: TileGrid): void {
    this.t++;
    if (this.dropped) {
      const body = { x: this.x, y: this.y, w: this.w, h: this.h, vx: 0, vy: this.vy, onGround: false };
      body.vy = Math.min(4, body.vy + 0.2);
      moveBody(grid, body);
      this.y = body.y;
      this.vy = body.vy;
      this.life--;
    }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.life < 120 && Math.floor(this.life / 4) % 2 === 0) return;
    const bob = this.dropped || this.kind === 'cat' ? 0 : Math.round(Math.sin(this.t / 15) * 1.5);
    if (this.kind === 'treasure' || this.kind === 'container') {
      // A soft glow behind key treasures.
      ctx.globalAlpha = 0.35 + Math.sin(this.t / 10) * 0.15;
      ctx.fillStyle = PALETTE.Y;
      disc(ctx, this.x + this.w / 2 - camX, this.y + this.h / 2 - camY + bob, 14);
      ctx.globalAlpha = 1;
    }
    const frame = this.kind === 'cat' ? Math.floor(this.t / 30) % 2 : 0;
    drawSprite(ctx, this.sprite, frame, this.x - camX, this.y - camY + bob, this.kind === 'cat');
  }
}

export class Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  sprite: string;
  damage: number;
  fromPlayer: boolean;
  life: number;
  gravity: number;
  ghost: boolean;
  delay: number;
  dead = false;
  t = 0;

  constructor(p: ProjectileInit) {
    this.x = p.x;
    this.y = p.y;
    this.vx = p.vx;
    this.vy = p.vy;
    this.w = p.w;
    this.h = p.h;
    this.sprite = p.sprite;
    this.damage = p.damage;
    this.fromPlayer = p.fromPlayer;
    this.life = p.life;
    this.gravity = p.gravity ?? 0;
    this.ghost = !!p.ghost;
    this.delay = p.delay ?? 0;
  }

  get box(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(grid: TileGrid, solidAt: (x: number, y: number) => boolean): void {
    this.t++;
    if (this.delay > 0) {
      this.delay--;
      return;
    }
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (--this.life <= 0) this.dead = true;
    if (!this.ghost && solidAt(this.x + this.w / 2, this.y + this.h / 2)) this.dead = true;
    if (this.y > grid.h * 16 + 32) this.dead = true;
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const x = Math.round(this.x - camX);
    const y = Math.round(this.y - camY);
    if (this.sprite === 'bolt') {
      if (this.delay > 0) {
        // Warning: a flickering mark where the lightning will strike.
        if (Math.floor(this.delay / 4) % 2 === 0) {
          ctx.fillStyle = PALETTE.Y;
          ctx.fillRect(x - 2, y + this.h - 3, this.w + 4, 2);
          ctx.fillRect(x + this.w / 2 - 1, y + this.h - 8, 2, 4);
        }
        return;
      }
      // Zig-zag bolt from the top of the box to the ground.
      let bx = x + this.w / 2;
      for (let yy = y; yy < y + this.h; yy += 6) {
        const nx = x + this.w / 2 + (((yy * 7 + this.t * 13) % 9) - 4);
        ctx.fillStyle = PALETTE.W;
        ctx.fillRect(Math.min(bx, nx), yy, Math.abs(nx - bx) + 2, 2);
        ctx.fillRect(nx, yy, 2, 6);
        ctx.fillStyle = PALETTE.c;
        ctx.fillRect(nx - 1, yy + 1, 1, 4);
        bx = nx;
      }
      return;
    }
    if (this.delay > 0) {
      // Dirt sprays where a root is about to burst up.
      if (this.sprite === 'root' && Math.floor(this.delay / 3) % 2 === 0) {
        ctx.fillStyle = PALETTE.B;
        ctx.fillRect(x + 1 + (this.delay % 4), y + this.h - 3, 2, 2);
        ctx.fillRect(x + 6 - (this.delay % 3), y + this.h - 5, 2, 2);
      }
      return;
    }
    drawSprite(ctx, this.sprite, Math.floor(this.t / 6) % 2, x, y, this.vx < 0);
  }
}

/** Tiny pooled particle system (no allocation per particle after warm-up). */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  /** Sprite-based particle (e.g. the puff). */
  sprite: string | null;
  frames: number;
  /** Floating text (XP). */
  text: string | null;
}

export class Particles {
  readonly list: Particle[] = [];
  private pool: Particle[] = [];

  spawn(init: Partial<Particle> & { x: number; y: number }): Particle {
    const p = this.pool.pop() ?? ({} as Particle);
    p.x = init.x;
    p.y = init.y;
    p.vx = init.vx ?? 0;
    p.vy = init.vy ?? 0;
    p.life = init.life ?? 30;
    p.max = p.life;
    p.color = init.color ?? PALETTE.W;
    p.size = init.size ?? 1;
    p.gravity = init.gravity ?? 0;
    p.sprite = init.sprite ?? null;
    p.frames = init.frames ?? 1;
    p.text = init.text ?? null;
    this.list.push(p);
    return p;
  }

  update(): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      if (--p.life <= 0) {
        this.list[i] = this.list[this.list.length - 1];
        this.list.pop();
        this.pool.push(p);
      }
    }
  }

  clear(): void {
    while (this.list.length) this.pool.push(this.list.pop() as Particle);
  }
}
