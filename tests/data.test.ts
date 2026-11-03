import { describe, expect, it } from 'vitest';
import { AREAS, AREA_GROUPS } from '../src/data/areas';
import { PLACE_CHARS, TERRAIN } from '../src/data/terrain';
import { DIALOG, DIALOG_GROUPS } from '../src/data/dialog';
import { BOSSES, ENEMIES } from '../src/data/enemies';
import { ITEMS, ITEM_ORDER } from '../src/data/items';
import { DECO, ENEMY_CHARS, FRONT, PICKUP_CHARS } from '../src/data/legend';
import { NPCS } from '../src/data/npcs';
import { OVERWORLD } from '../src/data/overworld';
import { PALETTE, TONES } from '../src/data/palettes';
import { SPELLS, SPELL_ORDER } from '../src/data/spells';
import { MAX_LEVEL } from '../src/data/progression';
import { STR } from '../src/data/strings';
import { TEMPLES, VILLAGES } from '../src/data/temples';
import { SPRITES } from '../src/art';
import { GLYPHS } from '../src/art/font';
import { SONGS } from '../src/audio/songs';
import { SFX } from '../src/audio/sfx';
import { parseNotes } from '../src/engine/audio';
import { wrap } from '../src/engine/text';
import type { DialogAction } from '../src/data/types';

const KNOWN_TILE = new Set(['.', '#', '=', '^', '~', 'n', 'L', 'k', 'c', 'X', '@', 'q', '%', '&', '?', ...Object.keys(ENEMY_CHARS), ...Object.keys(PICKUP_CHARS), 'B', 'M', 'h', 'p', '+', '!']);

describe('palette', () => {
  it('has about 32 colours and no pure black', () => {
    const n = Object.keys(PALETTE).length;
    expect(n).toBeGreaterThanOrEqual(28);
    expect(n).toBeLessThanOrEqual(36);
    for (const c of Object.values(PALETTE)) expect(c.toLowerCase()).not.toBe('#000000');
  });
});

describe('sprites', () => {
  it('every grid fits its sprite and uses palette colours', () => {
    for (const [id, def] of Object.entries(SPRITES)) {
      const base = def.base ? SPRITES[def.base] : def;
      expect(base, `${id} base`).toBeDefined();
      const frames = def.frames.length ? def.frames : base.frames;
      const parts = def.parts ?? base.parts ?? {};
      expect(frames.length, id).toBeGreaterThan(0);
      const check = (grid: string[], name: string): void => {
        for (const row of grid) {
          expect(row.length, `${name} row width`).toBeLessThanOrEqual(def.w || base.w);
          for (const ch of row) if (ch !== '.' && ch !== ' ') expect(PALETTE[ch], `${name}: colour '${ch}'`).toBeDefined();
        }
      };
      frames.forEach((f, i) => {
        if (Array.isArray(f)) {
          expect(f.length, `${id}[${i}] height`).toBeLessThanOrEqual(def.h || base.h);
          check(f, `${id}[${i}]`);
        } else {
          for (const [p] of f.parts) expect(parts[p], `${id}: part ${p}`).toBeDefined();
        }
      });
      for (const [p, grid] of Object.entries(parts)) check(grid, `${id}.${p}`);
      for (const k of Object.values(def.recolor ?? {})) expect(PALETTE[k], `${id} recolor`).toBeDefined();
    }
  });

  it('Dagny is 16×24 and tiles are 16×16', () => {
    expect(SPRITES.dagny.w).toBe(16);
    expect(SPRITES.dagny.h).toBe(24);
    for (const id of ['grass', 'brick', 'wall', 'owGrass', 'water']) {
      expect(SPRITES[id].w).toBe(16);
      expect(SPRITES[id].h).toBe(16);
    }
  });
});

describe('areas', () => {
  for (const [id, a] of Object.entries(AREAS)) {
    describe(id, () => {
      it('has a rectangular tile map with known characters', () => {
        expect(a.id).toBe(id);
        const w = a.tiles[0].length;
        for (const row of a.tiles) {
          expect(row.length).toBe(w);
          for (const ch of row) {
            const ok = KNOWN_TILE.has(ch) || (ch >= '1' && ch <= '9') || (ch >= 'A' && ch <= 'Z');
            expect(ok, `unknown tile '${ch}' in ${id}`).toBe(true);
          }
        }
        if (a.front) {
          expect(a.front.length).toBe(a.tiles.length);
          for (const row of a.front) {
            expect(row.length).toBe(w);
            for (const ch of row) if (ch !== '.') expect(FRONT[ch], `front '${ch}' in ${id}`).toBeDefined();
          }
        }
        if (a.deco) {
          expect(a.deco.length).toBe(a.tiles.length);
          for (const row of a.deco) {
            expect(row.length).toBe(w);
            for (const ch of row) if (ch !== '.') expect(DECO[ch], `deco '${ch}' in ${id}`).toBeDefined();
          }
        }
      });

      it('references existing things', () => {
        expect(TONES[a.tone], a.tone).toBeDefined();
        expect(SONGS[a.music], a.music).toBeDefined();
        const chars = a.tiles.join('');
        for (const exit of [a.left, a.right, ...Object.values(a.doors ?? {})]) {
          if (!exit) continue;
          if (exit.to !== 'overworld') {
            const target = AREAS[exit.to];
            expect(target, `exit to ${exit.to}`).toBeDefined();
            if (exit.entry) expect(target.tiles.join(''), `entry ${exit.entry} in ${exit.to}`).toContain(exit.entry);
          }
          if (exit.requires) expect(DIALOG[exit.requires.dialog]).toBeDefined();
          if (exit.dialog) expect(DIALOG[exit.dialog], exit.dialog).toBeDefined();
        }
        for (const [ch, npc] of Object.entries(a.npcs ?? {})) {
          expect(NPCS[npc], npc).toBeDefined();
          expect(chars).toContain(ch);
        }
        for (const [ch, d] of Object.entries(a.doors ?? {})) {
          expect(chars).toContain(ch);
          void d;
        }
        for (const [ch, d] of Object.entries(a.signs ?? {})) {
          expect(chars).toContain(ch);
          expect(DIALOG[d], d).toBeDefined();
        }
        for (const p of a.props ?? []) if (p.sprite) expect(SPRITES[p.sprite], p.sprite).toBeDefined();
        if (a.treasure) {
          expect(ITEMS[a.treasure]).toBeDefined();
          expect(DIALOG[`fick_${a.treasure}`]).toBeDefined();
          expect(chars).toContain('X');
        }
        if (a.onEnter) expect(DIALOG[a.onEnter.dialog]).toBeDefined();
        if (chars.includes('%') || chars.includes('&')) expect(a.beat, 'dance squares need beat').toBeDefined();
        if (chars.includes('q')) {
          expect(a.questItem, 'q needs questItem').toBeDefined();
          expect(ITEMS[a.questItem!]).toBeDefined();
          expect(DIALOG[`hittade_${a.questItem}`]).toBeDefined();
        }
        if (chars.includes('k') || chars.includes('L')) expect(a.temple, 'keys and locks need a temple').toBeDefined();
      });

      it('has as many keys as locked doors', () => {
        const keys = (a.tiles.join('').match(/k/g) ?? []).length;
        let doors = 0;
        const w = a.tiles[0].length;
        for (let x = 0; x < w; x++) {
          let inDoor = false;
          for (const row of a.tiles) {
            if (row[x] === 'L' && !inDoor) doors++;
            inDoor = row[x] === 'L';
          }
        }
        expect(keys).toBeGreaterThanOrEqual(doors);
      });
    });
  }
});

describe('creatures, temples, spells', () => {
  it('defines all eight väsen types', () => {
    const behaviours = new Set(Object.values(ENEMIES).map((e) => e.behavior));
    for (const b of ['walker', 'floater', 'parrier', 'hopper', 'diver', 'tank', 'shooter', 'wolf']) expect(behaviours.has(b as never)).toBe(true);
    for (const e of Object.values(ENEMIES)) expect(SPRITES[e.sprite], e.sprite).toBeDefined();
  });

  it('has seven temples, each with a boss with two phases', () => {
    expect(TEMPLES.length).toBe(7);
    TEMPLES.forEach((t, i) => {
      expect(t.number).toBe(i + 1);
      const boss = BOSSES[t.boss];
      expect(boss, t.boss).toBeDefined();
      expect(boss.phases.length).toBe(2);
      expect(DIALOG[boss.defeatDialog]).toBeDefined();
      expect(TONES[t.tone]).toBeDefined();
      expect(SONGS[t.music], t.music).toBeDefined();
      if (t.treasure) expect(ITEMS[t.treasure]?.treasure).toBe(true);
      if (t.entryArea) expect(AREAS[t.entryArea]).toBeDefined();
    });
    expect(TEMPLES[0].entryArea).not.toBeNull();
  });

  it('has the seven läsningar and their villages', () => {
    expect(SPELL_ORDER.length).toBe(7);
    for (const id of SPELL_ORDER) {
      expect(SPELLS[id].cost.length).toBe(MAX_LEVEL);
      expect(VILLAGES.some((v) => v.name === SPELLS[id].village)).toBe(true);
    }
  });

  it('item order lists every item', () => {
    expect([...ITEM_ORDER].sort()).toEqual(Object.keys(ITEMS).sort());
  });
});

describe('dialog and text', () => {
  const allText: string[] = [];
  for (const d of Object.values(DIALOG)) {
    allText.push(...d.pages, ...(d.choices ?? []).map((c) => c.text));
    if (d.speaker) allText.push(d.speaker);
  }
  const collect = (v: unknown): void => {
    if (typeof v === 'string') allText.push(v);
    else if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === 'object') Object.values(v).forEach(collect);
  };
  collect(STR);
  for (const a of Object.values(AREAS)) allText.push(a.name);
  for (const p of OVERWORLD.places) allText.push(p.name);
  for (const s of Object.values(SPELLS)) allText.push(s.name, s.description);
  for (const i of Object.values(ITEMS)) allText.push(i.name, i.description);
  for (const e of Object.values(ENEMIES)) allText.push(e.name, e.befriend ?? '');

  it('every character can be drawn by the bitmap font', () => {
    const missing = new Set<string>();
    for (const t of allText) for (const ch of t) if (ch !== '\n' && !(ch in GLYPHS)) missing.add(ch);
    expect([...missing]).toEqual([]);
  });

  it('every dialog page fits on the postcard (4 lines)', () => {
    for (const [id, d] of Object.entries(DIALOG)) {
      for (const page of d.pages) expect(wrap(page, 272).length, `${id}: "${page.slice(0, 30)}…"`).toBeLessThanOrEqual(4);
    }
  });

  it('dialog links point to existing dialogs, spells and items', () => {
    const checkAction = (a: DialogAction): void => {
      if (a.type === 'learnSpell') expect(SPELLS[a.spell]).toBeDefined();
      if (a.type === 'giveItem' || a.type === 'takeItem') expect(ITEMS[a.item], a.item).toBeDefined();
    };
    for (const [id, d] of Object.entries(DIALOG)) {
      if (d.next) expect(DIALOG[d.next], `${id} → ${d.next}`).toBeDefined();
      for (const c of d.choices ?? []) {
        if (c.next) expect(DIALOG[c.next], `${id} → ${c.next}`).toBeDefined();
        (c.actions ?? []).forEach(checkAction);
      }
      (d.actions ?? []).forEach(checkAction);
    }
    for (const n of Object.values(NPCS)) {
      expect(SPRITES[n.sprite], n.sprite).toBeDefined();
      for (const t of n.talk) expect(DIALOG[t.dialog], `${n.id}: ${t.dialog}`).toBeDefined();
      // Only a thing (a glowing charcoal stack) may have nothing to say.
      if (n.talk.length) expect(n.talk[n.talk.length - 1].if, `${n.id} needs a fallback dialog`).toBeUndefined();
      else expect(n.still, `${n.id} has nothing to say`).toBe(true);
      if (n.burns?.dialog) expect(DIALOG[n.burns.dialog], n.burns.dialog).toBeDefined();
    }
    for (const p of OVERWORLD.places) if (p.dialog) expect(DIALOG[p.dialog], p.dialog).toBeDefined();
    for (const id of ['behover_eka', 'behover_stovlar', 'nyckel_saknas', 'grim_vaknar', 'murre_hittad']) expect(DIALOG[id]).toBeDefined();
  });

  it('Dagny never speaks', () => {
    for (const d of Object.values(DIALOG)) expect(d.speaker ?? '').not.toMatch(/dagny/i);
  });
});

describe('overworld', () => {
  it('is rectangular and every place is on its map tile', () => {
    const w = OVERWORLD.tiles[0].length;
    for (const r of OVERWORLD.tiles) expect(r.length).toBe(w);
    for (const p of OVERWORLD.places) {
      const ch = OVERWORLD.tiles[p.y]?.[p.x];
      // Hidden places sit on the waterfall, the cliff door or the sea cleft that hides them;
      // small places on the croft, cross, stone or churchyard that marks them.
      // Voices the radio picks up hang in the open air, on any walkable ground.
      const ok = p.radio ? !TERRAIN[ch]?.blocked : p.hidden ? 'AE3'.includes(ch) : PLACE_CHARS.includes(ch) || !!TERRAIN[ch]?.visitable || !!TERRAIN[ch]?.passage;
      expect(ok, `${p.name} on '${ch}'`).toBe(true);
      if (p.area) {
        expect(AREAS[p.area], p.area).toBeDefined();
        if (p.entry) expect(AREAS[p.area].tiles.join('')).toContain(p.entry);
      }
    }
    expect(OVERWORLD.tiles[OVERWORLD.start.y][OVERWORLD.start.x]).not.toBe('^');
  });

  it('encounters start on their terrain', () => {
    for (const e of OVERWORLD.encounters) expect(e.terrain).toContain(OVERWORLD.tiles[e.y][e.x]);
  });

  it('the far side of the lake cannot be reached without the eka', () => {
    // Flood fill from the start without crossing water or mountains.
    const t = OVERWORLD.tiles;
    const seen = new Set<string>();
    const stack = [[OVERWORLD.start.x, OVERWORLD.start.y]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      const k = `${x},${y}`;
      if (seen.has(k)) continue;
      const ch = t[y]?.[x];
      if (!ch || TERRAIN[ch]?.blocked || TERRAIN[ch]?.needs) continue;
      seen.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    const church = OVERWORLD.places.find((p) => p.area === 'krypta_1')!;
    const glade = OVERWORLD.places.find((p) => p.area === 'bjorkhagen')!;
    expect(seen.has(`${church.x},${church.y}`)).toBe(true);
    expect(seen.has(`${glade.x},${glade.y}`)).toBe(true);
    const bruksorten = OVERWORLD.places.find((p) => p.name === 'Bruksorten')!;
    expect(seen.has(`${bruksorten.x},${bruksorten.y}`)).toBe(false);
  });
});

describe('villages', () => {
  const allActions = Object.values(DIALOG).flatMap((d) => [...(d.actions ?? []), ...(d.choices ?? []).flatMap((c) => c.actions ?? [])]);

  it('every village is built and has somewhere to wake up', () => {
    for (const v of VILLAGES) {
      expect(v.area, v.id).not.toBeNull();
      const a = AREAS[v.area!];
      expect(a, v.id).toBeDefined();
      expect(a.kind).toBe('village');
      expect(a.tiles.join(''), v.id).toContain(v.wakeEntry);
      expect(OVERWORLD.places.some((p) => p.area === v.area), `${v.id} on the map`).toBe(true);
    }
  });

  it('every läsning and technique can be learned in the game', () => {
    for (const id of SPELL_ORDER) expect(allActions, id).toContainEqual({ type: 'learnSpell', spell: id });
    for (const id of ['nedatstot', 'uppatstot']) expect(allActions, id).toContainEqual({ type: 'learnSkill', skill: id });
  });

  it('every side-quest item lies in exactly one room and someone takes it back', () => {
    const quest = Object.values(AREAS).flatMap((a) => (a.questItem ? [a.questItem] : []));
    expect(new Set(quest).size).toBe(quest.length);
    for (const item of quest) {
      expect(ITEMS[item], item).toBeDefined();
      expect(DIALOG[`hittade_${item}`], item).toBeDefined();
      expect(allActions, item).toContainEqual({ type: 'takeItem', item });
      expect(allActions, item).toContainEqual({ type: 'flag', flag: `${item}_klar` });
    }
  });
});

describe('the ending', () => {
  const actionsOf = (id: string): DialogAction[] => {
    const d = DIALOG[id];
    return [...(d.actions ?? []), ...(d.choices ?? []).flatMap((c) => c.actions ?? [])];
  };
  const flagsSet = new Set(
    Object.keys(DIALOG).flatMap((id) => actionsOf(id).flatMap((a) => (a.type === 'flag' ? [a.flag] : []))),
  );

  it('Trollberget opens only when the six other places are restored', () => {
    const troll = OVERWORLD.places.find((p) => p.name === 'Trollberget')!;
    expect(troll.area).toBe('troll_1');
    expect(troll.requires).toHaveLength(6);
    for (const t of TEMPLES.filter((x) => x.id !== 'trollberget')) {
      expect(troll.requires).toContain(`${t.id}_klar`);
      expect(flagsSet.has(`${t.id}_klar`), `${t.id}_klar is set by some dialog`).toBe(true);
    }
  });

  it('the guardian of the last room leaves Dagmar behind, and her farewell starts the ending', () => {
    const ab = AREAS.troll_4.afterBoss!;
    expect(NPCS[ab.npc]).toBeDefined();
    expect(AREAS.troll_4.tiles[ab.ty + 1][ab.tx]).toBe('#');
    const chain = ['dagmar_avsked', ...DIALOG.dagmar_avsked.choices!.map((c) => c.next!)];
    const actions = chain.flatMap(actionsOf);
    expect(actions).toContainEqual({ type: 'flag', flag: 'trollberget_klar' });
    expect(actions).toContainEqual({ type: 'scene', scene: 'ending' });
  });

  it('the epilogue exists and Hulda can end the game', () => {
    expect(AREAS.epilog).toBeDefined();
    expect(AREAS.epilog.tiles.join('')).toContain('W');
    expect(actionsOf('hulda_epilog')).toContainEqual({ type: 'scene', scene: 'credits' });
    for (const card of [...STR.ending, ...STR.credits, ...STR.teaser]) expect(wrap(card, 236).length).toBeLessThanOrEqual(8);
  });
});

describe('data split into files', () => {
  it('no room or dialog is defined in two files', () => {
    for (const [name, groups] of [['areas', AREA_GROUPS], ['dialog', DIALOG_GROUPS]] as const) {
      const keys = groups.flatMap((g) => Object.keys(g));
      expect(new Set(keys).size, name).toBe(keys.length);
    }
  });
});

describe('music and sound', () => {
  it('every song parses and its tracks loop in sync', () => {
    for (const [id, song] of Object.entries(SONGS)) {
      const tracks = song.tracks.length ? song.tracks : SONGS[song.base!].tracks;
      const lengths = tracks.map((t) => parseNotes(t.notes).reduce((a, n) => a + n.len, 0));
      if (song.loop) for (const l of lengths) expect(l, `${id}: ${lengths.join(', ')}`).toBe(lengths[0]);
    }
  });

  it('the soundtrack hangs together: one temple theme, one guardian fight, the last temple its own', () => {
    for (const t of TEMPLES) {
      const last = t.id === 'trollberget';
      expect(t.music, t.id).toBe(last ? 'trollberget' : 'tempel');
      expect(t.bossMusic, t.id).toBe(last ? 'bergakung' : 'boss');
      for (const a of Object.values(AREAS).filter((x) => x.temple === t.id)) expect(a.music, a.id).toBe(t.music);
    }
  });

  it('every song is used somewhere', () => {
    const used = new Set([...Object.values(AREAS).flatMap((a) => [a.music, a.sealed?.music]), ...TEMPLES.flatMap((t) => [t.music, t.bossMusic])]);
    const elsewhere = ['titel', 'karta', 'seger', 'somnar', 'soluppgang', 'midsommar', 'fynd', 'lara'];
    // A village's brighter tune plays once its place has woken (SideScene.music).
    const bright = (id: string): boolean => id.endsWith('_ljus') && used.has(id.slice(0, -5));
    // An intro's loop plays when the intro ends.
    const after = new Set(Object.values(SONGS).map((x) => x.then).filter(Boolean));
    for (const id of Object.keys(SONGS)) expect(used.has(id) || elsewhere.includes(id) || bright(id) || after.has(id), id).toBe(true);
    for (const x of Object.values(SONGS)) if (x.then) expect(SONGS[x.then], x.then).toBeDefined();
  });

  it('every village plays brighter once its place has woken', () => {
    for (const v of VILLAGES) {
      expect(TEMPLES.some((x) => x.id === v.place), v.name).toBe(true);
      expect(SONGS[`${AREAS[v.area!].music}_ljus`], v.name).toBeDefined();
    }
  });

  it('has the sound effects the spec asks for', () => {
    for (const id of ['jump', 'sword', 'hit', 'block', 'xp', 'levelup', 'dialog', 'door', 'water']) expect(SFX[id], id).toBeDefined();
  });

  it('parses note names', () => {
    const [a4, cs5, r] = parseNotes('a4:4 c#5 r:2');
    expect(a4).toEqual({ midi: 69, len: 4 });
    expect(cs5).toEqual({ midi: 73, len: 4 });
    expect(r).toEqual({ midi: -1, len: 2 });
    expect(() => parseNotes('x9')).toThrow();
  });
});

describe('dialog pages', () => {
  it('every page fits the dialog box (four lines)', () => {
    // The box is VIEW_W - 48 px wide inside its margins; longer pages are cut off.
    for (const [id, d] of Object.entries(DIALOG)) {
      d.pages.forEach((p, i) => expect(wrap(p, 272).length, `${id}[${i}]`).toBeLessThanOrEqual(4));
    }
  });

  it('the story twist is told the same way everywhere', () => {
    const all = Object.values(DIALOG).flatMap((d) => d.pages).join('\n') + STR.ending.join('\n');
    expect(all).toContain('Och hon var min dotter.');
    expect(all).toContain('Näst sist står HULDA');
    expect(all).not.toMatch(/din mors ögon|fick komma hem till slut|bästa vän/);
  });
});

describe('spell costs', () => {
  it('a reading never costs more than Dagny can hold (Åska with no magic levels or containers)', async () => {
    const { newGame, spellCost, mpMax } = await import('../src/game/state');
    const s = newGame();
    expect(spellCost(s, 'aska')).toBeLessThanOrEqual(mpMax(s));
    expect(spellCost(s, 'lakning')).toBe(SPELLS.lakning.cost[0]);
  });
});

describe('Väsensboken', () => {
  it('has a page for every creature and guardian, and every page fits its panel', async () => {
    const { VASEN } = await import('../src/data/vasen');
    const { LINE_HEIGHT } = await import('../src/engine/text');
    for (const id of [...Object.keys(ENEMIES), ...Object.keys(BOSSES)]) expect(VASEN[id], id).toBeDefined();
    for (const id of Object.keys(VASEN)) expect(ENEMIES[id] ?? BOSSES[id], id).toBeDefined();
    // The text panel: 170 px wide, from y 48 to the panel's bottom edge (156 - 6).
    const lines = Math.floor((156 - 48 - 6) / LINE_HEIGHT);
    for (const [id, e] of Object.entries(VASEN)) {
      expect(wrap(e.folktro, 170).length, `${id} folktro`).toBeLessThanOrEqual(lines);
      expect(wrap(e.berattelse, 170).length, `${id} berättelse`).toBeLessThanOrEqual(lines);
    }
  });
});
