import { moveBody, type Body, type Rect } from '../engine/collision';
import { drawSprite } from '../engine/sprites';
import type { BossDef, EnemyDef } from '../data/types';
import { BEHAVIORS, type Sense } from './behaviors';
import type { WorldApi } from './types';

let nextId = 1;

export type HitHeight = 'high' | 'low' | 'down' | 'up' | 'magic';
export type HitResult = 'hit' | 'blocked' | 'dead' | 'none';

/** Shared between all creatures – refilled before each one thinks (no garbage per step). */
const sense: Sense = { p: { x: 0, y: 0 }, cx: 0, cy: 0, dx: 0, dist: 0, sp: 0 };

/**
 * A väsen: health, hits, physics and drawing. How it moves and fights is
 * its behaviour (EnemyDef.behavior → a module in behaviors/), so new
 * creatures can be added purely in data/enemies.ts by reusing behaviours.
 */
export class Enemy implements Body {
  readonly id = nextId++;
  x: number;
  y: number;
  w: number;
  h: number;
  vx = 0;
  vy = 0;
  onGround = false;
  hp: number;
  maxHp: number;
  facing: 1 | -1 = -1;
  dead = false;
  /** Flash timer after being hit. */
  flash = 0;
  /** Invulnerable frames after a hit. */
  iframes = 0;
  t = 0;
  // --- Behaviour state: read and written by the modules in behaviors/ -----
  /** Countdown to the next move. */
  timer = 0;
  /** What the creature is doing now (meaning depends on the behaviour). */
  mode = 0;
  /** Where it started (hover height, floating base line). */
  baseY: number;
  /** Nisse guard height. */
  guard: 'high' | 'low' = 'high';
  guardDelay = 0;
  /** Next shot / cut goes high (true) or low. */
  shotHigh = true;
  /** Boss: active once the fight started. */
  awake = false;
  phase = 0;
  stun = 0;
  /** Opacity (Gruvrået fades in and out). */
  alpha = 1;
  /** Cannot be hit or hurt anyone (e.g. while faded out). */
  untouchable = false;
  /** Where a boss stands when the fight begins. */
  homeY = 0;
  /** A bird about to dive (drawn with a warning mark). */
  warn = false;
  /** Centre of a waltz, and how far round it has turned. */
  cx = 0;
  ang = 0;
  /** Boss attack cycle counter. */
  cycle = 0;
  /** Bäckahästen's pool (pixel x range). */
  pool: [number, number] | null = null;
  sprite: string;
  frame = 0;
  /** Extra damage per blow (tougher creatures in the last temple). */
  bonusDamage = 0;
  readonly boss: BossDef | null;

  constructor(readonly def: EnemyDef, px: number, py: number) {
    this.boss = 'phases' in def ? (def as BossDef) : null;
    this.w = def.box.w;
    this.h = def.box.h;
    // px/py is the tile's bottom-centre; stand on it.
    this.x = px - this.w / 2;
    this.y = py - this.h;
    this.baseY = this.y;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.sprite = def.sprite;
    this.timer = 30 + ((this.id * 37) % 60);
  }

  get flying(): boolean {
    return !!this.def.flying || (this.boss !== null && this.phase === 1);
  }

  get damage(): number {
    return this.def.damage + this.bonusDamage;
  }

  /** Makes this creature tougher (the last temple). */
  harden(): void {
    this.hp = this.maxHp = Math.ceil(this.def.hp * 1.5);
    this.bonusDamage = 1;
  }


  /** Whether touching the player hurts right now. */
  get harmful(): boolean {
    if (this.dead) return false;
    if (this.boss && !this.awake) return false;
    return !this.untouchable;
  }

  takeHit(dmg: number, fromX: number, height: HitHeight, world: WorldApi): HitResult {
    if (this.dead || this.iframes > 0) return 'none';
    if (this.boss && !this.awake) return 'none';
    if (this.untouchable) return 'none';
    // Skogsrået: lovely from the front – only her hollow back can be hurt.
    if (this.def.backOnly && height !== 'magic') {
      const fromRight = fromX > this.x + this.w / 2;
      if (fromRight === (this.facing === 1)) {
        world.sparks(this.x + (fromRight ? this.w : 0), this.y + 10);
        world.sfx('block');
        this.iframes = 8;
        return 'blocked';
      }
    }
    // Creatures that guard (nisse warriors, Skuggan) parry at their guard height.
    const parry = BEHAVIORS[this.def.behavior].blocks?.(this, height);
    if (parry) {
      world.sparks(this.x + (fromX < this.x ? 0 : this.w), this.guard === 'high' ? this.y + 8 : this.y + 18);
      world.sfx('block');
      this.vx = fromX < this.x + this.w / 2 ? parry.push : -parry.push;
      this.iframes = parry.iframes;
      return 'blocked';
    }
    let d = dmg;
    if (this.boss && this.stun > 0) d = Math.ceil(d * 1.5);
    this.hp -= d;
    this.flash = 10;
    this.iframes = this.boss ? 24 : 12;
    if (!this.def.heavy) {
      this.vx = fromX < this.x + this.w / 2 ? 2 : -2;
      if (!this.flying) this.vy = -1.5;
    }
    if (this.hp <= 0) {
      this.dead = true;
      return 'dead';
    }
    world.sfx('hit');
    return 'hit';
  }

  box(out: Rect): Rect {
    out.x = this.x;
    out.y = this.y;
    out.w = this.w;
    out.h = this.h;
    return out;
  }

  update(world: WorldApi): void {
    if (this.dead) return;
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.iframes > 0) this.iframes--;
    const p = world.playerCenter();
    sense.p = p;
    sense.cx = this.x + this.w / 2;
    sense.cy = this.y + this.h / 2;
    sense.dx = p.x - sense.cx;
    sense.dist = Math.abs(sense.dx);
    sense.sp = this.def.speed;
    BEHAVIORS[this.def.behavior].update(this, world, sense);
  }

  /** Gravity and collision (flying creatures just move). */
  fall(world: WorldApi): void {
    if (this.flying) {
      this.x += this.vx;
      this.y += this.vy;
      return;
    }
    this.vy = Math.min(5, this.vy + 0.35);
    const res = moveBody(world.grid, this);
    if (res.hitWall && this.def.behavior === 'walker') this.facing = this.facing === 1 ? -1 : 1;
  }
  /** True while a bird is diving (the shield can turn it away). */
  get diving(): boolean {
    return this.def.behavior === 'diver' && this.mode === 1;
  }

  /** The shield caught a diving bird: it tumbles back, dazed. */
  parry(fromX: number): void {
    this.mode = 4;
    this.stun = 70;
    this.vx = 0;
    this.vy = 0;
    this.x += this.x + this.w / 2 < fromX ? -6 : 6;
  }

  /** Keeps the creature inside the room. */
  clampX(world: WorldApi): void {
    const maxX = world.grid.w * 16 - 16 - this.w;
    if (this.x < 16) {
      this.x = 16;
      this.vx = Math.abs(this.vx);
    }
    if (this.x > maxX) {
      this.x = maxX;
      this.vx = -Math.abs(this.vx);
    }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.dead) return;
    const flip = this.facing === -1;
    const sx = this.x - this.def.box.x - camX;
    const sy = this.y - this.def.box.y - camY;
    if (this.flash > 0 && Math.floor(this.flash / 2) % 2 === 0) {
      ctx.globalAlpha = 0.5 * this.alpha;
      drawSprite(ctx, this.sprite, this.frame, sx, sy, flip);
      ctx.globalAlpha = 1;
      return;
    }
    const ghostly = this.boss && this.phase === 1 && this.def.behavior === 'boss_grim';
    ctx.globalAlpha = this.alpha * (ghostly ? 0.85 : 1);
    if (ctx.globalAlpha <= 0.01) {
      ctx.globalAlpha = 1;
      return;
    }
    drawSprite(ctx, this.sprite, this.frame, sx, sy, flip);
    if (this.def.behavior === 'shadow' && (this.frame === 7 || this.frame === 8 || this.frame === 9)) {
      // Her blade: held out in a lunge, raised over the head while winding up.
      if (this.frame === 9) drawSprite(ctx, 'skuggsvardUp', 0, sx + (flip ? 3 : 8), sy - 9, false);
      else drawSprite(ctx, 'skuggsvard', 0, flip ? sx - 11 : sx + 13, sy + (this.frame === 8 ? 17 : 11), flip);
    }
    ctx.globalAlpha = 1;
    if (this.warn && Math.floor(this.t / 4) % 2 === 0) {
      // "!" over a bird about to dive.
      ctx.fillStyle = '#f0d27a';
      const wx = Math.round(sx + this.def.box.x + this.w / 2 - 1);
      const wy = Math.round(sy + this.def.box.y - 9);
      ctx.fillRect(wx, wy, 2, 5);
      ctx.fillRect(wx, wy + 6, 2, 2);
    }
    if (this.stun > 0 && Math.floor(this.t / 6) % 2 === 0) {
      drawSprite(ctx, 'spark', 0, sx + this.def.box.x + this.w / 2 - 4, sy + this.def.box.y - 8, false);
    }
  }
}

