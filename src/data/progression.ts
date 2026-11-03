import type { StatId } from './types';

/** Highest level for Styrka, Magi and Liv. */
export const MAX_LEVEL = 12;

/** The level cap before version 1.1 (saves from then are converted). */
export const OLD_MAX_LEVEL = 8;

/**
 * Rising XP curve: the XP needed to raise a stat from level n to n+1 is
 * COSTS[stat][n − 1]. Raising a level spends all the XP (it starts again from 0,
 * as in Zelda II), so waiting to save up for a dearer level is a real choice.
 */
export const COSTS: Readonly<Record<StatId, readonly number[]>> = {
  styrka: [80, 180, 320, 500, 750, 1050, 1450, 1900, 2450, 3100, 3900],
  magi: [60, 140, 260, 420, 620, 880, 1200, 1600, 2100, 2700, 3400],
  liv: [60, 140, 260, 420, 620, 880, 1200, 1600, 2100, 2700, 3400],
};

/** Sword damage per Styrka level. */
export const SWORD_DAMAGE = [2, 2, 3, 4, 4, 5, 6, 7, 8, 10, 11, 12];
/** Max health per Liv level (one point = half a heart segment on the HUD). */
export const MAX_HP = [8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 22, 24];
/** Extra max health per life container ("livbehållare"), on top of the Liv level. */
export const CONTAINER_HP = 2;
/** Extra max magic per magic container ("magibehållare"), on top of the Magi level. */
export const CONTAINER_MP = 1;
/** Max magic per Magi level. */
export const MAX_MP = [4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11, 12];

export const STAT_NAMES: Readonly<Record<StatId, string>> = {
  styrka: 'Styrka',
  magi: 'Magi',
  liv: 'Liv',
};

/** Converts a level from the old 8-step scale to the 12-step one (8 → 12). */
export function convertOldLevel(old: number): number {
  const l = Math.max(1, Math.min(OLD_MAX_LEVEL, Math.floor(old)));
  return Math.round(((l - 1) * (MAX_LEVEL - 1)) / (OLD_MAX_LEVEL - 1)) + 1;
}
