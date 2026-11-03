/**
 * Map renderer (development tool, served at /tools/kartor.html by `npm run dev`).
 * Draws the overworld, its regions and every side-view room straight from the
 * game data with the game's own sprites, so the pictures in docs/kartor/ can
 * be regenerated whenever the maps change (see docs/kartor/README.md).
 */
import { initSprites, drawSprite, spriteSize } from '../engine/sprites';
import { drawText, measure } from '../engine/text';
import { TILE } from '../engine/collision';
import { SPRITES } from '../art';
import { AREAS } from '../data/areas';
import { OVERWORLD } from '../data/overworld';
import { PALETTE, TONES } from '../data/palettes';
import { TEMPLES } from '../data/temples';
import type { AreaDef } from '../data/types';
import { overworldImage } from '../game/overworld';
import { reachableTiles } from '../game/reach';
import { SideScene } from '../game/sidescene';
import type { Game } from '../game/game';
import { newGame } from '../game/state';

/** Pictures are drawn at game resolution and scaled up this much (crisp pixels). */
const SCALE = 2;
const T = 16;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function scaled(src: HTMLCanvasElement): HTMLCanvasElement {
  const [c, ctx] = canvas(src.width * SCALE, src.height * SCALE);
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** Text in the game's bitmap font with a dark outline. */
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = 'W', align: 'left' | 'center' = 'left'): void {
  drawText(ctx, text, x, y, color, { outline: 'k', align });
}

// --- Overworld ---------------------------------------------------------------------

function drawOverworld(ctx: CanvasRenderingContext2D): void {
  // The game's own picture of the map, with the hidden ways shown open.
  ctx.drawImage(overworldImage(), 0, 0);
}

function placeLabels(ctx: CanvasRenderingContext2D): void {
  for (const p of OVERWORLD.places) {
    const temple = TEMPLES.find((t) => t.entryArea === p.area);
    const name = temple ? `${temple.number}. ${p.name}` : p.hidden ? `${p.name} (dold)` : p.name;
    const x = p.x * T + T / 2;
    const y = p.y * T - 9;
    label(ctx, name, Math.max(measure(name) / 2 + 2, Math.min(ctx.canvas.width - measure(name) / 2 - 2, x)), Math.max(2, y), temple ? 'Y' : p.hidden ? 'c' : 'W', 'center');
  }
  label(ctx, 'START', OVERWORLD.start.x * T + 8, OVERWORLD.start.y * T + 18, 'C', 'center');
}

export function worldMap(): HTMLCanvasElement {
  const [c, ctx] = canvas(OVERWORLD.tiles[0].length * T, OVERWORLD.tiles.length * T);
  drawOverworld(ctx);
  placeLabels(ctx);
  return scaled(c);
}

/** The order of the treasures, each opening the next region. */
const TREASURE_STEPS: Array<{ item: string | null; name: string; color: string }> = [
  { item: null, name: 'Från start', color: '#f0d27a' },
  { item: 'eka', name: 'Ekan (tempel 1)', color: '#6f93ad' },
  { item: 'karbidlampa', name: 'Karbidlampan (tempel 2)', color: '#d98a3d' },
  { item: 'stovlar', name: 'Stövlarna (tempel 3)', color: '#93a95a' },
  { item: 'ficklampa', name: 'Ficklampan (tempel 4)', color: '#a9c6cf' },
  { item: 'radio', name: 'Radion (tempel 5)', color: '#a07fa0' },
];

/** The overworld coloured by which treasure first lets Dagny walk there. */
export function regionMap(): HTMLCanvasElement {
  const w = OVERWORLD.tiles[0].length;
  const h = OVERWORLD.tiles.length;
  const legendH = 16 + TREASURE_STEPS.length * 11;
  const [c, ctx] = canvas(w * T, h * T + legendH);
  ctx.fillStyle = PALETTE.k;
  ctx.fillRect(0, 0, c.width, c.height);
  drawOverworld(ctx);
  const items: string[] = [];
  let before = new Set<string>();
  for (const step of TREASURE_STEPS) {
    if (step.item) items.push(step.item);
    const now = reachableTiles(items);
    ctx.fillStyle = step.color;
    ctx.globalAlpha = 0.42;
    for (const k of now) {
      if (before.has(k)) continue;
      const [x, y] = k.split(',').map(Number);
      ctx.fillRect(x * T, y * T, T, T);
    }
    ctx.globalAlpha = 1;
    before = now;
  }
  placeLabels(ctx);
  // Legend.
  let y = h * T + 6;
  label(ctx, 'Vart Dagny kan gå – och vilken skatt som öppnar vägen:', 6, y);
  y += 12;
  for (const step of TREASURE_STEPS) {
    ctx.fillStyle = step.color;
    ctx.fillRect(8, y, 8, 7);
    label(ctx, step.name, 22, y);
    y += 11;
  }
  label(ctx, 'Trollberget öppnas när alla sex tempel är förlikade.', w * T - 6 - measure('Trollberget öppnas när alla sex tempel är förlikade.'), h * T + 6, 'Y');
  return scaled(c);
}

// --- Side-view rooms ---------------------------------------------------------------

/** Just enough of a Game for building a room (no audio, no input). */
function fakeGame(): Game {
  const state = newGame();
  // Show the secrets: hidden passages open, lamp secrets visible.
  state.items.push('svard', 'radio', 'karbidlampa', 'ficklampa');
  return { state, taken: new Set<string>(), check: (c?: unknown[]) => !c || c.length === 0 } as unknown as Game;
}

const DARK_BACKDROPS = new Set(['crypt', 'mine', 'mill', 'none']);

export function roomImage(id: string): HTMLCanvasElement {
  const a: AreaDef = AREAS[id];
  const sc = new SideScene(fakeGame(), id, { entry: 'A' });
  const w = sc.grid.w * TILE;
  const h = sc.grid.h * TILE;
  const [c, ctx] = canvas(w, h);
  // Sky or cave behind everything.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  const sky = DARK_BACKDROPS.has(a.backdrop) || a.dark ? [PALETTE.k, PALETTE.K, PALETTE.g] : TONES[a.tone]?.sky ?? [PALETTE.U, PALETTE.c, PALETTE.C];
  sky.forEach((col, i) => g.addColorStop(i / 2, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(sc.staticLayer, 0, 0);
  for (const an of sc.anim) drawSprite(ctx, an.sprite, 0, an.x, an.y);
  for (const pr of a.props ?? []) {
    if (!pr.sprite || pr.front) continue;
    const sz = spriteSize(pr.sprite);
    drawSprite(ctx, pr.sprite, 0, pr.tx * TILE + (pr.dx ?? 0), (pr.ty + 1) * TILE - sz.h + (pr.dy ?? 0));
  }
  for (const pl of sc.platforms) {
    pl.render(ctx, 0, 0);
    pl.renderHub(ctx, 0, 0);
  }
  for (const pk of sc.pickups) pk.render(ctx, 0, 0);
  for (const n of sc.npcs) n.render(ctx, 0, 0);
  for (const e of sc.enemies) e.render(ctx, 0, 0);
  sc.player.render(ctx, 0, 0, 0);
  for (const pr of a.props ?? []) {
    if (!pr.sprite || !pr.front) continue;
    const sz = spriteSize(pr.sprite);
    drawSprite(ctx, pr.sprite, 0, pr.tx * TILE + (pr.dx ?? 0), (pr.ty + 1) * TILE - sz.h + (pr.dy ?? 0));
  }
  if (sc.frontLayer) {
    ctx.globalAlpha = 0.9;
    ctx.drawImage(sc.frontLayer, 0, 0);
    ctx.globalAlpha = 1;
  }
  return c;
}

/** Several rooms under one heading, stacked top to bottom with their names. */
export function sheet(title: string, ids: string[]): HTMLCanvasElement {
  const rooms = ids.map((id) => ({ id, img: roomImage(id) }));
  const pad = 8;
  const head = 18;
  const gap = 14;
  const width = Math.max(...rooms.map((r) => r.img.width), measure(title) + 16) + pad * 2;
  const height = head + rooms.reduce((s, r) => s + r.img.height + gap, 0) + pad;
  const [c, ctx] = canvas(width, height);
  ctx.fillStyle = PALETTE.k;
  ctx.fillRect(0, 0, width, height);
  label(ctx, title, pad, 6, 'Y');
  let y = head;
  for (const r of rooms) {
    label(ctx, `${AREAS[r.id].name}  (${r.id})`, pad, y);
    y += 10;
    ctx.drawImage(r.img, pad, y);
    ctx.strokeStyle = PALETTE.g;
    ctx.strokeRect(pad - 0.5, y - 0.5, r.img.width + 1, r.img.height + 1);
    y += r.img.height + gap - 10;
  }
  return scaled(c);
}

/** Every picture for docs/kartor/, by file name. */
export function allMaps(): Array<{ file: string; title: string; canvas: HTMLCanvasElement }> {
  const ids = (pred: (a: AreaDef) => boolean): string[] => Object.values(AREAS).filter(pred).map((a) => a.id);
  const out = [
    { file: 'varldskarta.png', title: 'Världskartan', canvas: worldMap() },
    { file: 'regioner.png', title: 'Regionerna och skatterna som öppnar dem', canvas: regionMap() },
  ];
  for (const t of TEMPLES) {
    out.push({ file: `tempel-${t.number}-${t.id}.png`, title: `Tempel ${t.number}: ${t.name}`, canvas: sheet(`Tempel ${t.number}: ${t.name}`, ids((a) => a.temple === t.id)) });
  }
  out.push({ file: 'byar.png', title: 'Byarna', canvas: sheet('Byarna', ids((a) => a.kind === 'village')) });
  out.push({ file: 'stigar-och-grottor.png', title: 'Björkhagen, grottorna och epilogen', canvas: sheet('Björkhagen, grottorna och epilogen', ['bjorkhagen', 'tjuvgrottan', 'jattegrytan', 'epilog']) });
  return out;
}

// --- The page ----------------------------------------------------------------------

initSprites(SPRITES);
const main = document.getElementById('maps');
if (main) {
  const maps = allMaps();
  for (const m of maps) {
    const fig = document.createElement('figure');
    const cap = document.createElement('figcaption');
    const a = document.createElement('a');
    a.textContent = `${m.title} – ${m.file} (${m.canvas.width}×${m.canvas.height})`;
    a.download = m.file;
    a.href = m.canvas.toDataURL('image/png');
    cap.append(a);
    fig.append(cap, m.canvas);
    main.append(fig);
  }
  // For scripts that save the pictures: file name → PNG data URL.
  (window as unknown as { dagnyMaps: Record<string, string> }).dagnyMaps = Object.fromEntries(maps.map((m) => [m.file, m.canvas.toDataURL('image/png')]));
}
