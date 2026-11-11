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

describe('the crypt as a net', () => {
  it('Gravkoret leads to the sacristy, the ossuary and – past loose stones – the vaults', () => {
    const hall = AREAS.krypta_hall;
    const to = [hall.right?.to, ...Object.values(hall.doors ?? {}).map((d) => d.to)];
    expect(to.sort()).toEqual(['krypta_2', 'krypta_benhus', 'krypta_sakristia']);
    expect(hall.tiles.some((r) => r.includes('c')), 'a candle').toBe(true);
    expect(hall.tiles.some((r) => r.includes('}')), 'loose stones').toBe(true);
    expect(TEMPLES.find((t) => t.id === 'krypta')!.tool).toBe('spett');
    expect(AREAS.krypta_sakristia.sealed).toBeDefined();
    expect(AREAS.krypta_sakristia.finds?.find((f) => f.item === 'spett')?.after).toBe('krypta_sakristia_rensad');
  });

  it('without the crowbar, or without Nedåtstöt, the crypt is never done', () => {
    expect(playthrough().flags.has('krypta_klar')).toBe(true);
    const noBar = playthrough({ withhold: ['spett'] });
    expect(noBar.areas.has('krypta_hall')).toBe(true);
    expect(noBar.areas.has('krypta_2')).toBe(false);
    expect(noBar.flags.has('krypta_klar')).toBe(false);
    const noThrust = playthrough({ withholdSkills: ['nedatstot'] });
    expect(noThrust.areas.has('krypta_4')).toBe(true);
    expect(noThrust.flags.has('krypta_klar')).toBe(false);
  }, 30_000);
});

describe('Grimmen floating is struck only from above', async () => {
  const { Enemy } = await import('../src/entities/enemy');
  const { BOSSES } = await import('../src/data/enemies');
  const { stubWorld } = await import('./helpers/world');

  it('in his second phase a blow from the side glances off, a thrust from above bites', () => {
    const w = stubWorld({ w: 30, h: 12, player: { x: 60, y: 165 } });
    const g = new Enemy(BOSSES.grim, 240, 176);
    g.awake = true;
    expect(g.takeHit(2, 100, 'high', w)).toBe('hit');
    g.iframes = 0;
    g.phase = 1;
    expect(g.takeHit(2, 100, 'high', w)).toBe('blocked');
    g.iframes = 0;
    expect(g.takeHit(2, 100, 'fire', w)).toBe('blocked');
    g.iframes = 0;
    expect(g.takeHit(2, 100, 'down', w)).toBe('hit');
  });
});
