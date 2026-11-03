import { describe, expect, it } from 'vitest';
import { MovingPlatform } from '../src/entities/platform';

describe('a mine cart (ride platform)', () => {
  const def = { kind: 'cart' as const, tx: 18, ty: 9, toTx: 35, toTy: 9, mode: 'ride' as const };

  it('carries Dagny across only while she rides it', () => {
    const c = new MovingPlatform(def, 0);
    const x0 = c.x;
    for (let i = 0; i < 30; i++) c.update(false, null);
    expect(c.x).toBe(x0);
    for (let i = 0; i < 400; i++) c.update(true, null);
    expect(c.x).toBe(35 * 16);
  });

  it('comes back for her when she falls and waits on the starting bank', () => {
    const c = new MovingPlatform(def, 0);
    for (let i = 0; i < 400; i++) c.update(true, null);
    expect(c.x).toBe(35 * 16);
    // She is back on the left bank (after the spikes) and stands there.
    for (let i = 0; i < 600; i++) c.update(false, 10 * 16);
    expect(c.x).toBe(18 * 16);
    // And it takes her across again.
    for (let i = 0; i < 400; i++) c.update(true, null);
    expect(c.x).toBe(35 * 16);
  });

  it('stays put while she stands near the end where it is', () => {
    const c = new MovingPlatform(def, 0);
    for (let i = 0; i < 400; i++) c.update(true, null);
    for (let i = 0; i < 600; i++) c.update(false, 37 * 16);
    expect(c.x).toBe(35 * 16);
  });
});
