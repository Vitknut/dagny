/**
 * What happens when Dagny bumps into a creature on the overworld. Each
 * terrain type has its own table of fights (side-view areas, some at night
 * or in a storm). The weights in a table add up to 1.
 */
import { TERRAIN, type TerrainType } from './terrain';

export type { TerrainType } from './terrain';

/** Overworld terrain character → table (from data/terrain.ts). */
export const TERRAIN_TYPE: Readonly<Record<string, TerrainType>> = Object.fromEntries(
  Object.entries(TERRAIN).flatMap(([c, d]) => (d.encounter ? [[c, d.encounter]] : [])),
);

export interface EncounterOption {
  id: string;
  weight: number;
  area: string;
}

export const ENCOUNTER_TABLES: Readonly<Record<TerrainType, readonly EncounterOption[]>> = {
  ang: [
    { id: 'ang', weight: 0.45, area: 'mote_ang' },
    { id: 'rag', weight: 0.32, area: 'mote_ang2' },
    { id: 'ang_natt', weight: 0.23, area: 'mote_ang_natt' },
  ],
  skog: [
    { id: 'skog', weight: 0.45, area: 'mote_skog' },
    { id: 'granmo', weight: 0.32, area: 'mote_skog2' },
    { id: 'skog_storm', weight: 0.23, area: 'mote_skog_storm' },
  ],
  myr: [
    { id: 'myr', weight: 0.45, area: 'mote_myr' },
    { id: 'karr', weight: 0.32, area: 'mote_myr2' },
    { id: 'myr_natt', weight: 0.23, area: 'mote_myr_natt' },
  ],
  strand: [
    { id: 'strand', weight: 0.34, area: 'mote_strand' },
    { id: 'vass', weight: 0.27, area: 'mote_vass' },
    { id: 'klapper', weight: 0.23, area: 'mote_strand2' },
    { id: 'strand_storm', weight: 0.16, area: 'mote_strand_storm' },
  ],
  /** Rye fields: open ground, birds from above. */
  aker: [
    { id: 'rag', weight: 0.45, area: 'mote_ang2' },
    { id: 'hed', weight: 0.32, area: 'mote_hed' },
    { id: 'ang_natt', weight: 0.23, area: 'mote_ang_natt' },
  ],
  /** Heather moor, clear-cuts, slag heaps and sand pits: open and windswept. */
  hed: [
    { id: 'hed', weight: 0.51, area: 'mote_hed' },
    { id: 'rag', weight: 0.23, area: 'mote_ang2' },
    { id: 'skog_storm', weight: 0.26, area: 'mote_skog_storm' },
  ],
  /** The bare fell below Trollberget: the hardest meetings on the map. */
  fjall: [
    { id: 'fjall', weight: 0.57, area: 'mote_fjall' },
    { id: 'hed', weight: 0.23, area: 'mote_hed' },
    { id: 'skog_storm', weight: 0.2, area: 'mote_skog_storm' },
  ],
  /** Round the deserted crofts: vättar have moved in. */
  odetorp: [
    { id: 'odetorp', weight: 0.62, area: 'mote_odetorp' },
    { id: 'skog', weight: 0.23, area: 'mote_skog' },
    { id: 'ang_natt', weight: 0.15, area: 'mote_ang_natt' },
  ],
};
