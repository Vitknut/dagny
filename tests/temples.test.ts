import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { TEMPLES } from '../src/data/temples';
import { playthrough } from '../src/tools/playthrough';

/** Fas 4: temples as nets, each with a tool found inside that opens the rest. */
describe('the mine as a net (the pilot)', () => {
  const mine = TEMPLES.find((t) => t.id === 'gruvan')!;

  it('the landing leads three ways: the workshop, the ore drift and the lift shaft', () => {
    const hall = AREAS.gruvan_hall;
    const to = [hall.right?.to, ...Object.values(hall.doors ?? {}).map((d) => d.to)];
    expect(to.sort()).toEqual(['gruvan_2', 'gruvan_malm', 'gruvan_verkstad']);
    expect(hall.tiles.some((r) => r.includes('c')), 'a candle in the hall').toBe(true);
  });

  it('the crank lies in the workshop, behind a lesser guardian in a sealed room', () => {
    expect(mine.tool).toBe('hissvev');
    const w = AREAS.gruvan_verkstad;
    expect(w.sealed).toBeDefined();
    expect(w.finds?.find((f) => f.item === 'hissvev')?.after).toBe('gruvan_verkstad_rensad');
  });

  it('every lift in the shaft needs the crank', () => {
    const lifts = AREAS.gruvan_2.platforms ?? [];
    expect(lifts.length).toBeGreaterThan(0);
    for (const p of lifts) expect(p.needs).toBe('hissvev');
  });

  it('the game is finished with it, and without the crank the guardian is never reached', () => {
    expect(playthrough().finished).toBe(true);
    const without = playthrough({ withhold: ['hissvev'] });
    expect(without.areas.has('gruvan_hall')).toBe(true);
    expect(without.areas.has('gruvan_4')).toBe(false);
    expect(without.finished).toBe(false);
  }, 30_000);

  it('the crank is found before the shaft is ridden down, and the ore drift is visited too (its key opens the shaft)', () => {
    const run = playthrough();
    const at = (kind: string, what: string): number => run.steps.findIndex((s) => s.kind === kind && s.what === what);
    expect(at('item', 'hissvev')).toBeGreaterThanOrEqual(0);
    expect(at('area', 'gruvan_malm')).toBeGreaterThanOrEqual(0);
    expect(at('item', 'hissvev')).toBeLessThan(at('area', 'gruvan_3'));
  }, 30_000);
});

describe('door letters', () => {
  it('no door uses a letter that means something else (M the cat, T a thermos, B a guardian, L a lock, X an altar)', () => {
    for (const a of Object.values(AREAS)) for (const k of Object.keys(a.doors ?? {})) expect('MTBLX'.includes(k), `${a.id}: door ${k}`).toBe(false);
  });
});
