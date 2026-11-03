import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { DIALOG } from '../src/data/dialog';
import { ITEMS } from '../src/data/items';
import { NPCS } from '../src/data/npcs';
import { OVERWORLD } from '../src/data/overworld';
import { SKILLS, SPELLS } from '../src/data/spells';
import { TEMPLES } from '../src/data/temples';
import type { Condition } from '../src/data/types';
import { playthrough, walkthroughMarkdown } from '../src/tools/playthrough';
import { placeOfArea, reachableTiles } from '../src/game/reach';

/**
 * The whole game, played logically from a new game to the credits (see
 * src/tools/playthrough.ts). `npm run walkthrough` also writes the result
 * to docs/genomspelning.md.
 */
const run = playthrough();
const all = playthrough({ meetings: true });
const sources = import.meta.glob('../src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

if (process.env.WALKTHROUGH) writeFileSync(new URL('../docs/genomspelning.md', import.meta.url), walkthroughMarkdown(run));

/** Every condition anywhere in the data: NPCs, their talk, doors and places. */
function conditions(): Condition[] {
  const out: Condition[] = [];
  for (const n of Object.values(NPCS)) {
    out.push(...(n.if ?? []));
    for (const t of n.talk) out.push(...(t.if ?? []));
  }
  for (const a of Object.values(AREAS)) {
    for (const ex of [a.left, a.right, ...Object.values(a.doors ?? {})]) {
      if (ex?.requires?.flag) out.push({ flag: ex.requires.flag });
      if (ex?.requires?.item) out.push({ item: ex.requires.item });
    }
  }
  for (const p of OVERWORLD.places) for (const f of p.requires ?? []) out.push({ flag: f });
  return out;
}

describe('a whole playthrough', () => {
  it('reaches the credits from a new game, without leaning on random meetings', () => {
    expect(run.problems).toEqual([]);
    expect(run.finished).toBe(true);
  });

  it('breaks none of the game’s own rules on the way (nothing taken that Dagny lacks)', () => {
    expect(all.problems).toEqual([]);
  });

  it('visits every room and meets everyone', () => {
    expect(Object.keys(AREAS).filter((a) => !all.areas.has(a))).toEqual([]);
    expect(Object.keys(NPCS).filter((n) => !all.npcs.has(n))).toEqual([]);
  });

  it('can get every item, spell and skill', () => {
    const got = new Set(all.steps.filter((s) => s.kind === 'item').map((s) => s.what));
    expect(Object.keys(ITEMS).filter((i) => !got.has(i))).toEqual([]);
    expect(Object.keys(SPELLS).filter((s) => !all.spells.has(s))).toEqual([]);
    expect(Object.keys(SKILLS).filter((s) => !all.skills.has(s))).toEqual([]);
  });

  it('can find every container and every näverdocka placed in a room (or left by a task)', () => {
    const placed: string[] = [];
    for (const a of Object.values(AREAS)) {
      a.tiles.forEach((r, y) => [...r].forEach((ch, x) => {
        if (ch === 'h') placed.push(`liv:${a.id}:${x},${y}`);
        if (ch === 'p') placed.push(`magi:${a.id}:${x},${y}`);
        if (ch === '+') placed.push(`liv1:${a.id}:${x},${y}`);
      }));
      for (const ls of a.lampSecrets ?? []) if (ls.container) placed.push(`${ls.container}:${a.id}:${ls.tx},${ls.ty}`);
      for (const r of a.rewards ?? []) placed.push(`${r.kind}:${a.id}:${r.tx},${r.ty}`);
    }
    expect(placed.filter((p) => !all.containers.has(p) && !all.lives.has(p))).toEqual([]);
  });

  it('reconciles the temples in their fixed order, 1 → 7', () => {
    const wave = (t: string): number => run.steps.find((s) => s.kind === 'flag' && s.what === `${t}_boss`)?.wave ?? -1;
    const order = [...TEMPLES].sort((a, b) => a.number - b.number).map((t) => wave(t.id));
    expect(order.every((w) => w > 0)).toBe(true);
    for (let i = 1; i < order.length; i++) expect(order[i], TEMPLES[i].id).toBeGreaterThan(order[i - 1]);
  });

  it('without a temple’s treasure the next temple stays out of reach (the order is locked)', () => {
    const temples = [...TEMPLES].sort((a, b) => a.number - b.number);
    for (let i = 0; i < temples.length - 1; i++) {
      const t = temples[i];
      if (!t.treasure) continue;
      const r = playthrough({ withhold: [t.treasure], meetings: true });
      expect(r.flags.has(`${temples[i + 1].id}_boss`), `${temples[i + 1].id} without ${t.treasure}`).toBe(false);
      expect(r.finished).toBe(false);
    }
  });
});

describe('the logic holds together', () => {
  it('every flag a condition waits for can be set, and every item it asks for can be had', () => {
    const got = new Set(all.steps.filter((s) => s.kind === 'item').map((s) => s.what));
    const missing = conditions().flatMap((c) => {
      if ('flag' in c && !all.flags.has(c.flag)) return [`flag ${c.flag}`];
      if ('item' in c && !got.has(c.item)) return [`item ${c.item}`];
      return [];
    });
    expect([...new Set(missing)]).toEqual([]);
  });

  it('every item a condition names exists, and so does every spell', () => {
    for (const c of conditions()) {
      if ('item' in c) expect(ITEMS[c.item], c.item).toBeDefined();
      if ('notItem' in c) expect(ITEMS[c.notItem], c.notItem).toBeDefined();
      if ('spell' in c) expect(SPELLS[c.spell], c.spell).toBeDefined();
    }
  });

  it('every dialog is either reached in the playthrough or shown by the code', () => {
    const code = Object.entries(sources)
      .filter(([p]) => !p.includes('/data/dialog/'))
      .map(([, s]) => s)
      .join('\n');
    // Dialogs the code builds from a prefix: `behover_${item}`, `fick_${id}`, `hittade_${item}`.
    const prefixes = [...code.matchAll(/`([a-z_]+_)\$\{/g)].map((m) => m[1]);
    const orphans = Object.keys(DIALOG).filter((d) => !all.dialogs.has(d) && !code.includes(`'${d}'`) && !prefixes.some((p) => d.startsWith(p)));
    expect(orphans).toEqual([]);
  });

  it('every border on the overworld says what it needs, and every closed place says why', () => {
    for (const item of new Set(Object.values(OVERWORLD.needs))) expect(DIALOG[`behover_${item}`], item).toBeDefined();
    for (const p of OVERWORLD.places) if (p.requires) expect(p.dialog, p.name).toBeDefined();
  });

  it('a way out across a room’s edge never has a condition (the game would not check it)', () => {
    for (const a of Object.values(AREAS)) {
      expect(a.left?.requires, `${a.id} left`).toBeUndefined();
      expect(a.right?.requires, `${a.id} right`).toBeUndefined();
    }
  });

  it('each temple has a key for every locked door', () => {
    for (const t of TEMPLES) {
      const rooms = Object.values(AREAS).filter((a) => a.temple === t.id);
      const cols = new Set(rooms.flatMap((a) => a.tiles.flatMap((r) => [...r].flatMap((ch, x) => (ch === 'L' ? [`${a.id}:${x}`] : [])))));
      const keys = rooms.reduce((n, a) => n + a.tiles.join('').split('k').length - 1, 0);
      expect(keys, t.id).toBeGreaterThanOrEqual(cols.size);
    }
  });
});

describe('the village holds the key to its temple', () => {
  it('the mill cannot be done without Uppåtstöt from Bruksorten (the hatch to the key)', () => {
    const r = playthrough({ withholdSkills: ['uppatstot'], meetings: true });
    expect(r.flags.has('kvarnen_boss')).toBe(false);
    expect(run.flags.has('kvarnen_boss')).toBe(true);
    // Karlsson, who teaches it, lives in Bruksorten on the way to the mill.
    expect(run.steps.findIndex((s) => s.kind === 'skill' && s.what === 'uppatstot')).toBeLessThan(run.steps.findIndex((s) => s.kind === 'boss' && s.what === 'backahasten'));
  });
});

describe('the village gives the key (chapter 5)', () => {
  it('the lighthouse cannot be done without Hopp from Viola in Fiskeläget (the key on a high ledge)', () => {
    const r = playthrough({ withholdSpells: ['hopp'], meetings: true });
    expect(r.flags.has('fyren_klar')).toBe(false);
    expect(run.flags.has('fyren_klar')).toBe(true);
  });
});

describe('tasks done with the hands, not with a menu', () => {
  it('the charcoal stack is lit only by a fireball: no dialog lights it', () => {
    const lights = Object.values(DIALOG).some((d) => [...(d.actions ?? []), ...(d.choices ?? []).flatMap((c) => c.actions ?? [])].some((a) => a.type === 'flag' && a.flag === 'kolmilan_tand'));
    expect(lights).toBe(false);
    expect(NPCS.kolmila.burns?.flag).toBe('kolmilan_tand');
    // It happens in the playthrough only after Eld is learned.
    const lit = run.steps.findIndex((s) => s.kind === 'flag' && s.what === 'kolmilan_tand');
    const eld = run.steps.findIndex((s) => s.kind === 'spell' && s.what === 'eld');
    expect(eld).toBeGreaterThanOrEqual(0);
    expect(lit).toBeGreaterThan(eld);
  });

  it('a container found on a task lies in the room to be picked up, not handed over in the dialog', () => {
    for (const id of ['kyrkogarden', 'kolartorpet', 'fabodtorpet']) {
      expect(AREAS[id].rewards?.length, id).toBe(1);
      expect(Object.values(DIALOG).some((d) => (d.actions ?? []).some((a) => a.type === 'container' && a.id === id)), id).toBe(false);
    }
  });
});

describe('the village gives the key (chapter 6)', () => {
  it('Folkparken cannot be done without Åska from Oskar (the dead light strings over the dance floor)', () => {
    const r = playthrough({ withholdSpells: ['aska'], meetings: true });
    expect(r.flags.has('folkparken_klar')).toBe(false);
    expect(run.flags.has('folkparken_klar')).toBe(true);
  });
});

describe('the train (chapter 6)', () => {
  const targets = (DIALOG.tag_resa.choices ?? []).flatMap((c) => (c.actions ?? []).flatMap((a) => (a.type === 'travel' ? [a.area] : [])));

  it('runs between four stations, each with someone to take the train back from', () => {
    expect(targets.length).toBe(4);
    for (const id of targets) {
      const npcs = Object.values(AREAS[id].npcs ?? {});
      expect(npcs.some((n) => n === 'banvakt' || n === 'berg'), id).toBe(true);
    }
  });

  it('never takes Dagny anywhere she could not already walk to when the whistle is back', () => {
    const at = run.steps.findIndex((s) => s.kind === 'flag' && s.what === 'visselpipa_klar');
    expect(at).toBeGreaterThan(0);
    const items = run.steps.slice(0, at).filter((s) => s.kind === 'item').map((s) => s.what);
    const ok = reachableTiles(items);
    for (const id of targets) {
      const p = placeOfArea(id)!;
      expect(ok.has(`${p.x},${p.y}`), id).toBe(true);
    }
  });
});

describe('the village gives the key (chapter 7)', () => {
  it('Fäbodskogen cannot be done without Hamn from Karna (the key in a crack only a bird gets into)', () => {
    const r = playthrough({ withholdSpells: ['hamn'], meetings: true });
    expect(r.flags.has('fabodskogen_klar')).toBe(false);
    expect(run.flags.has('fabodskogen_klar')).toBe(true);
  });
});

describe('the radio hunt (chapter 7)', () => {
  it('hears all four fragments of Dagmar’s voice, and only with the radio', () => {
    for (const n of [1, 2, 3, 4]) expect(run.flags.has(`bruset_${n}`), `bruset_${n}`).toBe(true);
    expect(run.flags.has('bruset_klart')).toBe(true);
    const noRadio = playthrough({ withhold: ['radio'] });
    expect(noRadio.flags.has('bruset_1')).toBe(false);
  });

  it('Ture plays the recording of Dagmar from 1946 once Dagny has the radio', () => {
    expect(run.flags.has('ture_sandare')).toBe(true);
  });
});

describe('the first temple is not entered unprepared', () => {
  it('Nedåtstöt (Algot, for his tongs from the old smithy) can be had before the crypt’s Grimmen', () => {
    const skill = run.steps.findIndex((s) => s.kind === 'skill' && s.what === 'nedatstot');
    const boss = run.steps.findIndex((s) => s.kind === 'boss' && s.where.startsWith('krypta'));
    expect(skill).toBeGreaterThanOrEqual(0);
    expect(skill).toBeLessThan(boss);
  });
});
