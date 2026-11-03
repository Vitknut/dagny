import { moveBody, rectHitsSolid, type Body, type Rect, type TileGrid } from '../engine/collision';
import { drawSprite } from '../engine/sprites';
import { DAGNY_FRAMES as F } from '../art/dagny';

export interface PlayerControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
  swordPressed: boolean;
}

/** Tuning (pixels per 1/60 s step). */
const WALK = 1.35;
const ACCEL = 0.18;
const FRICTION = 0.3;
const AIR_ACCEL = 0.14;
const GRAV_HOLD = 0.24;
const GRAV = 0.46;
const MAX_FALL = 5;
const JUMP_V = 5.05;
const HIGH_JUMP_V = 6.7;
const JUMP_CUT = 2;
/** Generous touch tolerance. */
const COYOTE = 7;
const BUFFER = 8;
/** A sword press is kept this long, so a press during a swing or a stagger still strikes. */
const SWORD_BUFFER = 10;
/**
 * Every jump rises with the button "held" for at least this long, so a quick
 * tap on glass (60–100 ms) still gives a proper hop of two tiles instead of a
 * skip. Holding goes higher, to three tiles.
 */
const MIN_JUMP = 7;
const ATTACK_FRAMES = 15;
/** Frames into a strike during which Dagny can still turn round (before the blade is far out). */
const TURN_IN_STRIKE = 4;
const ATTACK_ACTIVE: [number, number] = [2, 10];
const INVULN = 60;

export const STAND_H = 22;
export const DUCK_H = 14;
export const PLAYER_W = 10;

export type PlayerState = 'normal' | 'attack' | 'hurt' | 'bird' | 'dead';

export class Player implements Body {
  x = 0;
  y = 0;
  w = PLAYER_W;
  h = STAND_H;
  vx = 0;
  vy = 0;
  onGround = false;
  facing: 1 | -1 = 1;
  state: PlayerState = 'normal';
  ducking = false;
  /** Attack in progress was started while ducking (low strike). */
  lowAttack = false;
  upThrust = false;
  downThrust = false;
  private attackT = 0;
  private hurtT = 0;
  invuln = 0;
  private coyote = 0;
  /** A down-thrust bounce is not cut short by releasing jump. */
  private bouncing = false;
  private buffer = 0;
  private swordBuffer = 0;
  /** Frames since the jump began (for MIN_JUMP). */
  private jumpT = 99;
  private animT = 0;
  private walkFrame = 0;
  private breatheT = 0;
  private blinkT = 0;
  /** Last safe standing position (for hazards / falling). */
  safeX = 0;
  safeY = 0;
  /** Set by spells. */
  highJump = false;
  canDownThrust = false;
  canUpThrust = false;
  /** Bird form timer is handled by the scene; this only changes physics. */
  birdT = 0;
  /** True on the frame the player landed (for dust and sfx). */
  landed = false;
  jumped = false;
  /**
   * Lets moving platforms catch a falling player. Returns true (and snaps the
   * player's y) if the player landed on one this step.
   */
  landOn: ((p: Player, prevBottom: number) => boolean) | null = null;
  onPlatform = false;
  /** Has the current attack already hit something (one hit per swing per target). */
  readonly hitIds = new Set<number>();

  place(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.safeX = x;
    this.safeY = y;
  }

  get attacking(): boolean {
    return this.state === 'attack';
  }

  get swordActive(): boolean {
    if (this.downThrust) return true;
    return this.state === 'attack' && this.attackT >= ATTACK_ACTIVE[0] && this.attackT <= ATTACK_ACTIVE[1];
  }

  /** Sword hitbox in world coordinates (only meaningful while swordActive). */
  swordBox(out: Rect): Rect {
    if (this.downThrust) {
      out.x = this.x + 1;
      out.y = this.y + this.h - 2;
      out.w = this.w - 2;
      out.h = 14;
    } else if (this.upThrust) {
      out.x = this.x + 1;
      out.y = this.y - 14;
      out.w = this.w - 2;
      out.h = 16;
    } else {
      const reach = 17;
      out.w = reach;
      out.h = 7;
      out.x = this.facing === 1 ? this.x + this.w - 2 : this.x - reach + 2;
      out.y = this.lowAttack ? this.y + this.h - 10 : this.y + 7;
    }
    return out;
  }

  /** Height the shield currently guards: 'high' standing, 'low' ducking. */
  get shieldHeight(): 'high' | 'low' {
    return this.ducking ? 'low' : 'high';
  }

  hurt(fromX: number): void {
    if (this.invuln > 0 || this.state === 'dead') return;
    this.state = 'hurt';
    this.hurtT = 14;
    this.invuln = INVULN;
    this.downThrust = false;
    // A short knock back, about one tile (as in Zelda II), not a flight.
    const dir = this.x + this.w / 2 < fromX ? -1 : 1;
    this.vx = dir * 1.6;
    this.vy = -2;
    this.setDuck(false, null);
  }

  /** Bounce after a successful down-thrust. */
  bounce(): void {
    this.bouncing = true;
    this.vy = -4.4;
    this.onGround = false;
  }

  private setDuck(on: boolean, grid: TileGrid | null): void {
    if (on === this.ducking) return;
    if (on) {
      this.y += STAND_H - DUCK_H;
      this.h = DUCK_H;
      this.ducking = true;
    } else {
      // Only stand up if there is room.
      const test = { x: this.x, y: this.y - (STAND_H - DUCK_H), w: this.w, h: STAND_H };
      if (grid && rectHitsSolid(grid, test)) return;
      this.y -= STAND_H - DUCK_H;
      this.h = STAND_H;
      this.ducking = false;
    }
  }

  enterBird(): void {
    this.setDuck(false, null);
    this.state = 'bird';
    // Keep the feet where they are; the bird is small.
    this.y += this.h - 6;
    this.w = 8;
    this.h = 6;
    this.vx = 0;
    this.vy = 0;
  }

  /** Try to return to human form; fails if there is no room. */
  leaveBird(grid: TileGrid): boolean {
    const test = { x: this.x - 1, y: this.y + this.h - STAND_H, w: PLAYER_W, h: STAND_H };
    if (rectHitsSolid(grid, test)) return false;
    this.x = test.x;
    this.y = test.y;
    this.w = PLAYER_W;
    this.h = STAND_H;
    this.state = 'normal';
    return true;
  }

  /**
   * Remember fresh jump and sword presses (the buffers count down each step).
   * Also called while the game is frozen for a hit, so no press is lost.
   */
  queue(c: PlayerControls): void {
    if (c.jumpPressed) this.buffer = BUFFER;
    else if (this.buffer > 0) this.buffer--;
    if (c.swordPressed) this.swordBuffer = SWORD_BUFFER;
    else if (this.swordBuffer > 0) this.swordBuffer--;
  }

  update(c: PlayerControls, grid: TileGrid): void {
    this.landed = false;
    this.jumped = false;
    if (this.invuln > 0) this.invuln--;
    this.animT++;
    if (this.state === 'dead') {
      this.vx *= 0.9;
      this.vy = Math.min(MAX_FALL, this.vy + GRAV);
      moveBody(grid, this);
      return;
    }
    if (this.state === 'bird') {
      this.updateBird(c, grid);
      return;
    }

    // Buffers for forgiving touch play.
    this.queue(c);
    if (this.onGround) this.coyote = COYOTE;
    else if (this.coyote > 0) this.coyote--;

    let move = 0;
    if (this.state === 'hurt') {
      if (--this.hurtT <= 0) this.state = 'normal';
    } else {
      move = (c.right ? 1 : 0) - (c.left ? 1 : 0);
    }

    // Ducking (only on the ground, not mid-attack).
    if (this.state === 'normal') this.setDuck(c.down && this.onGround, grid);
    else if (!this.onGround && this.ducking) this.setDuck(false, grid);

    // Down-thrust: hold down in the air.
    this.downThrust = this.canDownThrust && !this.onGround && c.down && this.state !== 'hurt' && this.vy > -1.5;

    // Attack.
    if (this.swordBuffer > 0 && this.state === 'normal') {
      this.swordBuffer = 0;
      this.state = 'attack';
      this.attackT = 0;
      this.lowAttack = this.ducking;
      this.upThrust = this.canUpThrust && c.up && !this.ducking;
      this.hitIds.clear();
    }
    if (this.state === 'attack') {
      this.attackT++;
      if (this.attackT >= ATTACK_FRAMES) {
        this.state = 'normal';
        this.upThrust = false;
      }
    }
    if (this.downThrust && this.animT % 12 === 0) this.hitIds.clear();

    // Facing (not while striking – except in the wind-up: a strike started a
    // moment before the thumb reaches the other way still turns to meet it).
    if (move !== 0 && this.state === 'normal') this.facing = move > 0 ? 1 : -1;
    else if (move !== 0 && this.state === 'attack' && this.attackT < TURN_IN_STRIKE && (move > 0 ? 1 : -1) !== this.facing) {
      this.facing = move > 0 ? 1 : -1;
      this.hitIds.clear();
    }

    // Horizontal movement.
    const canWalk = this.state !== 'hurt' && !(this.ducking && this.onGround) && !(this.state === 'attack' && this.onGround);
    if (canWalk && move !== 0) {
      const a = this.onGround ? ACCEL : AIR_ACCEL;
      this.vx += move * a;
      if (Math.abs(this.vx) > WALK) this.vx = Math.sign(this.vx) * WALK;
    } else if (this.state !== 'hurt') {
      const f = this.onGround ? FRICTION : 0.04;
      if (Math.abs(this.vx) <= f) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * f;
    } else this.vx *= 0.94;

    // Jump (coyote time + jump buffer).
    if (this.buffer > 0 && this.coyote > 0 && this.state !== 'hurt') {
      this.setDuck(false, grid);
      if (!this.ducking) {
        this.vy = -(this.highJump ? HIGH_JUMP_V : JUMP_V);
        this.onGround = false;
        this.coyote = 0;
        this.buffer = 0;
        this.jumped = true;
        this.jumpT = 0;
      }
    }

    // Variable jump height: lighter gravity while rising with the button held,
    // and releasing early cuts the jump short.
    if (this.vy >= 0) this.bouncing = false;
    const held = c.jumpHeld || this.jumpT < MIN_JUMP;
    this.jumpT++;
    if (!held && this.vy < -JUMP_CUT && this.state !== 'hurt' && !this.bouncing) this.vy = -JUMP_CUT;
    const g = this.vy < 0 && held ? GRAV_HOLD : GRAV;
    this.vy = Math.min(MAX_FALL, this.vy + g);

    const wasGround = this.onGround;
    const prevBottom = this.y + this.h;
    const res = moveBody(grid, this, false);
    this.onPlatform = false;
    if (!this.onGround && this.vy >= 0 && this.landOn?.(this, prevBottom)) {
      this.onGround = true;
      this.onPlatform = true;
      this.vy = 0;
    }
    if (res.landed || (!wasGround && this.onGround)) this.landed = true;

    if (this.onGround && !this.onPlatform && this.state !== 'hurt') {
      this.safeX = this.x;
      this.safeY = this.y + this.h - STAND_H;
    }

    // Walk animation.
    if (this.onGround && Math.abs(this.vx) > 0.2) {
      if (this.animT % 8 === 0) this.walkFrame = (this.walkFrame + 1) % 4;
    } else {
      this.walkFrame = 0;
    }
    this.breatheT++;
    this.blinkT = (this.blinkT + 1) % 240;
  }

  private updateBird(c: PlayerControls, grid: TileGrid): void {
    const sp = 1.3;
    const mx = (c.right ? 1 : 0) - (c.left ? 1 : 0);
    const my = (c.down ? 1 : 0) - (c.up || c.jumpHeld ? 1 : 0);
    if (mx !== 0) this.facing = mx > 0 ? 1 : -1;
    this.vx += (mx * sp - this.vx) * 0.2;
    this.vy += (my * sp + 0.15 - this.vy) * 0.2;
    moveBody(grid, this);
    // The sky above a room is not a way round its walls and locked doors.
    if (this.y < 0) {
      this.y = 0;
      if (this.vy < 0) this.vy = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number, frame: number): void {
    if (this.invuln > 0 && this.state !== 'dead' && Math.floor(this.invuln / 3) % 2 === 0) return;
    const flip = this.facing === -1;
    if (this.state === 'bird') {
      drawSprite(ctx, 'bird', Math.floor(frame / 6) % 2, this.x - 1 - camX, this.y - 2 - camY, flip);
      return;
    }
    let f: number = F.idle;
    const ducking = this.ducking;
    if (this.state === 'dead') f = F.hurt;
    else if (this.state === 'hurt') f = F.hurt;
    else if (this.downThrust) f = F.downStab;
    else if (this.state === 'attack') f = this.upThrust ? F.up : this.lowAttack ? F.duckAttack : F.attack;
    else if (ducking) f = F.duck;
    else if (!this.onGround) f = F.jump;
    else if (Math.abs(this.vx) > 0.2) f = [F.walk0, F.walk1, F.walk2, F.walk1][this.walkFrame];
    else if (this.blinkT > 230) f = F.blink;
    else f = Math.floor(this.breatheT / 40) % 2 === 0 ? F.idle : F.breathe;

    // The sprite is always 24 tall; ducking frames are drawn from the same top.
    const sx = Math.round(this.x - 3 - camX);
    const sy = Math.round(this.y + this.h - 24 - camY);

    // Shield behind when facing away? Dagny carries it on the front arm.
    const showShield = this.state !== 'attack' && this.state !== 'dead' && !this.downThrust;
    drawSprite(ctx, 'dagny', f, sx, sy, flip);
    if (showShield) {
      const shY = ducking ? sy + 15 : sy + 10;
      const shX = flip ? sx - 1 : sx + 11;
      drawSprite(ctx, 'shield', 0, shX, shY, flip);
    }
    if (this.state === 'attack' && !this.upThrust) {
      const t = this.attackT;
      const ext = t < 2 ? -6 : t > 11 ? -4 : 0;
      const y = this.lowAttack ? sy + 15 : sy + 8;
      const x = flip ? sx - 14 - ext : sx + 15 + ext;
      drawSprite(ctx, 'sword', 0, x, y, flip);
    } else if (this.state === 'attack' && this.upThrust) {
      drawSprite(ctx, 'swordUp', 0, sx + (flip ? 1 : 10), sy - 12, false);
    } else if (this.downThrust) {
      drawSprite(ctx, 'swordDown', 0, sx + 6, sy + 18, false);
    }
  }
}
