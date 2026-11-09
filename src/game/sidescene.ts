import { Kind, firmlySupported, overlaps, touchesKind, isSolidAt, rectHitsSolid, pushX, TILE, type Rect, type TileGrid } from '../engine/collision';
import { Act } from '../engine/input';
import { VIEW_W, VIEW_H } from '../engine/screen';
import { AREAS } from '../data/areas';
import { ENEMIES } from '../data/enemies';
import { kindOf } from '../data/legend';
import { NPCS } from '../data/npcs';
import { PALETTE } from '../data/palettes';
import { STR } from '../data/strings';
import { VILLAGES, templeById } from '../data/temples';
import { SONGS } from '../audio/songs';
import type { AreaDef, Exit, PuffKind } from '../data/types';
import { Player, STAND_H, type PlayerControls } from '../entities/player';
import { Enemy } from '../entities/enemy';
import { Npc, Particles, Pickup, Projectile } from '../entities/misc';
import { MovingPlatform } from '../entities/platform';
import type { ProjectileInit, WorldApi } from '../entities/types';
import { DialogOverlay } from './dialog';
import type { Game, Scene } from './game';
import { canLevelUp } from './progression';
import { hasFlag, hasItem, setFlag, type GameState } from './state';
import * as flow from './flow';
import { beatIndex, squareActive } from './beat';
import { LevelUpOverlay, GameOverOverlay } from './menus';

import { updateCritters, type Critter } from './side/critters';
import { compact, nearestFreeSpot, tmpA, type Checkpoint, type Marker, type SpellTimers } from './side/shared';

export { nearestFreeSpot } from './side/shared';
import { build, refreshRoom, spawnAfterBoss, spawnTreasure, renderStatic, renderFront } from './side/room';
import { shieldBlocks, damagePlayer, combat, killEnemy } from './side/combat';
import { collect } from './side/pickups';
import { renderScene } from './side/render';
import { tickSpells, castSpell, blowLur, updateHelpers, shootFire } from './side/spells';
/** Steps after a dialog closes before Up or a tap can start another (half a second). */
const INTERACT_PAUSE = 30;
/** Steps before the same person or sign starts again while Dagny stays put (three seconds). */
const SAME_TALK_PAUSE = 180;

export interface Spawn {
  entry?: string;
  /** Dialog shown right after arriving. */
  dialog?: string;
  x?: number;
  y?: number;
  facing?: 1 | -1;
}

/**
 * Side view: villages, paths, encounters and temples.
 *
 * The scene owns the room's state and runs the step (movement, exits,
 * bosses, the sealed room). The work itself is split into systems under
 * side/: room.ts builds the room, combat.ts, pickups.ts and spells.ts do
 * their parts of the step, and render.ts draws. Those modules read and
 * write the public fields below; private ones belong to the scene alone.
 */
export class SideScene implements Scene, WorldApi {
  readonly area: AreaDef;
  readonly grid: TileGrid;
  tileSprite: (string | null)[] = [];
  anim: Array<{ x: number; y: number; sprite: string; offset: number }> = [];
  staticLayer: HTMLCanvasElement;
  entries = new Map<string, Marker>();
  doors: Array<Marker & { exit: Exit; ch: string }> = [];
  signs: Array<Marker & { dialog: string }> = [];
  /** Glints where a lamp reveals a secret. */
  lampGlints: Array<{ x: number; y: number }> = [];
  /** Small harmless animals: birds, hens, a squirrel, a hare, ducks (side/critters.ts). */
  critters: Critter[] = [];
  checkpoints: Checkpoint[] = [];
  altar: Marker | null = null;
  readonly player = new Player();
  enemies: Enemy[] = [];
  npcs: Npc[] = [];
  pickups: Pickup[] = [];
  projectiles: Projectile[] = [];
  platforms: MovingPlatform[] = [];
  frontLayer: HTMLCanvasElement | null = null;
  /** Näverluren: a befriended vätte that fights alongside Dagny. */
  helpers: Array<{ x: number; y: number; vx: number; vy: number; onGround: boolean; w: number; h: number; life: number; cd: number; facing: 1 | -1 }> = [];
  lurCooldown = 0;
  beatCells: Array<{ i: number; tx: number; ty: number; group: '%' | '&' }> = [];
  lastBeat = -1;

  /** The dance floor's light strings are lit (always, unless the room waits for Åska). */
  beatAwake(): boolean {
    const w = this.area.beat?.wake;
    return !w || hasFlag(this.s, w);
  }
  private riding: MovingPlatform | null = null;
  /** A boss gust pushing Dagny: dx per step and steps left. */
  private gustDx = 0;
  private gustT = 0;
  particles = new Particles();
  ambient = new Particles();
  camX = 0;
  camY = 0;
  shakeT = 0;
  shakeS = 0;
  frame = 0;
  boss: Enemy | null = null;
  bossOutro = 0;
  /** Steps after a hazard respawn during which hazards don't hurt again. */
  private hazardGrace = 0;
  /** The frame Dagny arrived in this room, and whether Up has been let go since. */
  private arrivedAt = -1000;
  private upArmed = true;
  /** The last thing Dagny talked to or read, where she stood and when. */
  private lastTalk: { key: string; x: number; at: number } | null = null;
  /** Sealed room: 0 not sealed / cleared, 1 waiting for Dagny, 2 shut until the room is cleared, 3 a meeting with the way back shut. */
  seal = 0;
  nameT = 0;
  flashT = 0;
  private lockMsgT = 0;
  deadT = 0;
  spell: SpellTimers = { skydd: 0, hopp: 0, lyse: 0, eld: 0, hamn: 0 };
  dark: HTMLCanvasElement | null = null;
  private exiting = false;
  prompt: { x: number; y: number } | null = null;

  constructor(readonly game: Game, areaId: string, private readonly spawn: Spawn) {
    const area = AREAS[areaId];
    if (!area) throw new Error(`Okänt område: ${areaId}`);
    this.area = area;
    const h = area.tiles.length;
    const w = area.tiles[0].length;
    this.grid = {
      w,
      h,
      kinds: new Uint8Array(w * h),
      wallLeft: !area.left,
      wallRight: !area.right,
    };
    build(this);
    this.staticLayer = renderStatic(this);
    this.frontLayer = renderFront(this);
    this.placePlayer();
    const px = this.player.x;
    this.platforms = (area.platforms ?? []).flatMap((d) => MovingPlatform.create(d, px));
    this.player.landOn = (pl, prevBottom) => this.landOnPlatform(pl, prevBottom);
    if (area.dark) {
      this.dark = document.createElement('canvas');
      this.dark.width = VIEW_W;
      this.dark.height = VIEW_H;
    }
  }

  get s(): GameState {
    return this.game.state as GameState;
  }

  pid(tx: number, ty: number): string {
    return `${this.area.id}:${tx},${ty}`;
  }

  // --- Building the area from data ----------------------------------------------------








  private placePlayer(): void {
    const sp = this.spawn;
    const p = this.player;
    if (sp.x !== undefined && sp.y !== undefined) {
      p.place(sp.x, sp.y);
      // A saved spot can end up inside rock when a map changes: step out of it.
      const free = nearestFreeSpot(this.grid, p.x, p.y, p.w, p.h);
      if (free) p.place(free.x, free.y);
    } else {
      const m = (sp.entry && this.entries.get(sp.entry)) || this.entries.get('@') || this.entries.get('A') || this.entries.get('W') || { tx: 2, ty: this.grid.h - 3 };
      p.place(m.tx * TILE + TILE / 2 - p.w / 2, (m.ty + 1) * TILE - STAND_H);
    }
    if (sp.facing) p.facing = sp.facing;
    else if (sp.entry === 'E') p.facing = -1;
    this.applySkills();
    this.snapCamera();
  }

  private applySkills(): void {
    const s = this.s;
    this.player.canDownThrust = s.skills.includes('nedatstot');
    this.player.canUpThrust = s.skills.includes('uppatstot');
  }

  // --- Scene interface ------------------------------------------------------------------

  music(): string | null {
    if (this.boss && this.boss.awake && !this.boss.dead) {
      return templeById(this.area.temple ?? '')?.bossMusic ?? 'boss';
    }
    if (this.seal === 2 && this.area.sealed?.music) return this.area.sealed.music;
    // A village whose place has woken plays its tune brighter.
    const village = VILLAGES.find((v) => v.area === this.area.id);
    if (village?.place && this.area.music && hasFlag(this.s, `${village.place}_klar`) && SONGS[`${this.area.music}_ljus`]) return `${this.area.music}_ljus`;
    return this.area.music;
  }

  enter(): void {
    const a = this.area;
    // Stepping out of a door must not lead straight back in: Up is not heard
    // until it has been let go after arriving, and not for a moment at all.
    this.arrivedAt = this.game.frame;
    this.upArmed = false;
    if (a.showName) this.nameT = 150;
    if (a.kind === 'village') this.s.lastVillage = a.id;
    // Autosave on every area change (encounters save the overworld spot instead).
    this.game.save();
    if (this.spawn.dialog) this.game.pushOverlay(new DialogOverlay(this.game, this.spawn.dialog));
    if (a.onEnter && !hasFlag(this.s, a.onEnter.unlessFlag)) {
      setFlag(this.s, a.onEnter.setFlag);
      this.game.pushOverlay(new DialogOverlay(this.game, a.onEnter.dialog));
    }
  }

  capture(state: GameState): void {
    if (this.player.state === 'dead') return;
    if (this.area.kind === 'encounter') {
      state.loc = { area: 'overworld', x: state.ow.x, y: state.ow.y };
      return;
    }
    const p = this.player;
    // Store a standing position even if Dagny is ducking or a bird.
    const y = p.y + p.h - STAND_H;
    const solid = p.onGround && !p.onPlatform;
    state.loc = { area: this.area.id, x: Math.round(solid ? p.x : p.safeX), y: Math.round(solid ? y : p.safeY) };
  }

  render(ctx: CanvasRenderingContext2D): void {
    renderScene(this, ctx);
  }

  // --- WorldApi ---------------------------------------------------------------------------

  /** Reused every call (read at once by AI, never kept). */
  private readonly center = { x: 0, y: 0 };

  lit(): boolean {
    return this.spell.lyse > 0;
  }

  playerCenter(): { x: number; y: number } {
    const p = this.player;
    this.center.x = p.x + p.w / 2;
    this.center.y = p.y + p.h / 2;
    return this.center;
  }

  playerBox(): Rect {
    const p = this.player;
    return { x: p.x, y: p.y, w: p.w, h: p.h };
  }

  playerDucking(): boolean {
    return this.player.ducking;
  }

  spawnProjectile(p: ProjectileInit): void {
    this.projectiles.push(new Projectile(p));
  }

  puff(x: number, y: number, kind: PuffKind): void {
    if (kind !== 'dust') this.particles.spawn({ x: x - 8, y: y - 8, sprite: 'puff', frames: 3, life: 27 });
    const colors = kind === 'moss' ? ['M', 'l', 'e'] : kind === 'leaf' ? ['o', 'y', 'R'] : kind === 'dust' ? ['K', 'g', 'w'] : ['W', 'C', 'w'];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      this.particles.spawn({
        x, y,
        vx: Math.cos(a) * (0.6 + Math.random()),
        vy: Math.sin(a) * (0.6 + Math.random()) - 0.6,
        gravity: kind === 'mist' ? -0.01 : 0.05,
        life: 30 + Math.floor(Math.random() * 20),
        color: PALETTE[colors[i % 3]],
        size: kind === 'leaf' ? 2 : 1,
      });
    }
  }

  sparks(x: number, y: number): void {
    this.particles.spawn({ x: x - 4, y: y - 4, sprite: 'spark', frames: 2, life: 10 });
  }

  sfx(id: string): void {
    this.game.audio.play(id);
  }

  gust(dx: number, frames: number): void {
    this.gustDx = dx;
    this.gustT = frames;
    this.sfx('wind');
    this.sfx('wind');
  }

  spawnEnemy(id: string, px: number, py: number): boolean {
    const def = ENEMIES[id];
    if (!def || this.minions() >= 2) return false;
    const e = new Enemy(def, px, py);
    e.facing = px < this.player.x ? 1 : -1;
    this.enemies.push(e);
    this.puff(px, py - 8, 'mist');
    return true;
  }

  diveBusy(self: unknown): boolean {
    return this.enemies.some((e) => e !== self && !e.dead && e.def.behavior === 'diver' && (e.mode === 1 || e.mode === 3));
  }

  minions(): number {
    return this.enemies.filter((e) => !e.dead && e !== this.boss).length;
  }

  /** Current push of a wind zone at this step, or null when calm. */
  private windAt(z: import('../data/types').WindZone): { dx: number; up: number } | null {
    const cycle = z.on + z.off;
    const t = (this.frame + (z.offset ?? 0)) % cycle;
    if (t >= z.on) return null;
    if (z.dir === 'up') return { dx: 0, up: z.force };
    let dir = z.dir === 'left' ? -1 : 1;
    if (z.dir === 'alternate') dir = Math.floor((this.frame + (z.offset ?? 0)) / cycle) % 2 === 0 ? 1 : -1;
    // Ease the gust in and out.
    const ease = Math.min(1, t / 20, (z.on - t) / 20);
    return { dx: dir * z.force * ease, up: 0 };
  }

  private applyWind(): void {
    const p = this.player;
    if (p.state === 'dead') return;
    let dx = 0;
    for (const z of this.area.wind ?? []) {
      const tx = (p.x + p.w / 2) / TILE;
      const ty = (p.y + p.h / 2) / TILE;
      if (tx < z.x0 || tx >= z.x1 + 1 || ty < z.y0 || ty >= z.y1 + 1) continue;
      const w = this.windAt(z);
      if (!w) continue;
      dx += w.dx;
      if (w.up > 0) {
        p.vy = Math.max(-2.6, p.vy - w.up);
        p.onGround = false;
      }
    }
    if (this.gustT > 0) {
      this.gustT--;
      dx += this.gustDx;
    }
    if (dx !== 0) pushX(this.grid, p, p.onGround ? dx * 0.6 : dx);
  }

  /** The front of a cave-in chasing Dagny (px), while it lasts (AreaDef.cavein). */
  caveX: number | null = null;

  /** Frames left of the freeze after a hit (see combat). */
  hitStop = 0;

  shake(frames: number, strength = 2): void {
    this.shakeT = Math.max(this.shakeT, frames);
    this.shakeS = strength;
  }

  // --- Update -------------------------------------------------------------------------------

  private controls(): PlayerControls {
    const i = this.game.input;
    return {
      left: i.held(Act.Left),
      right: i.held(Act.Right),
      up: i.held(Act.Up),
      down: i.held(Act.Down) || i.held(Act.LowSword),
      jumpHeld: i.held(Act.Jump),
      jumpPressed: i.pressed(Act.Jump),
      swordPressed: i.pressed(Act.Sword) || i.pressed(Act.LowSword),
    };
  }

  update(): void {
    // Hit-stop: the world holds still for a few frames when a blow lands.
    if (this.hitStop > 0) {
      this.hitStop--;
      this.player.queue(this.controls());
      return;
    }
    this.frame++;
    const g = this.game;
    const s = this.s;
    const p = this.player;
    if (this.nameT > 0) this.nameT--;
    if (this.flashT > 0) this.flashT--;
    if (this.lockMsgT > 0) this.lockMsgT--;
    if (this.shakeT > 0) this.shakeT--;

    // --- Death ---
    if (p.state === 'dead') {
      p.update(this.controls(), this.grid);
      if (++this.deadT === 100) {
        // A retry starts at the door she came in by (a saved spot counts as the room's default door).
        const room = { area: this.area.id, entry: this.spawn.x === undefined ? (this.spawn.entry ?? null) : null };
        g.pushOverlay(new GameOverOverlay(g, this.area.temple ?? null, room));
      }
      this.particles.update();
      return;
    }

    // --- Dance floor ---
    if (this.area.beat && this.beatCells.length) {
      const period = this.area.beat.period;
      const bi = beatIndex(this.frame, period);
      if (bi !== this.lastBeat) {
        this.lastBeat = bi;
        for (const c of this.beatCells) {
          this.grid.kinds[c.i] = this.beatAwake() && squareActive(c.group, this.frame, period) ? Kind.OneWay : Kind.Empty;
        }
        if (this.frame > 1) this.sfx('step');
      }
    }

    // --- Spells ---
    tickSpells(this);
    if (this.lurCooldown > 0) this.lurCooldown--;
    if (g.input.pressed(Act.Magic)) {
      if (g.input.held(Act.Down) && hasItem(s, 'naverlur')) blowLur(this);
      else castSpell(this);
    }
    updateHelpers(this);

    // --- Player ---
    const c = this.controls();
    p.highJump = this.spell.hopp > 0;
    const wasGround = p.onGround;
    // Platforms move first and carry whoever stands on them.
    const rider = this.riding;
    const waiting = p.onGround && !rider ? p.x + p.w / 2 : null;
    for (const pl of this.platforms) pl.update(pl === rider && p.onGround, waiting);
    if (rider && p.onGround) {
      const ox = p.x;
      p.x += rider.dx;
      if (rectHitsSolid(this.grid, p)) p.x = ox;
      p.y += rider.dy;
    }
    this.riding = null;
    const safeX = p.safeX;
    const safeY = p.safeY;
    p.update(c, this.grid);
    // Respawn points must be firm ground: not the very edge of a ledge, not a
    // dance square that comes and goes, not the floor of a nettle or spike pit.
    if (
      p.onGround &&
      ((this.beatCells.length && this.onBeatSquare()) || touchesKind(this.grid, p, Kind.Hazard) || !firmlySupported(this.grid, p))
    ) {
      p.safeX = safeX;
      p.safeY = safeY;
    }
    this.applyWind();
    if (p.jumped) this.sfx('jump');
    if (p.landed && !wasGround) {
      this.sfx('land');
      this.particles.spawn({ x: p.x + 2, y: p.y + p.h - 1, vx: -0.4, vy: -0.2, life: 12, color: PALETTE.w });
      this.particles.spawn({ x: p.x + p.w - 2, y: p.y + p.h - 1, vx: 0.4, vy: -0.2, life: 12, color: PALETTE.w });
    }
    if (c.swordPressed && p.state === 'attack') {
      this.sfx('sword');
      if (this.spell.eld > 0 && !p.lowAttack) shootFire(this);
    }

    if (this.hazardGrace > 0) this.hazardGrace--;
    // Hazards and falling out of the world.
    if (touchesKind(this.grid, p, Kind.Hazard) || p.y > this.grid.h * TILE + 8) {
      const water = touchesKind(this.grid, p, Kind.Hazard) && this.isWaterAt(p);
      this.sfx(water ? 'water' : 'hurt');
      if (water) this.puff(p.x + p.w / 2, p.y + p.h, 'mist');
      // Only one hurt per fall: a held stick can't send Dagny straight back in.
      if (this.hazardGrace === 0) damagePlayer(this, 2, p.x + p.w / 2 - p.facing, true);
      this.hazardGrace = 50;
      if (this.s.hp > 0) {
        p.state = 'normal';
        p.place(p.safeX, p.safeY);
      }
    }

    // Locked doors: push against them with a key.
    this.tryDoors();
    this.tryHatch();
    this.updateCavein();

    // --- Sealed room ---
    if (this.seal) this.updateSeal();

    // --- Exits ---
    if (!this.exiting && this.seal !== 2) {
      if (p.x + p.w < 2 && this.area.left) this.leave(this.area.left);
      else if (p.x > this.grid.w * TILE - 2 && this.area.right) this.leave(this.area.right);
    }

    // --- Interact (Up or a tap on the NPC/door) ---
    this.updateInteract();

    // --- Small animals ---
    if (this.critters.length) updateCritters(this.critters, this.grid, this.playerCenter(), this.camY);

    // --- Enemies ---
    for (const e of this.enemies) e.update(this);
    combat(this);
    compact(this.enemies, (e) => !e.dead || e === this.boss);

    // --- Projectiles ---
    const solidAt = (x: number, y: number): boolean => isSolidAt(this.grid, x, y);
    for (const pr of this.projectiles) {
      pr.update(this.grid, solidAt);
      if (pr.dead || pr.delay > 0) continue;
      if (pr.fromPlayer) {
        if (pr.sprite === 'fireball') this.burn(pr);
        for (const e of this.enemies) {
          if (e.dead || !overlaps(pr.box, e.box(tmpA))) continue;
          const resist = pr.sprite === 'fireball' ? e.def.fireResist ?? 1 : 1;
          const r = e.takeHit(Math.max(1, Math.ceil(pr.damage * resist)), pr.x, 'magic', this);
          if (r !== 'none') {
            pr.dead = true;
            if (r === 'dead') killEnemy(this, e);
          }
        }
      } else if (overlaps(pr.box, p)) {
        if (pr.sprite !== 'bolt' && pr.sprite !== 'boulder' && shieldBlocks(this, pr)) {
          pr.dead = true;
          this.sparks(pr.x + pr.w / 2, pr.y + pr.h / 2);
          this.sfx('block');
          g.vibrate(15);
        } else if (p.invuln === 0) {
          pr.dead = true;
          damagePlayer(this, pr.damage, pr.x + pr.w / 2);
        }
      }
    }
    compact(this.projectiles, (pr) => !pr.dead);

    // --- Pickups ---
    for (const pk of this.pickups) {
      pk.update(this.grid);
      // A bird can't carry anything: keys, treasures and food wait for Dagny.
      if (!pk.taken && p.state !== 'bird' && overlaps(pk.box, p)) collect(this, pk);
    }
    compact(this.pickups, (pk) => !pk.taken && pk.life > 0);

    // --- Checkpoints ---
    for (const cp of this.checkpoints) {
      // Only Dagny can light a candle, not the bird.
      if (cp.lit || p.state === 'bird') continue;
      tmpA.x = cp.tx * TILE;
      tmpA.y = cp.ty * TILE;
      tmpA.w = TILE;
      tmpA.h = TILE;
      if (overlaps(tmpA, p)) {
        cp.lit = true;
        if (!s.opened.includes(cp.pid)) s.opened.push(cp.pid);
        s.checkpoint = { area: this.area.id, x: cp.tx * TILE + 3, y: (cp.ty + 1) * TILE - STAND_H };
        this.sfx('checkpoint');
        g.toast(STR.checkpoint);
        this.game.save();
      }
    }

    // --- Boss ---
    this.updateBoss();

    for (const n of this.npcs) n.update(p.x + p.w / 2);
    this.particles.update();
    this.updateAmbience();
    this.updateCamera();

    if (canLevelUp(s.xp, s.levels) && !g.modal && !this.levelUpShown && this.bossOutro === 0 && !g.transitioning) {
      this.levelUpShown = true;
      g.audio.play('levelup');
      g.pushOverlay(new LevelUpOverlay(g, () => this.applySkills()));
    }
    if (!canLevelUp(s.xp, s.levels)) this.levelUpShown = false;
  }

  private levelUpShown = false;

  private onBeatSquare(): boolean {
    const p = this.player;
    const ty = Math.floor((p.y + p.h + 1) / TILE);
    for (let tx = Math.floor(p.x / TILE); tx <= Math.floor((p.x + p.w - 1) / TILE); tx++) {
      const ch = this.area.tiles[ty]?.[tx];
      if (ch === '%' || ch === '&') return true;
    }
    return false;
  }

  private landOnPlatform(p: Player, prevBottom: number): boolean {
    const bottom = p.y + p.h;
    for (const pl of this.platforms) {
      if (p.x + p.w <= pl.x + 1 || p.x >= pl.x + pl.w - 1) continue;
      if (prevBottom <= pl.y + 3 && bottom >= pl.y) {
        p.y = pl.y - p.h;
        this.riding = pl;
        return true;
      }
    }
    return false;
  }

  private isWaterAt(r: Rect): boolean {
    const tx = Math.floor((r.x + r.w / 2) / TILE);
    const ty = Math.floor((r.y + r.h - 1) / TILE);
    return this.area.tiles[ty]?.[tx] === '~';
  }







  /** The roof coming down behind Dagny: rubble rolls right, stones fall at its front. */
  private updateCavein(): void {
    const c = this.area.cavein;
    const p = this.player;
    if (!c || hasFlag(this.s, c.flag) || p.state === 'dead') return;
    if (this.caveX === null) {
      if (this.spawn.entry === 'E' || p.x < c.at * TILE) return;
      this.caveX = Math.max(0, p.x - 7 * TILE);
      this.sfx('roar');
      this.shake(30, 3);
      this.game.vibrate([80, 40, 80]);
      return;
    }
    this.caveX += c.speed;
    if (this.frame % 5 === 0) {
      this.spawnProjectile({
        x: this.caveX + Math.random() * 40 - 8, y: 4 * TILE, vx: 0, vy: 1, w: 8, h: 8,
        sprite: 'stone', damage: 2, fromPlayer: false, life: 120, gravity: 0.2,
      });
    }
    if (this.frame % 24 === 0) this.shake(10, 2);
    if (this.frame % 6 === 0) this.puff(this.caveX, 9 * TILE + Math.random() * TILE, 'dust');
    // Caught by the rubble: hurt, and shoved out ahead of it.
    if (p.x < this.caveX + 4) {
      if (p.invuln === 0) damagePlayer(this, 2, this.caveX - 20);
      p.x = this.caveX + 4;
    }
    if (this.caveX > (this.grid.w - 3) * TILE) this.caveX = null;
  }

  /** An up-thrust that strikes a hatch from below knocks it open, for good. */
  private tryHatch(): void {
    const p = this.player;
    if (!p.upThrust || !p.swordActive) return;
    const b = p.swordBox({ x: 0, y: 0, w: 0, h: 0 });
    for (let ty = Math.floor(b.y / TILE); ty <= Math.floor((b.y + b.h) / TILE); ty++) {
      for (let tx = Math.floor(b.x / TILE); tx <= Math.floor((b.x + b.w) / TILE); tx++) {
        const i = ty * this.grid.w + tx;
        if (this.area.tiles[ty]?.[tx] !== '!' || this.grid.kinds[i] !== Kind.Solid) continue;
        this.grid.kinds[i] = Kind.Empty;
        this.tileSprite[i] = null;
        this.s.opened.push(this.pid(tx, ty));
        this.puff(tx * TILE + 8, ty * TILE + 8, 'mist');
        this.sfx('door');
        this.shake(8, 2);
        this.staticLayer = renderStatic(this);
        this.game.save();
      }
    }
  }

  private tryDoors(): void {
    const p = this.player;
    if (p.state !== 'normal' || !p.onGround) return;
    const probeX = p.facing === 1 ? p.x + p.w + 1 : p.x - 1;
    const tx = Math.floor(probeX / TILE);
    const ty = Math.floor((p.y + p.h / 2) / TILE);
    if (this.area.tiles[ty]?.[tx] !== 'L' || this.grid.kinds[ty * this.grid.w + tx] !== Kind.Solid) return;
    const pushing = this.game.input.held(p.facing === 1 ? Act.Right : Act.Left);
    if (!pushing) return;
    const s = this.s;
    const t = this.area.temple ?? 'none';
    if ((s.keys[t] ?? 0) > 0) {
      s.keys[t]--;
      // Open the whole door column.
      for (let y = 0; y < this.grid.h; y++) {
        if (this.area.tiles[y][tx] === 'L') {
          this.grid.kinds[y * this.grid.w + tx] = Kind.Empty;
          s.opened.push(this.pid(tx, y));
          this.tileSprite[y * this.grid.w + tx] = null;
          this.puff(tx * TILE + 8, y * TILE + 8, 'mist');
        }
      }
      this.staticLayer = renderStatic(this);
      this.sfx('unlock');
      this.game.save();
    } else if (this.lockMsgT === 0) {
      this.lockMsgT = 120;
      this.game.toast(DialogOverlay.get('nyckel_saknas').pages[0]);
    }
  }

  private updateInteract(): void {
    const p = this.player;
    const g = this.game;
    this.prompt = null;
    if (p.state !== 'normal' || !p.onGround) return;
    const pc = p.x + p.w / 2;
    // Right after a dialog closes, the presses and taps that closed it (and the
    // ones mashed after) must not start a talk again at once.
    // The same goes for the moment after arriving through a door.
    const settled = g.frame - this.arrivedAt >= INTERACT_PAUSE;
    if (settled && !g.input.held(Act.Up)) this.upArmed = true;
    const calm = settled && g.frame - g.overlayClosedAt >= INTERACT_PAUSE;
    const up = calm && this.upArmed && g.input.pressed(Act.Up);
    const taps = calm ? g.input.taps : [];
    const tapped = (r: Rect): boolean =>
      taps.some((t) => t.x + this.camX >= r.x - 6 && t.x + this.camX <= r.x + r.w + 6 && t.y + this.camY >= r.y - 6 && t.y + this.camY <= r.y + r.h + 6);
    // The same person or sign starts again only once Dagny has walked off a little, or after a while.
    const fresh = (key: string): boolean => {
      const last = this.lastTalk;
      return !last || last.key !== key || Math.abs(pc - last.x) > 12 || g.frame - last.at > SAME_TALK_PAUSE;
    };
    const talked = (key: string): void => {
      this.lastTalk = { key, x: pc, at: g.frame };
    };

    // NPCs
    let best: Npc | null = null;
    let bestD = 26;
    for (const n of this.npcs) {
      // Things with nothing to say (a glowing charcoal stack) give no prompt.
      if (!n.def.talk.some((t) => g.check(t.if))) continue;
      const d = Math.abs(n.x + n.box.w / 2 - pc);
      if (d < bestD && Math.abs(n.y + n.box.h - (p.y + p.h)) < 12) {
        best = n;
        bestD = d;
      }
    }
    if (best) {
      const b = best.box;
      this.prompt = { x: b.x + b.w / 2, y: b.y - 6 };
      if ((up || tapped(b)) && fresh(`npc:${best.def.id}`)) {
        const talk = best.def.talk.find((t) => g.check(t.if));
        if (talk) {
          talked(`npc:${best.def.id}`);
          p.facing = b.x + b.w / 2 < pc ? -1 : 1;
          g.pushOverlay(new DialogOverlay(g, talk.dialog, () => this.afterDialog()));
        }
      }
      return;
    }
    // Doors and signs
    for (const d of this.doors) {
      const r = { x: d.tx * TILE - 4, y: d.ty * TILE - 16, w: TILE + 8, h: 32 };
      if (!overlaps(r, p)) continue;
      this.prompt = { x: d.tx * TILE + 8, y: d.ty * TILE - 20 };
      if ((up || tapped(r)) && fresh(`door:${d.tx},${d.ty}`)) {
        const req = d.exit.requires;
        if (req && ((req.flag && !hasFlag(this.s, req.flag)) || (req.item && !hasItem(this.s, req.item)))) {
          talked(`door:${d.tx},${d.ty}`);
          g.pushOverlay(new DialogOverlay(g, req.dialog));
        } else {
          this.sfx('door');
          this.leave(d.exit);
        }
      }
      return;
    }
    for (const sgn of this.signs) {
      const r = { x: sgn.tx * TILE - 4, y: sgn.ty * TILE - 16, w: TILE + 8, h: 32 };
      if (!overlaps(r, p)) continue;
      this.prompt = { x: sgn.tx * TILE + 8, y: sgn.ty * TILE - 14 };
      if ((up || tapped(r)) && fresh(`sign:${sgn.tx},${sgn.ty}`)) {
        talked(`sign:${sgn.tx},${sgn.ty}`);
        g.pushOverlay(new DialogOverlay(g, sgn.dialog));
      }
      return;
    }
  }

  /** A fireball that reaches something that burns (a cold charcoal stack) sets it alight. */
  private burn(pr: Projectile): void {
    for (const n of this.npcs) {
      const b = n.def.burns;
      // A little above counts too: a fireball from a standing Dagny flies over a low mound.
      const nb = n.box;
      if (!b || hasFlag(this.s, b.flag) || !overlaps(pr.box, { x: nb.x, y: nb.y - 10, w: nb.w, h: nb.h + 10 })) continue;
      pr.dead = true;
      setFlag(this.s, b.flag);
      this.sfx('fire');
      this.shake(10, 1);
      for (let i = 0; i < 4; i++) this.puff(n.box.x + Math.random() * n.box.w, n.box.y + Math.random() * n.box.h, 'mist');
      if (b.dialog) this.game.pushOverlay(new DialogOverlay(this.game, b.dialog, () => this.afterDialog()));
      else this.afterDialog();
      this.game.save();
      return;
    }
  }

  /** NPC talk may have changed flags (e.g. the cat went home). */
  private afterDialog(): void {
    const s = this.s;
    this.applySkills();
    refreshRoom(this);
    // Spawn Murre when he is home.
    if (hasFlag(s, 'murre_hemma') && !this.npcs.some((n) => n.def.id === 'murre')) {
      const a = this.area;
      for (let ty = 0; ty < this.grid.h; ty++) {
        const tx = a.tiles[ty].indexOf('7');
        if (tx >= 0 && a.npcs?.['7'] === 'murre') this.npcs.push(new Npc(NPCS.murre, tx * TILE + 8, (ty + 1) * TILE));
      }
    }
  }

  /** Shuts both ways out once Dagny is inside; opens them when the room is cleared. */
  private updateSeal(): void {
    const g = this.game;
    const grid = this.grid;
    const edge = (open: boolean): void => {
      for (const x of [0, grid.w - 1]) {
        for (let y = 0; y < grid.h; y++) {
          if (this.area.tiles[y][x] === '#') continue;
          grid.kinds[y * grid.w + x] = open ? kindOf(this.area.tiles[y][x]) : Kind.Solid;
        }
      }
      grid.wallLeft = open ? !this.area.left : true;
      grid.wallRight = open ? !this.area.right : true;
    };
    const p = this.player;
    // A meeting on the map: the way back shuts behind Dagny. Only the far side
    // leads on – she needn't beat them all, but she has to get past them.
    if (this.area.kind === 'encounter') {
      if (this.seal !== 1 || p.state === 'dead') return;
      this.seal = 3;
      const back = this.spawn.entry === 'E' ? grid.w - 1 : 0;
      for (let y = 0; y < grid.h; y++) if (this.area.tiles[y][back] !== '#') grid.kinds[y * grid.w + back] = Kind.Solid;
      if (back === 0) grid.wallLeft = true;
      else grid.wallRight = true;
      if (!hasFlag(this.s, 'mote_stangt')) {
        setFlag(this.s, 'mote_stangt');
        g.toast(STR.meetingShut, 3);
      }
      return;
    }
    if (this.seal === 1 && p.x > 3 * TILE && p.x < (grid.w - 4) * TILE && p.state !== 'dead') {
      this.seal = 2;
      edge(false);
      this.sfx('roar');
      this.shake(20, 2);
      g.audio.playMusic(this.music());
      if (this.area.sealed) g.pushOverlay(new DialogOverlay(g, this.area.sealed.dialog));
    } else if (this.seal === 2 && this.enemies.every((e) => e.dead)) {
      this.seal = 0;
      edge(true);
      setFlag(this.s, `${this.area.id}_rensad`);
      g.audio.playMusic(this.music());
      this.sfx('unlock');
      g.toast(STR.sealOpen, 3);
      g.save();
    }
  }

  private leave(exit: Exit): void {
    if (this.exiting) return;
    this.exiting = true;
    // Out ahead of the cave-in: it is over for good.
    if (this.area.cavein && exit === this.area.right) setFlag(this.s, this.area.cavein.flag);
    if (this.area.opens && exit === this.area.right) setFlag(this.s, this.area.opens);
    const g = this.game;
    if (exit.to === 'overworld') {
      if (exit.ow) this.s.ow = { ...exit.ow };
      flow.goToOverworld(g);
    } else {
      flow.goToArea(g, exit.to, { entry: exit.entry, dialog: exit.dialog });
    }
  }

  private updateBoss(): void {
    const b = this.boss;
    if (!b) return;
    const g = this.game;
    if (!b.awake && !b.dead && this.player.x > 5 * TILE) {
      b.awake = true;
      this.grid.wallLeft = true;
      // Block the passage back while the fight lasts.
      for (let y = 0; y < this.grid.h; y++) if (this.grid.kinds[y * this.grid.w] === Kind.Empty) this.grid.kinds[y * this.grid.w] = Kind.Solid;
      this.sfx('roar');
      this.shake(20, 2);
      g.pushOverlay(new DialogOverlay(g, b.boss?.introDialog ?? 'boss_vaknar', () => g.audio.playMusic(this.music())));
    }
    if (this.bossOutro > 0) {
      this.bossOutro++;
      if (this.bossOutro % 8 === 0 && this.bossOutro < 70) {
        this.puff(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 'mist');
        this.sfx('puff');
      }
      if (this.bossOutro === 90) {
        const temple = this.area.temple ?? '';
        setFlag(this.s, `${temple}_boss`);
        // Re-open the way back.
        for (let y = 0; y < this.grid.h; y++) {
          if (this.area.tiles[y][0] !== '#') this.grid.kinds[y * this.grid.w] = Kind.Empty;
        }
        g.audio.playMusic(this.area.music);
        const dlg = (b.boss?.defeatDialog) ?? 'boss_forlikad';
        g.pushOverlay(new DialogOverlay(g, dlg, () => {
          spawnTreasure(this);
          spawnAfterBoss(this);
          g.save();
        }));
        this.boss = null;
        this.bossOutro = 0;
      }
    }
  }







  // --- Camera & ambience ----------------------------------------------------------------------

  private snapCamera(): void {
    const t = this.cameraTarget();
    this.camX = t.x;
    this.camY = t.y;
  }

  private cameraTarget(): { x: number; y: number } {
    const p = this.player;
    const mapW = this.grid.w * TILE;
    const mapH = this.grid.h * TILE;
    let x = p.x + p.w / 2 - VIEW_W / 2 + p.facing * 18;
    let y = p.y + p.h - VIEW_H * 0.62;
    x = mapW <= VIEW_W ? (mapW - VIEW_W) / 2 : Math.max(0, Math.min(mapW - VIEW_W, x));
    y = mapH <= VIEW_H ? (mapH - VIEW_H) : Math.max(0, Math.min(mapH - VIEW_H, y));
    return { x, y };
  }

  private updateCamera(): void {
    const t = this.cameraTarget();
    this.camX += (t.x - this.camX) * 0.12;
    this.camY += (t.y - this.camY) * 0.1;
  }

  private updateAmbience(): void {
    const amb = this.area.ambience ?? [];
    const a = this.ambient;
    a.update();
    if (a.list.length > (amb.includes('rain') ? 110 : 40)) return;
    const f = this.frame;
    const cx = this.camX;
    const cy = this.camY;
    for (const kind of amb) {
      if (kind === 'rain') {
        for (let i = 0; i < 2; i++) {
          a.spawn({ x: cx + Math.random() * (VIEW_W + 60), y: cy - 8, vx: -1.2, vy: 4.5, life: 50, color: 'rgba(169,198,207,0.55)', size: 1, frames: 4 });
        }
      } else if (kind === 'fireflies' && f % 25 === 0) {
        a.spawn({ x: cx + Math.random() * VIEW_W, y: cy + 60 + Math.random() * 90, vx: (Math.random() - 0.5) * 0.3, vy: -0.1, life: 160, color: PALETTE.Y, size: 1 });
      } else if (kind === 'mosquitoes' && f % 18 === 0) {
        const pc = this.playerCenter();
        a.spawn({ x: pc.x + (Math.random() - 0.5) * 120, y: pc.y - 10 - Math.random() * 30, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.4, life: 70, color: PALETTE.g, size: 1 });
      } else if (kind === 'dust' && f % 14 === 0) {
        a.spawn({ x: cx + Math.random() * VIEW_W, y: cy + Math.random() * VIEW_H, vx: 0.08, vy: 0.05, life: 200, color: 'rgba(243,230,200,0.5)', size: 1 });
      } else if (kind === 'leaves' && f % 40 === 0) {
        a.spawn({ x: cx + Math.random() * VIEW_W, y: cy - 4, vx: -0.3 + Math.random() * 0.2, vy: 0.4, life: 300, color: Math.random() < 0.5 ? PALETTE.o : PALETTE.y, size: 2 });
      } else if (kind === 'mist' && f % 30 === 0) {
        a.spawn({ x: cx - 40 + Math.random() * (VIEW_W + 40), y: cy + 120 + Math.random() * 40, vx: 0.15, vy: 0, life: 260, color: 'rgba(243,230,200,0.10)', size: 24 });
      }
    }
    // Wind: streaks in zones while a gust blows.
    for (const z of this.area.wind ?? []) {
      const w = this.windAt(z);
      if (!w || f % 3 !== 0) continue;
      const x = (z.x0 + Math.random() * (z.x1 - z.x0 + 1)) * TILE;
      const y = (z.y0 + Math.random() * (z.y1 - z.y0 + 1)) * TILE;
      if (x < cx - 20 || x > cx + VIEW_W + 20 || y < cy - 20 || y > cy + VIEW_H + 20) continue;
      if (w.up > 0) a.spawn({ x, y, vx: 0, vy: -2.5, life: 30, color: 'rgba(243,230,200,0.5)', size: 1, frames: 5 });
      else a.spawn({ x, y, vx: w.dx * 2.5, vy: 0, life: 30, color: 'rgba(243,230,200,0.5)', size: 1, frames: -8 });
    }
    // A storm gust called up by a creature (Havsfrun): streaks across the whole view, so the push is seen.
    if (this.gustT > 0 && f % 2 === 0) {
      const dir = Math.sign(this.gustDx);
      a.spawn({ x: dir > 0 ? cx - 10 : cx + VIEW_W + 10, y: cy + Math.random() * VIEW_H, vx: dir * (5 + Math.random() * 3), vy: 0.2, life: 70, color: 'rgba(243,230,200,0.55)', size: 1, frames: -8 });
    }
    if (amb.includes('spray') && f % 6 === 0) {
      a.spawn({ x: cx + Math.random() * VIEW_W, y: cy + VIEW_H - 10, vx: (Math.random() - 0.5) * 0.6, vy: -1.6 - Math.random(), gravity: 0.05, life: 50, color: 'rgba(243,230,200,0.7)', size: 1 });
    }
    // Chimney smoke.
    if (f % 9 === 0) {
      for (const pr of this.area.props ?? []) {
        if (!pr.smoke) continue;
        a.spawn({ x: pr.tx * TILE + 8 + Math.random() * 2, y: (pr.ty + 1) * TILE + 2, vx: 0.15 + Math.random() * 0.1, vy: -0.35, life: 110, color: 'rgba(201,187,165,0.55)', size: 3 });
      }
      for (const n of this.npcs) {
        if (!n.def.smoke) continue;
        a.spawn({ x: n.x + n.w / 2 - 1 + Math.random() * 2, y: n.y + 2, vx: 0.1 + Math.random() * 0.1, vy: -0.3, life: 120, color: 'rgba(160,170,190,0.55)', size: 3 });
      }
    }
  }










}
