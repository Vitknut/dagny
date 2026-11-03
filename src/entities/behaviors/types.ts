import type { Enemy, HitHeight } from '../enemy';
import type { WorldApi } from '../types';

/** What a creature senses each step (one shared object, refilled every update). */
export interface Sense {
  /** Dagny's centre. */
  p: { x: number; y: number };
  /** The creature's own centre. */
  cx: number;
  cy: number;
  /** Horizontal distance to Dagny, signed, and its size. */
  dx: number;
  dist: number;
  /** The creature's speed (EnemyDef.speed). */
  sp: number;
}

/**
 * One way of moving and fighting. Creatures in data/enemies.ts pick one by
 * name (EnemyDef.behavior); a new creature can reuse any of them.
 */
export interface Behavior {
  /** One step of thinking and moving. */
  update(e: Enemy, world: WorldApi, s: Sense): void;
  /**
   * Whether a sword strike at this height is parried. Returns how hard the
   * creature is pushed back and how long it can't be hit again, or null.
   */
  blocks?(e: Enemy, height: HitHeight): { push: number; iframes: number } | null;
}
