import type { EncounterOption } from '../data/encounters';

/**
 * Picks an option by weight, never the same as last time when there is a
 * choice. `rnd` is a number in [0, 1).
 */
export function pickEncounter(options: readonly EncounterOption[], rnd: number, lastId: string | null): EncounterOption {
  const pool = options.length > 1 && lastId !== null ? options.filter((o) => o.id !== lastId) : options;
  const total = pool.reduce((s, o) => s + o.weight, 0);
  let r = rnd * total;
  for (const o of pool) {
    r -= o.weight;
    if (r < 0) return o;
  }
  return pool[pool.length - 1];
}
