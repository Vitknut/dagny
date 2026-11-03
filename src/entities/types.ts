import type { Rect, TileGrid } from '../engine/collision';
import type { PuffKind } from '../data/types';

/** What entities may ask of the side-view world they live in. */
export interface WorldApi {
  readonly grid: TileGrid;
  readonly frame: number;
  /** Player hitbox centre & state, for AI. */
  playerCenter(): { x: number; y: number };
  playerBox(): Rect;
  playerDucking(): boolean;
  spawnProjectile(p: ProjectileInit): void;
  puff(x: number, y: number, kind: PuffKind): void;
  sparks(x: number, y: number): void;
  sfx(id: string): void;
  shake(frames: number, strength?: number): void;
  /** A gust that pushes Dagny sideways by dx per step for `frames` steps. */
  gust(dx: number, frames: number): void;
  /** Calls up a creature (by enemy id) standing at px/py; false if the room is full. */
  spawnEnemy(id: string, px: number, py: number): boolean;
  /** Live creatures in the room besides the boss. */
  minions(): number;
  /** Lyse is burning: the room is light, and nothing can hide in the fog. */
  lit(): boolean;
}

export interface ProjectileInit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  sprite: string;
  damage: number;
  fromPlayer: boolean;
  /** Frames to live. */
  life: number;
  gravity?: number;
  /** Passes through walls. */
  ghost?: boolean;
  /** Steps before it becomes active (shown as a warning until then). */
  delay?: number;
}
