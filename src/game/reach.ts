import { AREAS } from '../data/areas';
import { OVERWORLD } from '../data/overworld';
import { TERRAIN } from '../data/terrain';
import { TEMPLES } from '../data/temples';
import type { GameState } from './state';

const PASSAGES = new Map<string, { x: number; y: number }>(OVERWORLD.places.flatMap((p) => (p.leadsTo ? [[`${p.x},${p.y}`, p.leadsTo]] : [])));

/** Overworld tiles Dagny can walk to from the start with these items (never onto `closed`). */
export function reachableTiles(items: readonly string[], closed?: ReadonlySet<string>): Set<string> {
  const have = new Set(items);
  const t = OVERWORLD.tiles;
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
  const ok = reachableTiles(s.items);
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
