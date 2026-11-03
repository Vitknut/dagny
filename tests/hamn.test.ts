import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { SPELLS } from '../src/data/spells';
import type { AreaDef } from '../src/data/types';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Player, type PlayerControls } from '../src/entities/player';

/**
 * Coarse, physics-free model of a room: Dagny needs two open cells (she is
 * 22 px tall), the bird one. Locked doors count as walls (no key).
 */
function model(a: AreaDef, radio: boolean) {
  const t = a.tiles;
  const h = t.length;
  const w = t[0].length;
  const free = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && !(t[y][x] === '#' || t[y][x] === 'L' || (t[y][x] === '?' && !radio));
  const fits = (x: number, y: number): boolean => free(x, y) && free(x, y - 1);
  const exits: Array<[number, number]> = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = t[y][x];
      if (x === 0 || x === w - 1 || (/[A-Z@]/.test(ch) && !'LXBMT'.includes(ch))) exits.push([x, y]);
    }
  }
  const flood = (from: Array<[number, number]>, ok: (x: number, y: number) => boolean): Set<string> => {
    const seen = new Set<string>();
    const stack = [...from];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      const k = `${x},${y}`;
      if (seen.has(k) || !ok(x, y)) continue;
      seen.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return seen;
  };
  return { w, h, fits, free, exits, flood };
}

/** Cells the bird can reach where Dagny fits but from where she cannot walk to any exit. */
function traps(a: AreaDef, radio: boolean): string[] {
  const m = model(a, radio);
  const bird = m.flood(m.exits, m.free);
  const human = m.flood(m.exits.filter(([x, y]) => m.fits(x, y)), m.fits);
  const out: string[] = [];
  for (const k of bird) {
    const [x, y] = k.split(',').map(Number);
    if (m.fits(x, y) && !human.has(k)) out.push(k);
  }
  return out;
}

const temples = Object.values(AREAS).filter((a) => a.temple);

describe('Hamn – the bird form', () => {
  it('in no temple room can the bird leave Dagny where she cannot get out', () => {
    for (const a of temples) {
      for (const radio of [false, true]) expect(traps(a, radio), `${a.id} radio=${radio}`).toEqual([]);
    }
  });

  it('costs as much magic as Åska at most levels', () => {
    const hamn = SPELLS.hamn.cost;
    const aska = SPELLS.aska.cost;
    for (let i = 0; i < hamn.length; i++) {
      expect(hamn[i]).toBeGreaterThanOrEqual(aska[i]);
      for (const id of ['lakning', 'skydd', 'hopp', 'lyse', 'eld'] as const) expect(hamn[i]).toBeGreaterThan(SPELLS[id].cost[i]);
    }
  });

  it('cannot fly above the top of a room (no way round walls and gates)', () => {
    const w = 10;
    const h = 6;
    const kinds = new Uint8Array(w * h);
    for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
    const g: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
    const p = new Player();
    p.place(40, 40);
    p.enterBird();
    const up: PlayerControls = { left: false, right: false, up: true, down: false, jumpHeld: true, jumpPressed: false, swordPressed: false };
    let top = p.y;
    for (let i = 0; i < 300; i++) {
      p.update(up, g);
      top = Math.min(top, p.y);
    }
    expect(top).toBeGreaterThanOrEqual(0);
  });
});
