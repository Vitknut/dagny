import { Act } from '../engine/input';
import { VIEW_W, VIEW_H } from '../engine/screen';
import { drawSprite, spriteSize } from '../engine/sprites';
import { drawText, measure } from '../engine/text';
import { OVERWORLD } from '../data/overworld';
import { TEMPLES } from '../data/temples';
import { PLACE_CHARS, TERRAIN } from '../data/terrain';
import { PALETTE } from '../data/palettes';
import { STR } from '../data/strings';
import type { EncounterDef, OverworldPlace } from '../data/types';
import { DialogOverlay } from './dialog';
import type { Game, Scene } from './game';
import { drawHud } from './hud';
import { hasFlag, hasItem, setFlag, type GameState } from './state';
import * as flow from './flow';
import { ENCOUNTER_TABLES, TERRAIN_TYPE } from '../data/encounters';
import { pickEncounter } from './encounters';
import { reachableTiles } from './reach';
import { markExplored } from './explored';
import { SPRITES } from '../art';

const T = 16;
const STEP_FRAMES = 9;

/** Sprite per map character (from data/terrain.ts). */
export const TILE_SPRITE: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(TERRAIN).map(([c, d]) => [c, d.sprite]));

/** Under a landmark ('0'): the ground of the nearest tile beside it that is plain ground. */
function groundBeside(tiles: readonly string[], x: number, y: number): string {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1], [0, -1], [-2, 0], [2, 0]]) {
    const c = tiles[y + dy]?.[x + dx];
    if (c && c !== '0' && !PLACE_CHARS.includes(c) && !ANIMATED_GROUND.includes(c)) return c;
  }
  return '.';
}
const ANIMATED_GROUND = '~Rznw';

/** Animated ground: drawn every frame on top of the static map. */
/** Water: anything crossed in the boat. */
const isWater = (ch: string): boolean => TERRAIN[ch]?.needs === 'eka';

/**
 * The temples as landmarks bigger than a tile, and where each stands: the
 * sprite's top-left corner in tiles from the place (the tiles it covers are
 * '0' on the map – ground nobody walks on).
 */
const BIG: Readonly<Record<string, { sprite: string; dx: number; dy: number }>> = {
  K: { sprite: 'owKyrka', dx: -1, dy: -1 },
  M: { sprite: 'owGruva', dx: 0, dy: -1 },
  Q: { sprite: 'owMill', dx: 0, dy: -1 },
  Y: { sprite: 'owFyr', dx: 0, dy: -1 },
  P: { sprite: 'owFolkpark', dx: -1, dy: 0 },
  Z: { sprite: 'owFabodBig', dx: -1, dy: -1 },
  T: { sprite: 'owTrollBig', dx: -1, dy: -1 },
};

const ANIMATED: Readonly<Record<string, string>> = { ...Object.fromEntries(Object.entries(BIG).map(([c, b]) => [c, b.sprite])), '~': 'owWater', R: 'owWater', z: 'owCurrent', n: 'owCurrent', w: 'owRapids', A: 'owWaterfall', v: 'owQuag', '%': 'owStorm' };

interface Walker {
  x: number;
  y: number;
  /** Previous tile while moving. */
  fx: number;
  fy: number;
  t: number;
}

interface EncounterRuntime extends Walker {
  def: EncounterDef;
  /** Play time (s) when it may come back. */
  respawnAt: number;
  wait: number;
}

/** The last meeting, so the same one never comes twice in a row. */
let lastEncounter: string | null = null;

/** Wandering creatures keep their positions between visits (per session). */
const encounterMemory = new Map<number, EncounterRuntime>();

let staticMap: HTMLCanvasElement | null = null;
/** Roads and bridges: no meeting sets foot on them. */
const ROAD = '|-+=';
/** The map with the sleeping regions drained of colour, built once per set of woken places. */
let wokenMap: { key: string; canvas: HTMLCanvasElement } | null = null;

/** The flag set when Dagny has found a place only the radio shows. */
export function radioFound(pl: OverworldPlace): string {
  // A room with a door on each side (Väktarkammaren) is found once, by either door.
  return pl.area ? `radiofynd_${pl.area}` : `radiofynd_${pl.x}_${pl.y}`;
}

/** What the radio's static leads to: places it shows, and the hidden path through the spruce. */
let radioCache: Array<{ x: number; y: number; flag: string }> | null = null;
export function radioTargets(): Array<{ x: number; y: number; flag: string }> {
  if (radioCache) return radioCache;
  const out = OVERWORLD.places.filter((p) => p.hidden === 'radio' || p.radio).map((p) => ({ x: p.x, y: p.y, flag: radioFound(p) }));
  OVERWORLD.tiles.forEach((row, y) => [...row].forEach((ch, x) => ch === 'H' && out.push({ x, y, flag: 'radiofynd_stigen' })));
  radioCache = out;
  return out;
}

/** Landmark shapes without their ground, to show through the marsh fog. */
const cutouts = new Map<string, HTMLCanvasElement | null>();
const GROUND = 'MmlvVt_';
function cutout(id: string): HTMLCanvasElement | null {
  if (cutouts.has(id)) return cutouts.get(id)!;
  const def = SPRITES[id];
  const rows = def && Array.isArray(def.frames[0]) ? (def.frames[0] as string[]) : null;
  let c: HTMLCanvasElement | null = null;
  if (rows && typeof document !== 'undefined') {
    c = document.createElement('canvas');
    c.width = def.w;
    c.height = def.h;
    const g = c.getContext('2d')!;
    rows.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (GROUND.includes(ch) || !PALETTE[ch]) return;
        g.fillStyle = PALETTE[ch];
        g.fillRect(x, y, 1, 1);
      }),
    );
  }
  cutouts.set(id, c);
  return c;
}

function buildStatic(): HTMLCanvasElement {
  const tiles = OVERWORLD.tiles;
  const c = document.createElement('canvas');
  c.width = tiles[0].length * T;
  c.height = tiles.length * T;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const ch = tiles[y][x];
      // Places sit on grass.
      if (PLACE_CHARS.includes(ch)) drawSprite(ctx, BIG[ch] ? TILE_SPRITE[groundBeside(tiles, x, y)] ?? 'owGrass' : 'owGrass', 0, x * T, y * T);
      if (ANIMATED[ch]) continue;
      drawSprite(ctx, TILE_SPRITE[ch === '0' ? groundBeside(tiles, x, y) : ch] ?? 'owGrass', 0, x * T, y * T);
    }
  }
  tintGround(ctx);
  return c;
}

/**
 * The whole map as one picture, as Dagny sees it with every treasure – the
 * hidden ways open (used by the map tool for docs/kartor/).
 */
export function overworldImage(): HTMLCanvasElement {
  const base = buildStatic();
  const c = document.createElement('canvas');
  c.width = base.width;
  c.height = base.height;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(base, 0, 0);
  const tiles = OVERWORLD.tiles;
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const ch = tiles[y][x];
      if (ANIMATED[ch]) drawSprite(ctx, ANIMATED[ch], 0, x * T, y * T);
      if (ch === 'H') drawSprite(ctx, 'owHiddenPath', 0, x * T, y * T);
      if (ch === 'E') drawSprite(ctx, 'owCliffDoor', 0, x * T, y * T);
    }
  }
  for (const pl of OVERWORLD.places) if (pl.hidden === 'near') drawSprite(ctx, pl.sprite ?? 'owFallCave', 0, pl.x * T, pl.y * T);
  return c;
}

/**
 * Each region has its own colour of ground; where two meet, the colours
 * blend over a couple of tiles instead of changing at a hard edge.
 */
function tintGround(ctx: CanvasRenderingContext2D): void {
  const region = regionOfTiles();
  const tiles = OVERWORLD.tiles;
  const R = 2;
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      // A temple's tile and the ground under its landmark take the colour of the ground around.
      const ch = tiles[y][x] === '0' || BIG[tiles[y][x]] ? groundBeside(tiles, x, y) : tiles[y][x];
      if (region[y][x] < 0 || !TINTED.includes(ch)) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const k = region[y + dy]?.[x + dx];
          if (k === undefined || k < 0) continue;
          const [cr, cg, cb] = REGION_TINT[k];
          r += cr;
          g += cg;
          b += cb;
          n++;
        }
      }
      ctx.fillStyle = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
      ctx.globalAlpha = 0.16;
      ctx.fillRect(x * T, y * T, T, T);
      ctx.globalAlpha = 1;
    }
  }
}

/** Ground that takes the region's colour (not water, rock, roads or buildings). */
const TINTED = '.:mlhgdkfu_reo';

/** Region colours, in the order the regions open (see regionOfTiles). */
const REGION_TINT: ReadonlyArray<[number, number, number]> = [
  [150, 190, 70], // the home valley: lush green
  [70, 110, 90], // the mine country: dark spruce green
  [170, 120, 60], // the mill valley: rust and autumn
  [200, 190, 120], // the coast: pale, salty grass
  [210, 150, 110], // the park plain: warm evening
  [140, 120, 150], // the highlands: heather and grey
];

/** The treasures in the order they open the regions. */
const REGION_KEYS = ['eka', 'karbidlampa', 'stovlar', 'ficklampa', 'radio'];

let regionGrid: number[][] | null = null;

/** For every tile, the region it belongs to (index into REGION_TINT), or -1. */
function regionOfTiles(): number[][] {
  if (regionGrid) return regionGrid;
  const out = OVERWORLD.tiles.map((row) => [...row].map(() => -1));
  for (let k = 0; k <= REGION_KEYS.length; k++) {
    for (const key of reachableTiles(REGION_KEYS.slice(0, k))) {
      const [x, y] = key.split(',').map(Number);
      if (out[y][x] < 0) out[y][x] = k;
    }
  }
  regionGrid = out;
  return out;
}

/** The temple whose waking turns a region from grey to summer (regions open in temple order). */
function regionTemple(k: number): string | undefined {
  return TEMPLES.filter((t) => t.id !== 'trollberget')[k]?.id;
}

export class OverworldScene implements Scene {
  private me: Walker;
  private facing: 'down' | 'up' | 'side' = 'down';
  private flip = false;
  /** Steps Dagny has sat still on a current. */
  private drifting = 0;
  /** Where Dagny last stood on firm ground (outside the fog): the quagmire spits her out there. */
  private firm: { x: number; y: number } | null = null;
  /** Frames left of sinking into a quagmire. */
  private sinkT = 0;
  /** A sound through the night forest: from which way it came, for the little sign at the edge. */
  private cue: { kind: 'fiddle' | 'whistle'; dx: number; dy: number; t: number } | null = null;
  /** The radio's static: 0–4 bars. */
  private signal = 0;
  /** Frames left of the mountain's rumble. */
  private shakeT = 0;
  /** How far the marsh fog and the night forest's dark have closed in (0–1, eased). */
  private fog = 0;
  private dark = 0;
  private frame = 0;
  private grace = 90;
  private blockedMsgT = 0;
  private encounters: EncounterRuntime[] = [];
  private camX = 0;
  private camY = 0;
  private leaving = false;
  /** Water, rapids and waterfalls, drawn each frame. */
  private animated: Array<{ x: number; y: number; sprite: string }> = [];
  /** Hidden ways (the path through the thicket, the door in the cliff), shown with the radio. */
  private secrets: Array<{ x: number; y: number; sprite: string }> = [];
  /** Meetings that stay away once their region's place has woken (every other one there). */
  private thin = new Map<EncounterRuntime, string>();
  /** The map as drawn: the static map with sleeping regions greyed (see transform). */
  private map: HTMLCanvasElement | null = null;

  constructor(private readonly game: Game) {
    const s = this.s;
    this.me = { x: s.ow.x, y: s.ow.y, fx: s.ow.x, fy: s.ow.y, t: 1 };
    staticMap ??= buildStatic();
    OVERWORLD.encounters.forEach((def, i) => {
      let e = encounterMemory.get(i);
      if (!e) {
        e = { def, x: def.x, y: def.y, fx: def.x, fy: def.y, t: 1, respawnAt: 0, wait: 20 + i * 7 };
        encounterMemory.set(i, e);
      }
      this.encounters.push(e);
    });
    const tiles = OVERWORLD.tiles;
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const ch = tiles[y][x];
        if (ANIMATED[ch]) this.animated.push({ x, y, sprite: ANIMATED[ch] });
        else if (ch === 'H' || ch === 'E') this.secrets.push({ x, y, sprite: ch === 'H' ? 'owHiddenPath' : 'owCliffDoor' });
      }
    }
    // Big sprites last, over the water they stand in.
    this.animated.sort((p, q) => spriteSize(p.sprite).w - spriteSize(q.sprite).w);
    // Every other meeting in a region keeps away once its place has woken.
    const region = regionOfTiles();
    const count = new Map<number, number>();
    for (const e of this.encounters) {
      const k = region[e.def.y]?.[e.def.x] ?? -1;
      const n = count.get(k) ?? 0;
      count.set(k, n + 1);
      const temple = regionTemple(k);
      if (temple && n % 2 === 1) this.thin.set(e, `${temple}_klar`);
    }
    this.transform();
    markExplored(s, s.ow.x, s.ow.y);
    this.updateCamera(true);
  }

  /** A meeting that is not there (beaten for good, or kept away by a woken place). */
  private gone(e: EncounterRuntime): boolean {
    const f = e.def.goneFlag ?? this.thin.get(e);
    return !!f && this.s.flags.includes(f);
  }

  /**
   * The land wakes with its place: grey drains out of a region once its temple
   * is reconciled (blending over a few tiles at the borders).
   */
  private transform(): void {
    const region = regionOfTiles();
    const tiles = OVERWORLD.tiles;
    const h = tiles.length;
    const w = tiles[0].length;
    const asleep = (k: number): number => {
      const t = regionTemple(k);
      return t && !hasFlag(this.s, `${t}_klar`) ? 1 : 0;
    };
    const key = TEMPLES.map((t) => (hasFlag(this.s, `${t.id}_klar`) ? 1 : 0)).join('');
    if (wokenMap?.key !== key && staticMap && typeof document !== 'undefined') {
      // Drawn once here, not every frame: blending tile by tile is far too slow for phones.
      const c = document.createElement('canvas');
      c.width = staticMap.width;
      c.height = staticMap.height;
      const ctx = c.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(staticMap, 0, 0);
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = '#808080';
      const R = 2;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let sum = 0;
          let n = 0;
          for (let dy = -R; dy <= R; dy++) {
            for (let dx = -R; dx <= R; dx++) {
              const k = region[y + dy]?.[x + dx];
              if (k === undefined || k < 0) continue;
              sum += asleep(k);
              n++;
            }
          }
          const g = n ? sum / n : 0;
          if (g <= 0) continue;
          ctx.globalAlpha = 0.55 * g;
          ctx.fillRect(x * T, y * T, T, T);
        }
      }
      wokenMap = { key, canvas: c };
    }
    this.map = wokenMap?.canvas ?? staticMap;
  }

  private get s(): GameState {
    return this.game.state as GameState;
  }

  music(): string | null {
    return OVERWORLD.music;
  }

  enter(): void {
    this.game.save();
    // Each place that wakes loosens Dagmar's hold on the mountain: the first
    // time Dagny comes out after a temple, Trollberget rumbles.
    const s = this.s;
    const woken = TEMPLES.filter((t) => t.id !== 'trollberget' && hasFlag(s, `${t.id}_klar`)).length;
    if (woken > 0 && !hasFlag(s, `berg_mullrar_${woken}`) && !hasFlag(s, 'trollberget_klar')) {
      s.flags.push(`berg_mullrar_${woken}`);
      this.shakeT = 60;
      this.game.audio.play('roar');
      this.game.toast(STR.mountainRumble, 3.5);
      this.game.vibrate([60, 40, 90]);
    }
  }

  /** The glow round Trollberget: Dagmar's hold. It flickers harder the more places have woken. */
  private renderMountain(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const s = this.s;
    if (hasFlag(s, 'trollberget_klar')) return;
    const troll = OVERWORLD.places.find((p) => p.area === 'troll_1');
    if (!troll) return;
    const cx = troll.x * T + T / 2 - camX;
    const cy = troll.y * T + T / 2 - camY;
    if (cx < -80 || cy < -80 || cx > VIEW_W + 80 || cy > VIEW_H + 80) return;
    const woken = TEMPLES.filter((t) => t.id !== 'trollberget' && hasFlag(s, `${t.id}_klar`)).length;
    const unrest = woken / 6;
    const flicker = Math.sin(this.frame / (24 - unrest * 16)) * (0.04 + unrest * 0.1) + (Math.random() < unrest * 0.05 ? -0.12 : 0);
    const a = Math.max(0, 0.42 + flicker);
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 70);
    g.addColorStop(0, `rgba(240,210,122,${a.toFixed(3)})`);
    g.addColorStop(0.5, `rgba(207,106,76,${(a * 0.5).toFixed(3)})`);
    g.addColorStop(1, 'rgba(207,106,76,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 70, cy - 70, 140, 140);
  }

  capture(state: GameState): void {
    state.ow = { x: this.me.x, y: this.me.y };
    state.loc = { area: 'overworld', x: this.me.x, y: this.me.y };
  }

  private tile(x: number, y: number): string {
    return OVERWORLD.tiles[y]?.[x] ?? '^';
  }

  private placeAt(x: number, y: number): OverworldPlace | undefined {
    return OVERWORLD.places.find((p) => p.x === x && p.y === y);
  }

  /** Can Dagny step onto this tile? Returns the missing item's id if blocked by one. */
  private passable(x: number, y: number): true | string | false {
    const ch = this.tile(x, y);
    if (OVERWORLD.blocked.includes(ch)) return false;
    const need = OVERWORLD.needs[ch];
    if (need && !hasItem(this.s, need)) return need;
    return true;
  }

  update(): void {
    this.frame++;
    if (this.grace > 0) this.grace--;
    if (this.blockedMsgT > 0) this.blockedMsgT--;
    if (this.leaving) return;
    if (this.sinkT > 0) {
      if (--this.sinkT === 0) this.surface();
      return;
    }
    const input = this.game.input;
    const me = this.me;

    if (me.t < 1) {
      me.t = Math.min(1, me.t + 1 / STEP_FRAMES);
      if (me.t >= 1) this.arrive();
    } else {
      let dx = 0;
      let dy = 0;
      if (input.held(Act.Left)) dx = -1;
      else if (input.held(Act.Right)) dx = 1;
      else if (input.held(Act.Up)) dy = -1;
      else if (input.held(Act.Down)) dy = 1;
      // Taps: walk toward the tapped spot.
      if (!dx && !dy && input.taps.length) {
        const t = input.taps[0];
        const wx = (t.x + this.camX) / T - (me.x + 0.5);
        const wy = (t.y + this.camY) / T - (me.y + 0.5);
        if (Math.abs(wx) > Math.abs(wy)) dx = Math.sign(wx);
        else dy = Math.sign(wy);
      }
      // The storm on Bergsstigen shoves her down the mountain now and then.
      const wind = TERRAIN[this.tile(me.x, me.y)]?.wind;
      if (wind && this.frame % 40 === 0 && this.passable(me.x + wind[0], me.y + wind[1]) === true) {
        me.fx = me.x;
        me.fy = me.y;
        me.x += wind[0];
        me.y += wind[1];
        me.t = 0;
        this.game.audio.play('wind');
        this.updateEncounters();
        this.updateCamera(false);
        return;
      }
      // A current takes the boat along when Dagny stops rowing.
      const drift = TERRAIN[this.tile(me.x, me.y)]?.drift;
      if (dx || dy) this.drifting = 0;
      else if (drift && ++this.drifting > 16 && this.passable(me.x + drift[0], me.y + drift[1]) === true) {
        this.drifting = 0;
        me.fx = me.x;
        me.fy = me.y;
        me.x += drift[0];
        me.y += drift[1];
        me.t = 0;
      }
      if (dx || dy) {
        this.facing = dy < 0 ? 'up' : dy > 0 ? 'down' : 'side';
        if (dx) this.flip = dx < 0;
        const nx = me.x + dx;
        const ny = me.y + dy;
        const ok = this.passable(nx, ny);
        if (ok === true) {
          me.fx = me.x;
          me.fy = me.y;
          me.x = nx;
          me.y = ny;
          me.t = 0;
          if (isWater(this.tile(nx, ny)) && !isWater(this.tile(me.fx, me.fy))) this.game.audio.play('water');
        } else if (typeof ok === 'string' && this.blockedMsgT === 0) {
          // What stops her is described once; after that she just can't go on.
          this.blockedMsgT = 90;
          if (!hasFlag(this.s, `hinder_${ok}`)) {
            setFlag(this.s, `hinder_${ok}`);
            this.game.pushOverlay(new DialogOverlay(this.game, `behover_${ok}`));
          } else this.game.audio.play('cancel');
        }
      }
    }

    this.updateEncounters();
    this.updateSounds();
    this.signal = this.radioSignal();
    if (this.signal > 0 && this.frame % [0, 90, 50, 26, 12][this.signal] === 0) this.game.audio.play('static', { vol: 0.4 + this.signal * 0.15 });
    this.updateCamera(false);
  }

  /**
   * In the night forest there is nothing to see – but the fiddle at the dance
   * and the train's whistle carry, each from its own way.
   */
  private updateSounds(): void {
    if (this.cue && --this.cue.t <= 0) this.cue = null;
    if (TERRAIN[this.tile(this.me.x, this.me.y)]?.sight !== 'dark' || this.frame % 210 !== 100) return;
    const kind = (this.frame / 210) % 2 < 1 ? 'fiddle' : 'whistle';
    const src = OVERWORLD.places.find((p) => p.area === (kind === 'fiddle' ? 'folkparken_1' : 'stationssamhallet'));
    if (!src) return;
    const dx = src.x - this.me.x;
    const dy = src.y - this.me.y;
    const dist = Math.hypot(dx, dy);
    this.game.audio.play(kind, { vol: Math.max(0.15, 1 - dist / 28), pan: dx / 14 });
    this.cue = { kind, dx: dx / (dist || 1), dy: dy / (dist || 1), t: 100 };
  }

  private arrive(): void {
    const me = this.me;
    this.s.ow = { x: me.x, y: me.y };
    // In fog or dark Dagny sees – and so maps – only what is close.
    const ground = TERRAIN[this.tile(me.x, me.y)];
    const near = ground?.sight ? 2 : undefined;
    markExplored(this.s, me.x, me.y, near, near);
    if (!ground?.sight) this.firm = { x: me.x, y: me.y };
    if (ground?.sink) {
      this.sinkT = 40;
      this.game.audio.play('water');
      this.game.vibrate([40, 30, 60]);
      return;
    }
    if (this.frame % 2 === 0) this.game.audio.play('step');
    const place = this.placeAt(me.x, me.y);
    // A viewpoint: from up here Dagny sees far, and the map fills in.
    // (The first time, the place's dialog says what Dagny sees and that it goes on the map.)
    if (place?.view && markExplored(this.s, me.x, me.y, place.view, Math.round(place.view * 0.7))) this.game.audio.play('key');
    // A place the radio finds is nothing at all without it.
    const byRadio = place?.hidden === 'radio' || place?.radio;
    if (place && byRadio && !hasItem(this.s, 'radio')) return;
    if (place && byRadio) setFlag(this.s, radioFound(place));
    if (ground && this.tile(me.x, me.y) === 'H') setFlag(this.s, 'radiofynd_stigen');
    if (place?.doneFlag && hasFlag(this.s, place.doneFlag)) return;
    if (place) {
      const locked = place.requires && !place.requires.every((f) => hasFlag(this.s, f));
      if (place.area && !locked) {
        this.leaving = true;
        this.game.audio.play('door');
        flow.goToArea(this.game, place.area, { entry: place.entry });
      } else if (place.dialog) {
        this.game.pushOverlay(new DialogOverlay(this.game, place.dialog, () => this.afterRadioVoice()));
      }
    }
  }

  /** All four fragments of Dagmar's voice heard: someone in the mountain answers. */
  private afterRadioVoice(): void {
    const s = this.s;
    if (hasFlag(s, 'bruset_klart') || ![1, 2, 3, 4].every((n) => hasFlag(s, `bruset_${n}`))) return;
    this.game.pushOverlay(new DialogOverlay(this.game, 'bruset_klart'));
  }

  /**
   * Chapter 7: with the radio, the static grows the closer Dagny comes to
   * something hidden on the map she has not found yet (0 = nothing near, 4 = here).
   */
  private radioSignal(): number {
    const s = this.s;
    if (!hasItem(s, 'radio')) return 0;
    let best = Infinity;
    for (const t of radioTargets()) {
      if (hasFlag(s, t.flag)) continue;
      best = Math.min(best, Math.abs(t.x - this.me.x) + Math.abs(t.y - this.me.y));
    }
    return best <= 2 ? 4 : best <= 6 ? 3 : best <= 11 ? 2 : best <= 18 ? 1 : 0;
  }

  /** Out of the quagmire, back where the ground last held. */
  private surface(): void {
    const me = this.me;
    const back = this.firm ?? this.nearestFirm();
    me.x = me.fx = back.x;
    me.y = me.fy = back.y;
    me.t = 1;
    this.s.ow = { x: me.x, y: me.y };
    this.grace = 60;
    this.updateCamera(true);
    // Said once: after that the sinking speaks for itself.
    if (!hasFlag(this.s, 'sjonk_i_gungfly')) {
      setFlag(this.s, 'sjonk_i_gungfly');
      this.game.toast(STR.sank, 3);
    }
  }

  /** The closest open ground outside the fog (after a meeting dropped Dagny back in the marsh). */
  private nearestFirm(): { x: number; y: number } {
    const me = this.me;
    for (let r = 1; r < 30; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (const dx of [r - Math.abs(dy), Math.abs(dy) - r]) {
          const x = me.x + dx;
          const y = me.y + dy;
          const d = TERRAIN[this.tile(x, y)];
          if (d && !d.sight && !d.blocked && !d.needs && !this.placeAt(x, y)) return { x, y };
        }
      }
    }
    return OVERWORLD.start;
  }

  private pos(w: Walker): { x: number; y: number } {
    const k = w.t;
    return { x: (w.fx + (w.x - w.fx) * k) * T, y: (w.fy + (w.y - w.fy) * k) * T };
  }

  private updateEncounters(): void {
    const s = this.s;
    const me = this.me;
    const mp = this.pos(me);
    for (const e of this.encounters) {
      if (this.gone(e)) continue;
      if (s.playTime < e.respawnAt) continue;
      // Off the road, a meeting that has seen Dagny comes after her – quicker
      // than it wanders, though not as quick as she walks. On the road she is
      // safe: they never set foot on it, and lose interest while she keeps to it.
      const dist = Math.abs(e.x - me.x) + Math.abs(e.y - me.y);
      const onRoad = ROAD.includes(this.tile(me.x, me.y));
      const chasing = !onRoad && dist < 9;
      if (e.t < 1) {
        e.t = Math.min(1, e.t + 1 / (chasing ? 14 : 22));
      } else if (--e.wait <= 0) {
        e.wait = chasing ? 6 + Math.floor(Math.random() * 6) : 25 + Math.floor(Math.random() * 35);
        const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const sx = Math.sign(me.x - e.x);
        const sy = Math.sign(me.y - e.y);
        // Toward her along the longer way first, then the other, then anywhere.
        const tries: Array<[number, number]> = chasing
          ? Math.abs(me.x - e.x) > Math.abs(me.y - e.y)
            ? [[sx, 0], [0, sy || 1], [0, -(sy || 1)]]
            : [[0, sy], [sx || 1, 0], [-(sx || 1), 0]]
          : [dirs[Math.floor(Math.random() * 4)]];
        for (const [cx, cy] of tries) {
          if (!cx && !cy) continue;
          const nx = e.x + cx;
          const ny = e.y + cy;
          const homeDist = Math.abs(nx - e.def.x) + Math.abs(ny - e.def.y);
          const ch = this.tile(nx, ny);
          const g = TERRAIN[ch];
          // A shadow on the hunt crosses any open ground – but never the road, water or the fog and dark.
          const open = chasing && e.def.sprite === 'owShadow' && !!g && !g.blocked && !g.needs && !g.sight && !ROAD.includes(ch);
          if (!(e.def.terrain.includes(ch) || open) || this.placeAt(nx, ny) || homeDist > (chasing ? 10 : 6)) continue;
          e.fx = e.x;
          e.fy = e.y;
          e.x = nx;
          e.y = ny;
          e.t = 0;
          break;
        }
      }
      // Collision → short side-view encounter.
      const ep = this.pos(e);
      if (this.grace === 0 && Math.abs(ep.x - mp.x) < 11 && Math.abs(ep.y - mp.y) < 11) {
        e.respawnAt = s.playTime + 45;
        e.x = e.fx = e.def.x;
        e.y = e.fy = e.def.y;
        e.t = 1;
        const terrain = this.tile(me.t < 1 ? me.fx : me.x, me.t < 1 ? me.fy : me.y);
        const table = ENCOUNTER_TABLES[e.def.table ?? TERRAIN_TYPE[terrain] ?? 'ang'];
        const pick = pickEncounter(table, Math.random(), lastEncounter);
        lastEncounter = pick.id;
        this.s.ow = { x: me.t < 1 ? me.fx : me.x, y: me.t < 1 ? me.fy : me.y };
        if ('dialog' in pick) {
          // A friendly meeting instead of a fight.
          this.grace = 60;
          this.game.audio.play('magic');
          this.game.pushOverlay(new DialogOverlay(this.game, pick.dialog));
          return;
        }
        this.leaving = true;
        this.game.audio.play('roar');
        this.game.vibrate(30);
        flow.goToArea(this.game, pick.area, { entry: 'W', facing: 1 });
        return;
      }
    }
  }

  private updateCamera(snap: boolean): void {
    const p = this.pos(this.me);
    const mapW = OVERWORLD.tiles[0].length * T;
    const mapH = OVERWORLD.tiles.length * T;
    const tx = Math.max(0, Math.min(mapW - VIEW_W, p.x + 8 - VIEW_W / 2));
    const ty = Math.max(0, Math.min(mapH - VIEW_H, p.y + 8 - VIEW_H / 2));
    if (snap) {
      this.camX = tx;
      this.camY = ty;
    } else {
      this.camX += (tx - this.camX) * 0.2;
      this.camY += (ty - this.camY) * 0.2;
    }
  }

  /**
   * The marsh fog and the night forest's dark: only a little round Dagny
   * shows, and in the forest only what the torch lights ahead of her.
   */
  private renderSight(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const me = this.me;
    const at = me.t > 0.5 ? this.tile(me.x, me.y) : this.tile(me.fx, me.fy);
    const sight = TERRAIN[at]?.sight;
    this.fog += ((sight === 'fog' ? 1 : 0) - this.fog) * 0.06;
    this.dark += ((sight === 'dark' ? 1 : 0) - this.dark) * 0.08;
    if (this.fog > 0.01) {
      const drift = Math.sin(this.frame / 50) * 4;
      const g = ctx.createRadialGradient(cx, cy, 20 + drift, cx, cy, 62 + drift);
      g.addColorStop(0, 'rgba(201,187,165,0)');
      g.addColorStop(1, `rgba(201,187,165,${(0.94 * this.fog).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    if (this.dark > 0.01) {
      // The beam reaches ahead in the way she faces; a faint ring keeps her own feet in sight.
      const ahead = this.facing === 'up' ? [0, -1] : this.facing === 'down' ? [0, 1] : [this.flip ? -1 : 1, 0];
      const bx = cx + ahead[0] * 22;
      const by = cy + ahead[1] * 22;
      const g = ctx.createRadialGradient(bx, by, 10, bx, by, 44);
      g.addColorStop(0, 'rgba(43,34,51,0)');
      g.addColorStop(0.6, `rgba(43,34,51,${(0.55 * this.dark).toFixed(3)})`);
      g.addColorStop(1, `rgba(43,34,51,${(0.97 * this.dark).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  /**
   * In the marsh fog the landmarks to steer by stand out as shapes further
   * off, and the irrbloss glow – which is how they lure.
   */
  private renderThroughFog(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const me = this.me;
    ctx.save();
    ctx.globalAlpha = 0.7 * this.fog;
    for (let y = me.y - 7; y <= me.y + 7; y++) {
      for (let x = me.x - 10; x <= me.x + 10; x++) {
        const d = TERRAIN[this.tile(x, y)];
        if (!d?.landmark || Math.abs(x - me.x) + Math.abs(y - me.y) < 3) continue;
        const c = cutout(d.sprite);
        if (c) ctx.drawImage(c, x * T - camX, y * T - camY);
      }
    }
    ctx.globalAlpha = this.fog;
    for (const e of this.encounters) {
      if (e.def.sprite !== 'owWisp' || this.s.playTime < e.respawnAt || this.gone(e)) continue;
      const p = this.pos(e);
      const bob = Math.round(Math.sin(this.frame / 10 + e.def.x) * 2);
      drawSprite(ctx, 'owWisp', Math.floor(this.frame / 16) % 2, p.x - camX, p.y - camY + bob);
    }
    ctx.restore();
  }

  /**
   * The night forest: what lurks there shows only as a pair of eyes, and a
   * sound that carries leaves a little sign at the edge of sight, the way it came.
   */
  private renderInTheDark(ctx: CanvasRenderingContext2D, camX: number, camY: number, cx: number, cy: number): void {
    ctx.save();
    ctx.globalAlpha = this.dark;
    for (const e of this.encounters) {
      if (this.s.playTime < e.respawnAt || this.gone(e)) continue;
      if (TERRAIN[this.tile(e.x, e.y)]?.sight !== 'dark') continue;
      // A blink now and then.
      if ((this.frame + e.def.x * 37) % 150 < 6) continue;
      const p = this.pos(e);
      ctx.fillStyle = PALETTE.Y;
      ctx.fillRect(Math.round(p.x - camX + 6), Math.round(p.y - camY + 6), 1, 1);
      ctx.fillRect(Math.round(p.x - camX + 9), Math.round(p.y - camY + 6), 1, 1);
    }
    if (this.cue) {
      const r = 50 + (100 - this.cue.t) * 0.2;
      const x = Math.round(cx + this.cue.dx * r);
      const y = Math.round(cy + this.cue.dy * r - (100 - this.cue.t) * 0.1);
      ctx.globalAlpha = this.dark * Math.min(1, this.cue.t / 30);
      if (this.cue.kind === 'fiddle') {
        // A note.
        ctx.fillStyle = PALETTE.Y;
        ctx.fillRect(x, y + 3, 3, 2);
        ctx.fillRect(x + 2, y - 3, 1, 6);
        ctx.fillRect(x + 3, y - 3, 2, 1);
      } else {
        // A puff of steam.
        ctx.fillStyle = PALETTE.W;
        ctx.fillRect(x - 2, y, 5, 3);
        ctx.fillRect(x, y - 2, 4, 3);
        ctx.fillRect(x + 3, y - 4, 3, 3);
      }
    }
    ctx.restore();
  }

  /** The radio in the corner, its bars crackling the closer a secret is. */
  private renderRadio(ctx: CanvasRenderingContext2D): void {
    const x = VIEW_W - 30;
    const y = VIEW_H - 16;
    ctx.fillStyle = PALETTE.k;
    ctx.fillRect(x - 2, y - 10, 28, 14);
    ctx.fillStyle = PALETTE.B;
    ctx.fillRect(x, y - 6, 9, 8);
    ctx.fillStyle = PALETTE.y;
    ctx.fillRect(x + 1, y - 5, 4, 3);
    ctx.fillStyle = PALETTE.W;
    ctx.fillRect(x + 7, y - 9, 1, 3);
    for (let i = 0; i < 4; i++) {
      const on = i < this.signal;
      const jitter = on && this.signal === 4 && (this.frame >> 2) % 2 ? 1 : 0;
      ctx.fillStyle = on ? PALETTE.Y : PALETTE.K;
      ctx.fillRect(x + 12 + i * 3, y + 1 - (i + 1) * 2 - jitter, 2, (i + 1) * 2 + jitter);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const quake = this.shakeT > 0 ? (this.shakeT--, Math.round((Math.random() - 0.5) * 4)) : 0;
    const camX = Math.round(this.camX) + quake;
    const camY = Math.round(this.camY);
    ctx.drawImage((this.map ?? staticMap) as HTMLCanvasElement, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
    const wf = Math.floor(this.frame / 30);
    const visible = (x: number, y: number): boolean => x > -T && y > -T && x < VIEW_W && y < VIEW_H;
    for (const w of this.animated) {
      const x = w.x * T - camX;
      const y = w.y * T - camY;
      // A temple is bigger than its tile: drawn from its anchor (BIG).
      const big = BIG[this.tile(w.x, w.y)];
      const sz = spriteSize(w.sprite);
      const f = w.sprite === 'owWater' ? wf : Math.floor(this.frame / (big ? 20 : 8));
      const bx = x + (big?.dx ?? 0) * T;
      const by = y + (big?.dy ?? 0) * T;
      if (visible(bx, by) || visible(bx + sz.w - T, by + sz.h - T)) drawSprite(ctx, w.sprite, f + w.x, bx, by);
    }
    const s = this.s;
    // With the radio, the hidden ways show.
    if (hasItem(s, 'radio')) {
      for (const hp of this.secrets) {
        const x = hp.x * T - camX;
        const y = hp.y * T - camY;
        if (visible(x, y)) drawSprite(ctx, hp.sprite, 0, x, y);
      }
    }
    // A cave behind a waterfall shows only to someone standing right beside it.
    for (const pl of OVERWORLD.places) {
      if (pl.hidden !== 'near' || Math.abs(pl.x - this.me.x) + Math.abs(pl.y - this.me.y) > 1) continue;
      const x = pl.x * T - camX;
      const y = pl.y * T - camY;
      if (visible(x, y)) drawSprite(ctx, pl.sprite ?? 'owFallCave', Math.floor(this.frame / 8), x, y);
    }
    // Encounters.
    for (const e of this.encounters) {
      if (s.playTime < e.respawnAt) continue;
      if (this.gone(e)) continue;
      const p = this.pos(e);
      const bob = e.def.sprite === 'owWisp' ? Math.round(Math.sin(this.frame / 10 + e.def.x) * 2) : 0;
      drawSprite(ctx, e.def.sprite, Math.floor(this.frame / 16) % 2, p.x - camX, p.y - camY + bob);
    }
    // Dagny.
    const p = this.pos(this.me);
    const onWater = (isWater(this.tile(this.me.x, this.me.y)) && this.me.t > 0.5) || (isWater(this.tile(this.me.fx, this.me.fy)) && this.me.t <= 0.5);
    const walking = this.me.t < 1;
    const step = walking ? Math.floor(this.frame / 5) % 2 : 0;
    if (onWater) {
      drawSprite(ctx, 'owBoat', Math.floor(this.frame / 12) % 2, p.x - camX, p.y - camY);
    } else if (this.sinkT > 0) {
      // Going down: less and less of her above the mire.
      const down = Math.round(((40 - this.sinkT) / 40) * 14);
      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x - camX, p.y - camY - 2, T, T - 2);
      ctx.clip();
      drawSprite(ctx, 'owDagny', 0, p.x - camX, p.y - camY + down);
      ctx.restore();
    } else {
      const base = this.facing === 'down' ? 0 : this.facing === 'up' ? 2 : 4;
      drawSprite(ctx, 'owDagny', base + step, p.x - camX, p.y - camY, this.facing === 'side' && this.flip);
    }

    this.renderMountain(ctx, camX, camY);
    this.renderSight(ctx, p.x + T / 2 - camX, p.y + T / 2 - camY);
    if (this.fog > 0.05) this.renderThroughFog(ctx, camX, camY);
    if (this.dark > 0.05) this.renderInTheDark(ctx, camX, camY, p.x + T / 2 - camX, p.y + T / 2 - camY);
    this.game.applyTone(ctx, OVERWORLD.tone, true);

    // Place name when standing next to / on a place.
    const near = OVERWORLD.places.find(
      (pl) => Math.abs(pl.x - this.me.x) + Math.abs(pl.y - this.me.y) <= 1 && ((pl.hidden !== 'radio' && !pl.radio) || hasItem(this.s, 'radio')),
    );
    if (near) {
      const w = measure(near.name) + 12;
      const x = Math.round((VIEW_W - w) / 2);
      const y = VIEW_H - 22;
      ctx.fillStyle = PALETTE.k;
      ctx.fillRect(x, y, w, 14);
      ctx.fillStyle = PALETTE.y;
      ctx.fillRect(x, y + 13, w, 1);
      drawText(ctx, near.name, VIEW_W / 2, y + 2, 'W', { align: 'center' });
    }
    if (!this.game.hudHidden) drawHud(ctx, s, { frame: this.frame });
    if (!this.game.hudHidden && hasItem(s, 'radio')) this.renderRadio(ctx);
    void STR;
  }
}
