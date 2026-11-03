import type { SkillId, SpellId } from '../data/types';
import type { Levels } from './progression';
import { maxHp, maxMp } from './progression';
import { CONTAINER_HP, CONTAINER_MP } from '../data/progression';
import { OVERWORLD } from '../data/overworld';
import { SPELLS } from '../data/spells';

/** Where Dagny is: a side-view area or the overworld. */
export interface Location {
  area: string; // area id or 'overworld'
  x: number;
  y: number;
}

export interface GameState {
  hp: number;
  mp: number;
  xp: number;
  levels: Levels;
  spells: SpellId[];
  selectedSpell: SpellId | null;
  skills: SkillId[];
  items: string[];
  /** Unused keys per temple id. */
  keys: Record<string, number>;
  flags: string[];
  /** Persisted world changes: opened doors, picked keys, lit candles ("area:x,y"). */
  opened: string[];
  /** Current position (saved exactly so "Fortsätt" returns here). */
  loc: Location;
  /** Overworld tile (where to return to). */
  ow: { x: number; y: number };
  /** Village to wake up in after a defeat. */
  lastVillage: string;
  /** Latest temple checkpoint (lit candle). */
  checkpoint: Location | null;
  playTime: number;
  /** Life and magic containers found, as "liv:<id>" / "magi:<id>" (each counts once). */
  containers: string[];
  /** Tries left before Game Over (Zelda II style). */
  lives: number;
  /** Overworld tiles seen so far, as a bit set (see game/explored.ts). */
  explored: string;
}

/** Lives at the start and after a Game Over. */
export const START_LIVES = 3;
/** No more than this many lives can be held at once. */
export const MAX_LIVES = 9;

export type ContainerKind = 'liv' | 'magi';

export function newGame(): GameState {
  const levels: Levels = { styrka: 1, magi: 1, liv: 1 };
  return {
    hp: maxHp(1),
    mp: maxMp(1),
    xp: 0,
    levels,
    spells: [],
    selectedSpell: null,
    skills: [],
    items: [],
    keys: {},
    flags: [],
    opened: [],
    loc: { area: 'mormors_by', x: 9 * 16 - 8, y: 10 * 16 - 24 },
    ow: { ...OVERWORLD.start },
    lastVillage: 'mormors_by',
    checkpoint: null,
    playTime: 0,
    containers: [],
    lives: START_LIVES,
    explored: '',
  };
}

export function hasFlag(s: GameState, f: string): boolean {
  return s.flags.includes(f);
}

export function setFlag(s: GameState, f: string): void {
  if (!s.flags.includes(f)) s.flags.push(f);
}

export function hasItem(s: GameState, id: string): boolean {
  return s.items.includes(id);
}

export function containerCount(s: GameState, kind: ContainerKind): number {
  return s.containers.filter((c) => c.startsWith(`${kind}:`)).length;
}

/** Max health: the Liv level plus every life container found. */
export function hpMax(s: GameState): number {
  return maxHp(s.levels.liv) + CONTAINER_HP * containerCount(s, 'liv');
}

/** Max magic: the Magi level plus every magic container found. */
export function mpMax(s: GameState): number {
  return maxMp(s.levels.magi) + CONTAINER_MP * containerCount(s, 'magi');
}

/**
 * What a reading costs Dagny now. Never more than she can hold: a costly
 * reading (Åska, Hamn) can always be cast on a full bar, so a place that needs
 * one never shuts her out for want of magic containers.
 */
export function spellCost(s: GameState, id: SpellId): number {
  const c = SPELLS[id].cost;
  return Math.min(c[s.levels.magi - 1] ?? c[0], mpMax(s));
}

/**
 * Takes a container (id unique per container). Fills the bar it raises.
 * Returns false if this container was already taken – each counts only once.
 */
export function addContainer(s: GameState, kind: ContainerKind, id: string): boolean {
  const key = `${kind}:${id}`;
  if (s.containers.includes(key)) return false;
  s.containers.push(key);
  if (kind === 'liv') s.hp = hpMax(s);
  else s.mp = mpMax(s);
  return true;
}

export function hasContainer(s: GameState, kind: ContainerKind, id: string): boolean {
  return s.containers.includes(`${kind}:${id}`);
}
