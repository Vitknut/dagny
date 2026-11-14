import { AREAS } from '../data/areas';
import { OVERWORLD } from '../data/overworld';
import { TERRAIN } from '../data/terrain';
import { TEMPLES } from '../data/temples';
import type { GameState } from './state';

const PASSAGES = new Map<string, { x: number; y: number }>(OVERWORLD.places.flatMap((p) => (p.leadsTo ? [[`${p.x},${p.y}`, p.leadsTo]] : [])));

/**
 * Overworld tiles Dagny can walk to from the start with these items (never
 * onto `closed`). With `flags`, tiles mended by them count as they now stand
 * (the rebuilt bridge, a thicket burnt with Eld).
 */
export function reachableTiles(items: readonly string[], closed?: ReadonlySet<string>, flags?: readonly string[] | ReadonlySet<string>): Set<string> {
  const have = new Set(items);
  const set = new Set(flags ?? []);
  const t = (OVERWORLD.mended ?? []).some((m) => set.has(m.flag)) ? mendedTiles(set) : OVERWORLD.tiles;
  const seen = new Set<string>();
  const stack: Array<[number, number]> = [[OVERWORLD.start.x, OVERWORLD.start.y]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    const k = `${x},${y}`;
    const ch = t[y]?.[x];
    // Quagmire never holds: it is a wall in the marsh maze.
    if (!ch || seen.has(k) || OVERWORLD.blocked.includes(ch) || TERRAIN[ch]?.sink || closed?.has(k)) continue;
    const need = OVERWORLD.needs[ch];
    if (need && !have.has(need)) continue;
    seen.add(k);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    // Through a passage to where it comes out.
    const to = PASSAGES.get(k);
    if (to) stack.push([to.x, to.y]);
  }
  return seen;
}

/** The map's rows with these flags' mended tiles in place. */
function mendedTiles(flags: ReadonlySet<string>): string[] {
  const rows = [...OVERWORLD.tiles];
  for (const m of OVERWORLD.mended ?? []) {
    if (flags.has(m.flag)) rows[m.y] = rows[m.y].slice(0, m.x) + m.ch + rows[m.y].slice(m.x + 1);
  }
  return rows;
}

/** The overworld place a side-view area belongs to (temples by their entrance). */
export function placeOfArea(areaId: string): { x: number; y: number } | null {
  const direct = OVERWORLD.places.find((p) => p.area === areaId);
  if (direct) return direct;
  if (areaId === 'epilog') return OVERWORLD.places.find((p) => p.area === 'mormors_by') ?? null;
  const temple = AREAS[areaId]?.temple;
  const entry = temple ? TEMPLES.find((x) => x.id === temple)?.entryArea : null;
  return entry ? OVERWORLD.places.find((p) => p.area === entry) ?? null : null;
}

/**
 * Makes sure a loaded game never leaves Dagny somewhere she can't get out of
 * with the treasures she carries (e.g. after the map was rebuilt). Anything
 * out of reach – where she stands, the village she wakes in, her checkpoint –
 * goes back home to Mormors by. Returns true if something was moved.
 */
export function repairReach(s: GameState): boolean {
  const ok = reachableTiles(s.items, undefined, s.flags);
  const reachable = (p: { x: number; y: number } | null): boolean => !!p && ok.has(`${p.x},${p.y}`);
  let moved = false;
  if (!reachable(placeOfArea(s.lastVillage))) {
    s.lastVillage = 'mormors_by';
    moved = true;
  }
  if (s.checkpoint && !reachable(placeOfArea(s.checkpoint.area))) {
    s.checkpoint = null;
    moved = true;
  }
  const here = s.loc.area === 'overworld' ? { x: s.ow.x, y: s.ow.y } : placeOfArea(s.loc.area);
  // Encounter areas have no place of their own: they return to s.ow.
  const atOw = s.loc.area !== 'overworld' && !placeOfArea(s.loc.area) ? { x: s.ow.x, y: s.ow.y } : here;
  if (!reachable(atOw) || !ok.has(`${s.ow.x},${s.ow.y}`)) {
    s.loc = { area: 'mormors_by', x: -1, y: -1 };
    s.ow = { ...OVERWORLD.start };
    moved = true;
  }
  return moved;
}

/** The treasures that open the regions, in order (the boat opens the second region). */
const REGION_KEYS = ['eka', 'karbidlampa', 'stovlar', 'ficklampa', 'radio'];
let tierGrid: number[][] | null = null;

/**
 * How deep in the game a tile on the map lies, 1–6: the number of the temple
 * whose region it is in (the home valley is 1, the highlands 6). Regions open
 * in temple order, so this is also how strong Dagny is expected to be there.
 */
export function tierAt(x: number, y: number): number {
  if (!tierGrid) {
    const out = OVERWORLD.tiles.map((row) => [...row].map(() => 0));
    for (let k = 0; k <= REGION_KEYS.length; k++) {
      for (const key of reachableTiles(REGION_KEYS.slice(0, k))) {
        const [tx, ty] = key.split(',').map(Number);
        if (!out[ty][tx]) out[ty][tx] = k + 1;
      }
    }
    tierGrid = out;
  }
  return tierGrid[y]?.[x] || 1;
}

let areaTiers: Map<string, number> | null = null;

/**
 * The tier of a room: a temple's own number; otherwise the tier of the map
 * tile its way in lies on, carried on through the rooms behind it. Meetings
 * on the map are shared by every region and take the tier where they start.
 */
export function areaTier(areaId: string): number {
  const a = AREAS[areaId];
  if (!a) return 1;
  const temple = a.temple ? TEMPLES.find((t) => t.id === a.temple) : undefined;
  if (temple) return temple.number;
  if (!areaTiers) {
    areaTiers = new Map();
    const queue: string[] = [];
    for (const p of OVERWORLD.places) {
      if (!p.area) continue;
      const tier = tierAt(p.x, p.y);
      if ((areaTiers.get(p.area) ?? 99) > tier) {
        areaTiers.set(p.area, tier);
        queue.push(p.area);
      }
    }
    while (queue.length) {
      const id = queue.shift()!;
      const room = AREAS[id];
      const tier = areaTiers.get(id)!;
      for (const ex of [room?.left, room?.right, ...Object.values(room?.doors ?? {})]) {
        const to = ex?.to;
        if (!to || to === 'overworld' || AREAS[to]?.temple || AREAS[to]?.kind === 'encounter') continue;
        if ((areaTiers.get(to) ?? 99) > tier) {
          areaTiers.set(to, tier);
          queue.push(to);
        }
      }
    }
  }
  return areaTiers.get(areaId) ?? 1;
}

