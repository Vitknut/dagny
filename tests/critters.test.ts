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
});
