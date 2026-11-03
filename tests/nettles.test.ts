import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { kindOf } from '../src/data/legend';
import { Kind, TILE, touchesKind, type TileGrid } from '../src/engine/collision';
import { Player, type PlayerControls } from '../src/entities/player';

function gridOf(tiles: string[]): TileGrid {
  const h = tiles.length;
  const w = tiles[0].length;
  const kinds = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) kinds[y * w + x] = kindOf(tiles[y][x]);
  return { w, h, kinds, wallLeft: true, wallRight: true };
}

/** Every patch of nettles on a floor, as [first column, last column, floor row]. */
function nettlePatches(tiles: string[]): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  tiles.forEach((row, y) => {
    for (const m of row.matchAll(/n+/g)) out.push([m.index!, m.index! + m[0].length - 1, y]);
  });
  return out;
}

describe('nettles', () => {
  it('every nettle patch can be cleared with an ordinary running jump (with room to spare)', () => {
    for (const a of Object.values(AREAS)) {
      const grid = gridOf(a.tiles);
      for (const [x0, x1, row] of nettlePatches(a.tiles)) {
        // Run at the patch from the left and jump this many pixels before its edge.
        for (const early of [0, 4, 8]) {
          // Start on the firm ground just before the patch (up to three tiles of run-up).
          let start = x0 - 1;
          while (start > x0 - 3 && kindOf(a.tiles[row][start - 1]) === Kind.Solid && kindOf(a.tiles[row - 1][start - 1]) === Kind.Empty) start--;
          const p = new Player();
          p.place(start * TILE, row * TILE - 22);
          const run: PlayerControls = { left: false, right: true, up: false, down: false, jumpHeld: false, jumpPressed: false, swordPressed: false };
          let jumped = false;
          let stung = false;
          for (let i = 0; i < 240; i++) {
            const jumpNow = !jumped && p.x + p.w >= x0 * TILE - early;
            if (jumpNow) jumped = true;
            p.update({ ...run, jumpPressed: jumpNow, jumpHeld: jumped && i < 400 }, grid);
            if (touchesKind(grid, p, Kind.Hazard)) stung = true;
            if (p.x > (x1 + 2) * TILE && p.onGround) break;
          }
          expect(stung, `${a.id} nettles ${x0}–${x1}, jumping ${early}px early`).toBe(false);
        }
      }
    }
  });
});
