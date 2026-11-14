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
  it('no door uses a letter that means something else (a creature like V, an item like T, M the cat, B a guardian, L a lock, X an altar, I a sign)', async () => {
    const { ENEMY_CHARS, PICKUP_CHARS } = await import('../src/data/legend');
    const taken = new Set(['M', 'B', 'L', 'X', ...Object.keys(ENEMY_CHARS), ...Object.keys(PICKUP_CHARS)]);
    for (const a of Object.values(AREAS)) {
      for (const k of Object.keys(a.doors ?? {})) {
        expect(taken.has(k), `${a.id}: door ${k}`).toBe(false);
        expect(Object.keys(a.signs ?? {}).includes(k), `${a.id}: door ${k} is also a sign`).toBe(false);
      }
    }
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

describe('the lesser guardians', () => {
  it('have their own music, not the great guardians\' song', async () => {
    const { SONGS } = await import('../src/audio/songs');
    expect(SONGS.mellanboss).toBeDefined();
    for (const id of ['krypta_sakristia', 'gruvan_verkstad']) expect(AREAS[id].sealed?.music, id).toBe('mellanboss');
  });
});

describe('the readings are needed on the way (3.1b)', () => {
  it('the mine is not entered without Eld, and not crossed without Lyse', () => {
    const noFire = playthrough({ withholdSpells: ['eld'] });
    expect(noFire.areas.has('gruvan_1')).toBe(true);
    expect(noFire.areas.has('gruvan_hall')).toBe(false);
    expect(noFire.finished).toBe(false);
    const noLight = playthrough({ withholdSpells: ['lyse'] });
    expect(noLight.areas.has('gruvan_3')).toBe(true);
    expect(noLight.areas.has('gruvan_4')).toBe(false);
    expect(noLight.finished).toBe(false);
  }, 60_000);
});

describe('extra lives are earned (3.1b)', () => {
  it('Måsskäret\'s doll is reached only with Hopp, and Jättegrytan is a deep kettle, not a short walk', () => {
    const all = playthrough();
    const noHopp = playthrough({ withholdSpells: ['hopp'] });
    const doll = [...all.lives].find((l) => l.includes('masskaret'))!;
    expect(doll).toBeDefined();
    expect(noHopp.lives.has(doll)).toBe(false);
    const jg = AREAS.jattegrytan;
    expect(jg.tiles.length).toBeGreaterThanOrEqual(16);
    expect(jg.tiles[0].length).toBeGreaterThanOrEqual(48);
    expect(jg.tiles.join('').split('j').length - 1, 'sjörå shooters').toBeGreaterThanOrEqual(2);
  }, 60_000);
});

describe('the mill: high water and low (fas 4, Kvarnen)', () => {
  it('the cellar and its key are reached only once the sluice is found, and the mill is not passed without them', () => {
    const all = playthrough();
    expect(all.areas.has('kvarnen_kallare')).toBe(true);
    const at = (kind: string, what: string): number => all.steps.findIndex((s) => s.kind === kind && s.what === what);
    expect(at('area', 'kvarnen_kallare')).toBeLessThan(at('area', 'kvarnen_3'));
    const noSluice = playthrough({ withholdFlags: ['kvarn_ratt_hittad'] });
    expect(noSluice.areas.has('kvarnen_2')).toBe(true);
    expect(noSluice.areas.has('kvarnen_kallare')).toBe(false);
    expect(noSluice.areas.has('kvarnen_3')).toBe(false);
  }, 60_000);

  it('Kvarnstugan has the sluice, the race and the floating logs; no hall with side rooms like the crypt and the mine', () => {
    const k = AREAS.kvarnen_2;
    expect(k.sluice).toBeDefined();
    expect(k.tiles.some((r) => r.includes(']'))).toBe(true);
    expect((k.platforms ?? []).filter((p) => p.float !== undefined).length).toBeGreaterThanOrEqual(2);
    // Variation between temples: the mill has no three-way hall.
    expect(Object.values(AREAS).some((a) => a.temple === 'kvarnen' && Object.keys(a.doors ?? {}).length >= 2)).toBe(false);
  });
});
