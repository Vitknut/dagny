import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { DIALOG } from '../src/data/dialog';
import { BOSSES } from '../src/data/enemies';
import { ENEMY_CHARS } from '../src/data/legend';
import { OVERWORLD } from '../src/data/overworld';
import { VASEN } from '../src/data/vasen';
import { NPCS } from '../src/data/npcs';
import { checkConditions, newGame } from '../src/game/state';
import { playthrough } from '../src/tools/playthrough';

/** The flag set when Hulda finally says the name (after Folkparken). */
const REVEAL = 'hulda_efter_folkparken';
const NAME = /Dagmar/;

describe("the story keeps its secret until Hulda tells it", () => {
  const run = playthrough();
  const reveal = run.steps.find((s) => s.kind === 'flag' && s.what === REVEAL)?.wave;

  it('the walkthrough reaches the reveal', () => {
    expect(reveal).toBeDefined();
  });

  it('no line heard before then says her name', () => {
    for (const st of run.steps.filter((s) => s.kind === 'hear' && s.wave < reveal!)) {
      const d = DIALOG[st.what];
      const text = [d.speaker ?? '', ...d.pages, ...(d.choices ?? []).map((c) => c.text)].join(' ');
      expect(text, st.what).not.toMatch(NAME);
    }
  });

  it('no place on the map, and no room reached before then, is named after her', () => {
    for (const pl of OVERWORLD.places) expect(pl.name, `${pl.x},${pl.y}`).not.toMatch(NAME);
    for (const st of run.steps.filter((s) => s.kind === 'area' && s.wave < reveal!)) {
      expect(AREAS[st.what]?.name ?? '', st.what).not.toMatch(NAME);
    }
  });

  it('no page of Väsensboken that can open before then says her name', () => {
    const before = new Set<string>();
    for (const st of run.steps.filter((s) => s.kind === 'area' && s.wave < reveal!)) {
      for (const row of AREAS[st.what]?.tiles ?? []) for (const ch of row) if (ENEMY_CHARS[ch]) before.add(ENEMY_CHARS[ch]);
    }
    // A guardian's page opens when it is reconciled.
    for (const st of run.steps.filter((s) => s.kind === 'boss' && s.wave <= reveal!)) before.add(st.what);
    for (const id of before) {
      const page = VASEN[id];
      if (!page) continue;
      expect(`${page.folktro} ${page.berattelse}`, id).not.toMatch(NAME);
    }
    // Sanity: the check really covers guardians and ordinary creatures.
    expect([...before].some((id) => id in BOSSES)).toBe(true);
    expect(before.has('lyktgubbe')).toBe(true);
  });
});

describe("Hulda's part stays hers to tell (after Fäbodskogen)", () => {
  const run = playthrough();
  const told = run.steps.find((s) => s.kind === 'flag' && s.what === 'hulda_efter_fabodskogen')?.wave;

  it('no page of Väsensboken that can open before then names Hulda', () => {
    expect(told).toBeDefined();
    const before = new Set<string>();
    for (const st of run.steps.filter((s) => s.kind === 'area' && s.wave < told!)) {
      for (const row of AREAS[st.what]?.tiles ?? []) for (const ch of row) if (ENEMY_CHARS[ch]) before.add(ENEMY_CHARS[ch]);
    }
    for (const st of run.steps.filter((s) => s.kind === 'boss' && s.wave < told!)) before.add(st.what);
    for (const id of before) {
      const page = VASEN[id];
      if (page) expect(`${page.folktro} ${page.berattelse}`, id).not.toMatch(/Hulda/);
    }
  });
});

describe("what Hulda quotes is what is written", () => {
  it('the line from the crypt she quotes stands on the crypt sign, word for word', () => {
    const said = DIALOG.hulda_efter_fabodskogen.pages.join(' ');
    const quote = said.match(/"(\.\.\.da[^"]*)"/)?.[1];
    expect(quote).toBeDefined();
    expect(DIALOG.krypta_skylt2.pages.join(' ')).toContain(quote!);
  });
});

describe("Hulda tells her story in order, even when Dagny comes home late", () => {
  it('a piece heard late still fits: none but the last counts the places', () => {
    for (const id of ['hulda_efter_krypta', 'hulda_efter_gruvan', 'hulda_efter_kvarnen', 'hulda_efter_fyren', 'hulda_efter_folkparken']) {
      expect(DIALOG[id].pages.join(' '), id).not.toMatch(/\b(Sex|Fem|Fyra|Tre|Två) platser/i);
    }
  });

  it('with every place awake and nothing heard, the pieces come oldest first', () => {
    const s = newGame();
    s.flags.push('intro_done', 'krypta_klar', 'gruvan_klar', 'kvarnen_klar', 'fyren_klar', 'folkparken_klar', 'fabodskogen_klar');
    const heard: string[] = [];
    for (let i = 0; i < 6; i++) {
      const talk = NPCS.hulda.talk.find((t) => checkConditions(t.if, s))!;
      heard.push(talk.dialog);
      for (const a of DIALOG[talk.dialog].actions ?? []) if (a.type === 'flag') s.flags.push(a.flag);
    }
    expect(heard).toEqual([
      'hulda_efter_krypta',
      'hulda_efter_gruvan',
      'hulda_efter_kvarnen',
      'hulda_efter_fyren',
      'hulda_efter_folkparken',
      'hulda_efter_fabodskogen',
    ]);
  });
});
