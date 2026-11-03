import { COSTS, MAX_HP, MAX_LEVEL, MAX_MP, SWORD_DAMAGE } from '../data/progression';
import type { StatId } from '../data/types';

export type Levels = Record<StatId, number>;

/** XP needed to raise `stat` from its current level, or null at max level. */
export function nextCost(stat: StatId, level: number): number | null {
  if (level >= MAX_LEVEL) return null;
  return COSTS[stat][level - 1] ?? null;
}

/** Stats that can be raised right now with the XP available. */
export function affordable(xp: number, levels: Levels): StatId[] {
  return (Object.keys(levels) as StatId[]).filter((s) => {
    const c = nextCost(s, levels[s]);
    return c !== null && xp >= c;
  });
}

export function canLevelUp(xp: number, levels: Levels): boolean {
  return affordable(xp, levels).length > 0;
}

/**
 * Raises a stat if affordable. Like Zelda II, every raise spends all the XP:
 * the counter starts again from 0, whatever was left over. Returns the XP
 * after (unchanged if the stat could not be raised).
 */
export function raise(xp: number, levels: Levels, stat: StatId): number {
  const c = nextCost(stat, levels[stat]);
  if (c === null || xp < c) return xp;
  levels[stat] += 1;
  return 0;
}

/** Cheapest XP target across all stats (for the HUD), or null if all are maxed. */
export function nextTarget(levels: Levels): number | null {
  let best: number | null = null;
  for (const s of Object.keys(levels) as StatId[]) {
    const c = nextCost(s, levels[s]);
    if (c !== null && (best === null || c < best)) best = c;
  }
  return best;
}

const clampLevel = (l: number): number => Math.max(1, Math.min(MAX_LEVEL, Math.floor(l)));

/** The smith's work and the silver fitting each add one point to the sword. */
export const SWORD_UPGRADES = ['klingaHardad', 'klingaBlank', 'silverbeslag'] as const;

export function swordDamage(styrka: number, items: readonly string[] = []): number {
  return SWORD_DAMAGE[clampLevel(styrka) - 1] + SWORD_UPGRADES.filter((u) => items.includes(u)).length;
}
export function maxHp(liv: number): number {
  return MAX_HP[clampLevel(liv) - 1];
}
export function maxMp(magi: number): number {
  return MAX_MP[clampLevel(magi) - 1];
}

/** Damage after "lugnt läge" and the Skydd spell. Always at least 1. */
export function damageTaken(base: number, calm: boolean, shielded: boolean): number {
  let d = base;
  if (calm) d /= 2;
  if (shielded) d /= 2;
  return Math.max(1, Math.round(d));
}
