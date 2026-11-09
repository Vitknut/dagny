import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { makeTrial, updateTrial } from '../src/game/side/trial';
import { newGame } from '../src/game/state';

const area = AREAS.prastgardens_vind;
const t = area.candleTrial!;
const at = (sign: string) => {
  const c = t.candles.find((x) => x.sign === sign)!;
  return { x: c.tx * 16 + 3, y: c.ty * 16 - 6, w: 10, h: 22 };
};
const away = { x: -100, y: -100, w: 10, h: 22 };

describe("Prosten's trial of candles", () => {
  it('does nothing until he has asked', () => {
    const s = newGame();
    const tr = makeTrial(area, s)!;
    expect(updateTrial(tr, area, s, at(t.order[0]), true)).toBeNull();
    expect(tr.candles.every((c) => !c.lit)).toBe(true);
  });

  it('a wrong candle puts every flame out; the right order finishes it', () => {
    const s = newGame();
    s.flags.push(t.requires);
    const tr = makeTrial(area, s)!;
    expect(updateTrial(tr, area, s, at(t.order[0]), true)).toBe('lit');
    updateTrial(tr, area, s, away, true);
    expect(updateTrial(tr, area, s, at(t.order[2]), true)).toBe('wrong');
    expect(tr.candles.every((c) => !c.lit)).toBe(true);
    for (let i = 0; i < 50; i++) updateTrial(tr, area, s, away, true);
    let last = null;
    for (const sign of t.order) {
      last = updateTrial(tr, area, s, at(sign), true);
      updateTrial(tr, area, s, away, true);
    }
    expect(last).toBe('done');
    expect(s.flags).toContain(t.flag);
  });

  it('the bird lights nothing', () => {
    const s = newGame();
    s.flags.push(t.requires);
    const tr = makeTrial(area, s)!;
    expect(updateTrial(tr, area, s, at(t.order[0]), false)).toBeNull();
  });
});
