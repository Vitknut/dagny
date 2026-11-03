import { describe, expect, it } from 'vitest';
import { OVERWORLD } from '../src/data/overworld';
import { SEE_X, SEE_Y, exploredBounds, isExplored, markExplored } from '../src/game/explored';
import { deserialize, serialize } from '../src/game/save';
import { newGame } from '../src/game/state';

describe('the map remembers what Dagny has seen', () => {
  it('nothing is seen in a new game until Dagny looks around', () => {
    const s = newGame();
    expect(exploredBounds(s)).toBeNull();
    markExplored(s, 12, 45);
    expect(isExplored(s, 12, 45)).toBe(true);
    expect(isExplored(s, 12 + SEE_X, 45 + SEE_Y)).toBe(true);
    expect(isExplored(s, 12 + SEE_X + 1, 45)).toBe(false);
    expect(isExplored(s, 70, 6)).toBe(false);
    expect(exploredBounds(s)).toEqual({ x0: 12 - SEE_X, y0: 45 - SEE_Y, x1: 12 + SEE_X, y1: 45 + SEE_Y });
  });

  it('is kept in the save, compactly', () => {
    const s = newGame();
    markExplored(s, 12, 45);
    markExplored(s, 60, 41);
    const back = deserialize(serialize(s))!.state;
    expect(isExplored(back, 60, 41)).toBe(true);
    expect(isExplored(back, 40, 25)).toBe(false);
    // The whole map seen still fits in about 1,150 characters (one bit per tile).
    for (let y = 0; y < OVERWORLD.tiles.length; y += 5) for (let x = 0; x < OVERWORLD.tiles[0].length; x += 10) markExplored(s, x, y);
    expect(s.explored.length).toBeLessThanOrEqual(1200);
  });

  it('saves from before it existed start with what Dagny must have seen', () => {
    const s = newGame();
    s.flags.push('krypta_klar');
    const old = JSON.parse(serialize(s));
    delete old.state.explored;
    const back = deserialize(JSON.stringify(old))!.state;
    const church = OVERWORLD.places.find((p) => p.area === 'krypta_1')!;
    expect(isExplored(back, back.ow.x, back.ow.y)).toBe(true);
    expect(isExplored(back, church.x, church.y)).toBe(true);
  });

  it('a broken value never breaks the game', () => {
    const s = newGame();
    const raw = JSON.parse(serialize(s));
    raw.state.explored = '<script>!!';
    const back = deserialize(JSON.stringify(raw))!.state;
    expect(back.explored).toMatch(/^[A-Za-z0-9_-]*$/);
  });
});
