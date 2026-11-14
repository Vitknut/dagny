import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { Kind, type TileGrid } from '../src/engine/collision';
import { spawnCritters, updateCritters } from '../src/game/side/critters';

/** A coarse grid from the tile letters: rock, platforms, spikes and water. */
function grid(id: string): TileGrid {
  const rows = AREAS[id].tiles;
  const h = rows.length;
  const w = rows[0].length;
  const kinds = new Uint8Array(w * h);
  rows.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      kinds[y * w + x] = ch === '#' ? Kind.Solid : ch === '=' ? Kind.OneWay : '^~n'.includes(ch) ? Kind.Hazard : Kind.Empty;
    }),
  );
  return { w, h, kinds, wallLeft: !AREAS[id].left, wallRight: !AREAS[id].right };
}

describe('small animals', () => {
  it('villages get hens and sparrows, forests a squirrel and a hare, temples and dark places none', () => {
    const kinds = (id: string): string[] => spawnCritters(AREAS[id], grid(id), []).map((c) => c.kind).sort();
    expect(kinds('kyrkbyn')).toEqual(['hona', 'hona', 'hona', 'sparv', 'sparv']);
    expect(kinds('mote_skog')).toEqual(['ekorre', 'hare']);
    expect(kinds('krypta_1')).toEqual([]);
    expect(kinds('tjuvgrottan')).toEqual([]);
    expect(kinds('arlskaret').every((k) => k === 'arla')).toBe(true);
  });

  it('keep still until Dagny comes close, then get out of the way (birds leave the room)', () => {
    const g = grid('kyrkbyn');
    const list = spawnCritters(AREAS.kyrkbyn, g, []);
    const bird = list.find((c) => c.kind === 'sparv')!;
    const far = { x: bird.x + 400, y: bird.y - 10 };
    for (let i = 0; i < 60; i++) updateCritters(list, g, far, 0);
    expect(list).toContain(bird);
    expect(bird.state).toBe(0);
    const near = { x: bird.x - 10, y: bird.y - 10 };
    for (let i = 0; i < 400; i++) updateCritters(list, g, near, 0);
    expect(list).not.toContain(bird);
  });

  it('a squirrel only climbs a real tree; with none near it runs off along the ground', () => {
    const area = { ...AREAS.mote_skog, props: [], critters: [{ kind: 'ekorre' as const, tx: 10, ty: AREAS.mote_skog.tiles.findIndex((r, y) => r[10] === '.' && AREAS.mote_skog.tiles[y + 1]?.[10] === '#') }] };
    const g = grid('mote_skog');
    const bare = spawnCritters(area, g, []);
    const sq = bare[0];
    const ground = sq.y;
    for (let i = 0; i < 200 && bare.length; i++) {
      updateCritters(bare, g, { x: sq.x - 20, y: sq.y - 10 }, -1000);
      expect(sq.y).toBe(ground);
    }

    const tx = 14;
    const ty = area.critters[0].ty;
    const treed = spawnCritters({ ...area, props: [{ sprite: 'spruce', tx, ty }] }, g, []);
    const sq2 = treed[0];
    let climbed = false;
    for (let i = 0; i < 200 && treed.length; i++) {
      updateCritters(treed, g, { x: sq2.x - 20, y: sq2.y - 10 }, -1000);
      if (sq2.y < ground - 4) {
        climbed = true;
        expect(sq2.x).toBe(tx * 16 + 11);
      }
    }
    expect(climbed).toBe(true);
    expect(treed).not.toContain(sq2);
  });
});


describe('animals never go through walls', () => {
  it('a squirrel with no tree, a hare and a sparrow fleeing at a wall stay out of the rock', async () => {
    const { updateCritters, spawnCritters } = await import('../src/game/side/critters');
    const { Kind, kindAt } = await import('../src/engine/collision');
    const w = 30;
    const h = 12;
    const kinds = new Uint8Array(w * h);
    for (let x = 0; x < w; x++) for (const y of [10, 11]) kinds[y * w + x] = Kind.Solid;
    // A wall to the right, floor to ceiling.
    for (let y = 0; y < 10; y++) kinds[y * w + 20] = Kind.Solid;
    const grid = { w, h, kinds, wallLeft: true, wallRight: true };
    const area = { id: 'test', tiles: Array.from({ length: h }, () => '.'.repeat(w)), critters: [{ kind: 'ekorre', tx: 15, ty: 9 }, { kind: 'hare', tx: 16, ty: 9 }, { kind: 'sparv', tx: 17, ty: 9 }] };
    const list = spawnCritters(area as never, grid as never, []);
    // Dagny walks in from the left: they all flee right, towards the wall.
    for (let i = 0; i < 400; i++) {
      updateCritters(list, grid as never, { x: Math.min(19 * 16, 12 * 16 + i * 0.5), y: 9 * 16 }, 0);
      for (const c of list) expect(kindAt(grid as never, Math.floor(c.x / 16), Math.floor((c.y - 4) / 16)), `${c.kind} at step ${i}`).not.toBe(Kind.Solid);
    }
  });
});
