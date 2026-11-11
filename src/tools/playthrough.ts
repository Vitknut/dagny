/**
 * A logical playthrough of the whole game, straight from the data.
 *
 * Starting as a new game in Mormors by, it does everything Dagny can do with
 * what she has – walks the overworld with her treasures, enters the places
 * that are open, goes through every room as far as walls, locked doors and
 * hidden walls allow, talks to everyone, reads every sign, picks up what lies
 * there, beats every creature and guardian – again and again until nothing
 * new happens. The rules are the game's own: the same conditions, dialog
 * actions, keys, radio walls, lamp secrets and overworld gates.
 *
 * What it does not judge is skill: jumps, fights and timing are taken as
 * possible. A room is walked as open cells (walls are '#', locked doors 'L'
 * and hidden walls '?'), not with Dagny's jump arc.
 *
 * Every step is logged in the order it became possible ("waves"), which
 * makes the result a walkthrough that can be read and checked for sense.
 */
import { AREAS } from '../data/areas';
import { DIALOG } from '../data/dialog';
import { BOSSES, ENEMIES } from '../data/enemies';
import { ENCOUNTER_TABLES, TERRAIN_TYPE } from '../data/encounters';
import { ITEMS } from '../data/items';
import { ENEMY_CHARS } from '../data/legend';
import { NPCS } from '../data/npcs';
import { OVERWORLD } from '../data/overworld';
import { SKILLS, SPELLS } from '../data/spells';
import { TEMPLES } from '../data/temples';
import type { AreaDef, Condition, DialogAction, Exit } from '../data/types';
import { reachableTiles } from '../game/reach';
import { newGame } from '../game/state';

export interface Step {
  wave: number;
  /** 'hear': a dialog heard for the first time (its id), for checks on what is said when. */
  kind: 'area' | 'talk' | 'hear' | 'burn' | 'item' | 'lose' | 'flag' | 'spell' | 'skill' | 'boss' | 'container' | 'life' | 'key' | 'door' | 'scene';
  what: string;
  /** Where it happened (area id, or 'overworld'). */
  where: string;
}

/** What Dagny has, for whether a cell keeps her out. */
export interface Has {
  items: ReadonlySet<string>;
  spells: ReadonlySet<string>;
  skills: ReadonlySet<string>;
  /** A locked door in this column has been opened. */
  unlocked: (col: number) => boolean;
}

/**
 * Whether a cell keeps Dagny out, given what she has: rock, a door still
 * locked, a hidden passage without the radio, a hatch, rotten boards, roots
 * or a lantern gate she can't open yet, or a place only an ability reaches
 * (AreaDef.needs). Gravity is not modelled; `needs` stands in for it.
 */
export function blocks(a: AreaDef, x: number, y: number, has: Has): boolean {
  const ch = a.tiles[y]?.[x];
  if (ch === undefined || ch === '#') return true;
  if (ch === '?') return !has.items.has('radio');
  if (ch === 'L') return !has.unlocked(x);
  // A hatch opens to an up-thrust from below.
  if (ch === '!') return !has.skills.has('uppatstot');
  // Rotten boards, dry roots and dead lanterns (game/side/obstacles.ts).
  if (ch === '_') return !has.skills.has('nedatstot');
  if (ch === '(') return !has.spells.has('eld');
  if (ch === '[') return !has.spells.has('aska');
  // Loose masonry comes down to the crowbar (the crypt's tool).
  if (ch === '}') return !has.items.has('spett');
  // A place only an ability reaches (a high ledge, a narrow hole, a path in the light).
  for (const n of a.needs ?? []) if (x >= n.x0 && x <= n.x1 && y >= n.y0 && y <= n.y1 && !has.spells.has(n.ability) && !has.skills.has(n.ability)) return true;
  // A place only a temple's tool gets her to (a lift that runs only with the crank).
  for (const n of a.needsItem ?? []) if (x >= n.x0 && x <= n.x1 && y >= n.y0 && y <= n.y1 && !has.items.has(n.item)) return true;
  return false;
}

export interface Options {
  /** Items that never reach Dagny's hands (to check what each one opens). */
  withhold?: readonly string[];
  /** Readings and techniques she never learns (to check what each one opens). */
  withholdSkills?: readonly string[];
  /** Readings (spells) she never learns. */
  withholdSpells?: readonly string[];
  /** Flags that are never set (to check what each one opens). */
  withholdFlags?: readonly string[];
  /** Also take the random meetings on the overworld (friendly ones and fights). */
  meetings?: boolean;
  /** Stop after this many waves. */
  maxWaves?: number;
}

export interface Playthrough {
  /** The credits were reached. */
  finished: boolean;
  waves: number;
  steps: Step[];
  flags: Set<string>;
  items: Set<string>;
  spells: Set<string>;
  skills: Set<string>;
  containers: Set<string>;
  lives: Set<string>;
  areas: Set<string>;
  dialogs: Set<string>;
  npcs: Set<string>;
  /** Things that broke the game's own logic (e.g. an item taken that she never had). */
  problems: string[];
}

interface Cell {
  x: number;
  y: number;
}

export function playthrough(opts: Options = {}): Playthrough {
  const withhold = new Set(opts.withhold ?? []);
  const start = newGame();
  const flags = new Set<string>(start.flags);
  const items = new Set<string>(start.items);
  const spells = new Set<string>(start.spells);
  const skills = new Set<string>(start.skills);
  const containers = new Set<string>();
  const lives = new Set<string>();
  const areas = new Set<string>();
  const dialogs = new Set<string>();
  const npcs = new Set<string>();
  const keysGot = new Map<string, number>();
  const keysUsed = new Map<string, number>();
  /** Picked-up keys and opened lock columns, by area:x,y / area:col. */
  const done = new Set<string>();
  const steps: Step[] = [];
  const problems: string[] = [];
  let wave = 0;
  let where = 'mormors_by';
  let finished = false;
  let ending = false;
  let changed = false;

  const log = (kind: Step['kind'], what: string): void => {
    steps.push({ wave, kind, what, where });
    changed = true;
  };

  // --- State, exactly as the game reads and writes it ---------------------------------

  const check = (conds?: Condition[]): boolean =>
    (conds ?? []).every((c) => {
      if ('flag' in c) return flags.has(c.flag);
      if ('notFlag' in c) return !flags.has(c.notFlag);
      if ('item' in c) return items.has(c.item);
      if ('notItem' in c) return !items.has(c.notItem);
      if ('spell' in c) return spells.has(c.spell);
      if ('notSpell' in c) return !spells.has(c.notSpell);
      return true;
    });

  const setFlag = (f: string): void => {
    if (flags.has(f) || (opts.withholdFlags ?? []).includes(f)) return;
    flags.add(f);
    log('flag', f);
  };
  const give = (item: string): void => {
    if (items.has(item) || withhold.has(item)) return;
    items.add(item);
    log('item', item);
  };

  const run = (a: DialogAction, from: string): void => {
    switch (a.type) {
      case 'flag':
        setFlag(a.flag);
        break;
      case 'learnSpell':
        if (!spells.has(a.spell) && !(opts.withholdSpells ?? []).includes(a.spell)) {
          spells.add(a.spell);
          log('spell', a.spell);
        }
        break;
      case 'learnSkill':
        if (!skills.has(a.skill) && !(opts.withholdSkills ?? []).includes(a.skill)) {
          skills.add(a.skill);
          log('skill', a.skill);
        }
        break;
      case 'giveItem':
        give(a.item);
        break;
      case 'takeItem':
        if (!items.has(a.item)) {
          if (!withhold.has(a.item)) problems.push(`dialog ${from} takes ${a.item}, which Dagny does not have`);
          break;
        }
        items.delete(a.item);
        log('lose', a.item);
        break;
      case 'container':
        if (!containers.has(`${a.kind}:${a.id}`)) {
          containers.add(`${a.kind}:${a.id}`);
          log('container', `${a.kind}:${a.id}`);
        }
        break;
      case 'life':
        if (!lives.has(`liv1:${a.id}`)) {
          lives.add(`liv1:${a.id}`);
          log('life', a.id);
        }
        break;
      case 'signal':
        // The signal across the lake ends in its dialog.
        talk(a.then);
        break;
      case 'scene':
        if (a.scene === 'ending' && !ending) {
          ending = true;
          log('scene', 'ending');
        }
        if (a.scene === 'credits' && !finished) {
          finished = true;
          log('scene', 'credits');
        }
        break;
      default:
        break;
    }
  };

  /** A dialog with all it leads to: its actions, every choice and what follows. */
  const talk = (id: string, seen = new Set<string>()): void => {
    if (seen.has(id)) return;
    seen.add(id);
    const d = DIALOG[id];
    if (!d) {
      problems.push(`dialog ${id} is used but does not exist`);
      return;
    }
    if (!dialogs.has(id)) {
      dialogs.add(id);
      changed = true;
      log('hear', id);
    }
    for (const a of d.actions ?? []) run(a, id);
    for (const c of d.choices ?? []) {
      for (const a of c.actions ?? []) run(a, id);
      if (c.next) talk(c.next, seen);
    }
    if (d.next) talk(d.next, seen);
  };

  // --- Rooms ------------------------------------------------------------------------------

  const solid = (a: AreaDef, x: number, y: number): boolean => blocks(a, x, y, { items, spells, skills, unlocked: (col) => done.has(`${a.id}:col${col}`) });

  const spawnCell = (a: AreaDef, entry: string | undefined, at?: Cell): Cell => {
    if (at) return at;
    const find = (ch: string): Cell | null => {
      for (let y = 0; y < a.tiles.length; y++) {
        const x = a.tiles[y].indexOf(ch);
        if (x >= 0) return { x, y };
      }
      return null;
    };
    return (entry && find(entry)) || find('@') || find('A') || find('W') || { x: 2, y: a.tiles.length - 3 };
  };

  /** Walks one room from where Dagny comes in; returns the ways out she reached. */
  const room = (a: AreaDef, from: Cell): Exit[] => {
    const h = a.tiles.length;
    const w = a.tiles[0].length;
    const seen = new Set<number>();
    const stack: Cell[] = [from];
    const temple = a.temple ?? 'none';
    while (stack.length) {
      const c = stack.pop()!;
      const i = c.y * w + c.x;
      if (c.x < 0 || c.y < 0 || c.x >= w || c.y >= h || seen.has(i)) continue;
      if (a.tiles[c.y][c.x] === 'L' && !done.has(`${a.id}:col${c.x}`)) {
        // A locked door: open it if a key of this temple is spare.
        const spare = (keysGot.get(temple) ?? 0) - (keysUsed.get(temple) ?? 0);
        if (spare <= 0) continue;
        keysUsed.set(temple, (keysUsed.get(temple) ?? 0) + 1);
        done.add(`${a.id}:col${c.x}`);
        log('door', `${a.id} column ${c.x}`);
      }
      if (solid(a, c.x, c.y)) continue;
      seen.add(i);
      stack.push({ x: c.x + 1, y: c.y }, { x: c.x - 1, y: c.y }, { x: c.x, y: c.y + 1 }, { x: c.x, y: c.y - 1 });
    }
    const reached = (x: number, y: number): boolean => seen.has(y * w + x);

    const exits: Exit[] = [];
    let bossCell = false;
    const cells: Array<[number, number, string]> = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (reached(x, y)) cells.push([x, y, a.tiles[y][x]]);
    // First the people and the signs – a player talks before picking things up –
    for (const [x, , ch] of cells) {
      if (x === 0 && a.left) exits.push(a.left);
      if (x === w - 1 && a.right) {
        exits.push(a.right);
        for (const f of [a.cavein?.flag, a.opens]) if (f && !flags.has(f)) setFlag(f);
      }
      if (ch >= '1' && ch <= '9' && a.npcs?.[ch]) meet(a.npcs[ch]);
      else if (/[A-Z@]/.test(ch)) {
        if (a.doors?.[ch]) exits.push(a.doors[ch]);
        if (a.signs?.[ch]) talk(a.signs[ch]);
      }
    }
    // A trial of candles is lit once its teacher has asked (side/trial.ts); then the teacher speaks.
    if (a.candleTrial && flags.has(a.candleTrial.requires) && !flags.has(a.candleTrial.flag)) {
      setFlag(a.candleTrial.flag);
      talk(a.candleTrial.dialog);
    }
    // Someone lost who asked to follow is taken home (side/follower.ts): they walk where Dagny walks.
    if (a.lostChild && flags.has(`${a.lostChild.npc}_folger`) && !flags.has(a.lostChild.home)) setFlag(a.lostChild.home);
    // – then the creatures and what lies about.
    for (const [x, y, ch] of cells) {
      const pid = `${a.id}:${x},${y}`;
      if (ch === 'k' && !done.has(pid)) {
        done.add(pid);
        keysGot.set(temple, (keysGot.get(temple) ?? 0) + 1);
        log('key', `${temple} (${pid})`);
      } else if ((ch === 'h' || ch === 'p') && !containers.has(`${ch === 'h' ? 'liv' : 'magi'}:${pid}`)) {
        containers.add(`${ch === 'h' ? 'liv' : 'magi'}:${pid}`);
        log('container', `${ch === 'h' ? 'liv' : 'magi'}:${pid}`);
      } else if (ch === '+' && !lives.has(`liv1:${pid}`)) {
        lives.add(`liv1:${pid}`);
        log('life', pid);
      } else if (ch === 'M' && !items.has('murre') && !flags.has('murre_hemma')) {
        give('murre');
        talk('murre_hittad');
      } else if (ch === 'q' && a.questItem && !items.has(a.questItem) && !flags.has(`${a.questItem}_klar`)) {
        pickUp(a.questItem);
      } else if (ch === 'B') {
        bossCell = true;
      } else if (ENEMY_CHARS[ch]) {
        beat(ENEMY_CHARS[ch]);
      }
    }
    if (a.sealed && [...seen].some((i) => ENEMY_CHARS[a.tiles[Math.floor(i / w)][i % w]])) setFlag(`${a.id}_rensad`);
    for (const fd of a.finds ?? []) if (reached(fd.tx, fd.ty) && !flags.has(`${fd.item}_klar`) && (!fd.after || flags.has(fd.after))) pickUp(fd.item);
    for (const r of a.rewards ?? []) {
      const key = `${r.kind}:${a.id}:${r.tx},${r.ty}`;
      if (flags.has(r.flag) && reached(r.tx, r.ty) && !containers.has(key)) {
        containers.add(key);
        log('container', key);
      }
    }
    for (const ls of a.lampSecrets ?? []) {
      if (!items.has(ls.item) || !reached(ls.tx, ls.ty)) continue;
      const key = ls.container ? `${ls.container}:${a.id}:${ls.tx},${ls.ty}` : '';
      if (key && !containers.has(key)) {
        containers.add(key);
        log('container', key);
      }
      if (ls.dialog) talk(ls.dialog);
      if (ls.gives && !flags.has(`${ls.gives}_klar`)) pickUp(ls.gives);
    }
    // The guardian, then its treasure on the altar and whoever waited behind it.
    const t = TEMPLES.find((x) => x.id === a.temple);
    const guarded = a.tiles.some((r) => r.includes('B'));
    if (bossCell && t && !flags.has(`${t.id}_boss`) && (!BOSSES[t.boss]?.needs || skills.has(BOSSES[t.boss].needs!))) {
      const b = BOSSES[t.boss];
      if (!b) problems.push(`temple ${t.id} has no guardian ${t.boss}`);
      log('boss', t.boss);
      if (b) talk(b.introDialog);
      setFlag(`${t.id}_boss`);
      if (b) talk(b.defeatDialog);
    }
    const altar = a.tiles.findIndex((r) => r.includes('X'));
    if (a.treasure && altar >= 0 && reached(a.tiles[altar].indexOf('X'), altar) && (!guarded || flags.has(`${a.temple}_boss`))) {
      if (!items.has(a.treasure) && !withhold.has(a.treasure)) {
        give(a.treasure);
        talk(`fick_${a.treasure}`);
      }
    }
    if (a.afterBoss && a.temple && flags.has(`${a.temple}_boss`)) meet(a.afterBoss.npc);
    return exits;
  };

  const pickUp = (item: string): void => {
    if (items.has(item) || withhold.has(item)) return;
    give(item);
    talk(`hittade_${item}`);
  };

  const meet = (id: string): void => {
    const n = NPCS[id];
    if (!n) {
      problems.push(`NPC ${id} is placed but does not exist`);
      return;
    }
    if (!check(n.if)) return;
    const t = n.talk.find((x) => check(x.if));
    if (!npcs.has(id)) {
      npcs.add(id);
      // A thing with nothing to say (a glowing charcoal stack) is seen all the same.
      if (t) log('talk', id);
    }
    if (t) talk(t.dialog);
    // Something that burns catches fire from a fireball, once she knows Eld.
    if (n.burns && spells.has('eld') && !flags.has(n.burns.flag)) {
      log('burn', id);
      setFlag(n.burns.flag);
      if (n.burns.dialog) talk(n.burns.dialog);
    }
  };

  const beat = (enemy: string): void => {
    if (!ENEMIES[enemy]) problems.push(`creature ${enemy} does not exist`);
    if (!flags.has(`van_${enemy}`)) flags.add(`van_${enemy}`);
  };

  /** Enters an area and follows every way on from it; returns true if the overworld was reached. */
  const explore = (first: { area: string; entry?: string; at?: Cell }): boolean => {
    const queue = [first];
    const seen = new Set<string>();
    let overworld = false;
    while (queue.length) {
      const q = queue.shift()!;
      const key = `${q.area}|${q.entry ?? ''}|${q.at ? `${q.at.x},${q.at.y}` : ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = AREAS[q.area];
      if (!a) {
        problems.push(`a way leads to ${q.area}, which does not exist`);
        continue;
      }
      where = a.id;
      if (!areas.has(a.id)) {
        areas.add(a.id);
        log('area', a.id);
      }
      if (a.onEnter && !flags.has(a.onEnter.unlessFlag)) {
        setFlag(a.onEnter.setFlag);
        talk(a.onEnter.dialog);
      }
      for (const ex of room(a, spawnCell(a, q.entry, q.at))) {
        const req = ex.requires;
        if (req && ((req.flag && !flags.has(req.flag)) || (req.item && !items.has(req.item)))) continue;
        if (ex.dialog) talk(ex.dialog);
        if (ex.to === 'overworld') overworld = true;
        else queue.push({ area: ex.to, entry: ex.entry });
      }
    }
    return overworld;
  };

  // --- The game, wave after wave ------------------------------------------------------

  const loc = start.loc;
  const startCell = { x: Math.floor((loc.x + 5) / 16), y: Math.floor((loc.y + 12) / 16) };
  const max = opts.maxWaves ?? 300;
  let snapshot = '';
  for (wave = 1; wave <= max; wave++) {
    changed = false;
    let outside = explore({ area: 'mormors_by', at: startCell });
    if (ending) outside = explore({ area: 'epilog', entry: 'W' }) || outside;
    if (outside) {
      where = 'overworld';
      // A reading cast beside what it answers to on the map opens it (game/overworld.ts, castOnMap).
      for (let open = true; open; ) {
        open = false;
        const near = reachableTiles([...items], undefined, flags);
        for (const m of OVERWORLD.mended ?? []) {
          if (!m.spell || flags.has(m.flag) || !spells.has(m.spell) || (opts.withholdFlags ?? []).includes(m.flag)) continue;
          if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => near.has(`${m.x + dx},${m.y + dy}`))) {
            setFlag(m.flag);
            open = true;
          }
        }
      }
      const tiles = reachableTiles([...items], undefined, flags);
      for (const p of OVERWORLD.places) {
        if (!tiles.has(`${p.x},${p.y}`)) continue;
        if ((p.hidden === 'radio' || p.radio) && !items.has('radio')) continue;
        if (p.doneFlag && flags.has(p.doneFlag)) continue;
        if (p.requires && !p.requires.every((f) => flags.has(f))) continue;
        if (p.area) explore({ area: p.area, entry: p.entry });
        else if (p.dialog) talk(p.dialog);
      }
      // All of Dagmar's voice heard in the radio: someone in the mountain answers (game/overworld.ts).
      if (!flags.has('bruset_klart') && [1, 2, 3, 4].every((n) => flags.has(`bruset_${n}`))) talk('bruset_klart');
      if (opts.meetings) {
        const types = new Set<string>();
        for (const k of tiles) {
          const [x, y] = k.split(',').map(Number);
          const ty = TERRAIN_TYPE[OVERWORLD.tiles[y][x]];
          if (ty) types.add(ty);
        }
        for (const ty of types) {
          for (const o of ENCOUNTER_TABLES[ty as keyof typeof ENCOUNTER_TABLES]) {
            where = 'overworld';
            explore({ area: o.area });
          }
        }
      }
    }
    const now = JSON.stringify([[...flags].sort(), [...items].sort(), [...spells], [...skills], containers.size, lives.size, done.size]);
    if (!changed && now === snapshot) break;
    snapshot = now;
  }
  if (wave > max) problems.push(`no rest after ${max} waves: something keeps changing back and forth`);

  return { finished, waves: wave, steps, flags, items, spells, skills, containers, lives, areas, dialogs, npcs, problems };
}

// --- A readable walkthrough -----------------------------------------------------------

/** What an NPC is called: the speaker of the first of its dialogs that names one. */
function npcName(id: string): string {
  for (const t of NPCS[id]?.talk ?? []) {
    const s = DIALOG[t.dialog]?.speaker;
    if (s) return s;
  }
  return id;
}

/**
 * The playthrough as Markdown, one section per wave: where Dagny can go now,
 * whom she meets and what she gets. Generated into docs/genomspelning.md.
 */
export function walkthroughMarkdown(r: Playthrough): string {
  const out: string[] = [
    '# Genomspelning',
    '',
    'Generated by `npm run walkthrough` from `src/tools/playthrough.ts` – do not edit by hand.',
    '',
    'The shortest logical way through the game: every "wave" is what becomes possible',
    'with what Dagny has after the wave before. Fights and jumps are taken as won;',
    'what is checked is that every door, gate, condition and dialog fits together.',
    '',
  ];
  const name = (s: Step): string => {
    switch (s.kind) {
      case 'area':
        return AREAS[s.what]?.name ?? s.what;
      case 'talk':
      case 'burn':
        return npcName(s.what);
      case 'item':
      case 'lose':
        return ITEMS[s.what]?.name ?? s.what;
      case 'spell':
        return SPELLS[s.what as keyof typeof SPELLS]?.name ?? s.what;
      case 'skill':
        return SKILLS[s.what as keyof typeof SKILLS]?.name ?? s.what;
      case 'boss':
        return BOSSES[s.what]?.name ?? s.what;
      default:
        return s.what;
    }
  };
  const label: Partial<Record<Step['kind'], string>> = {
    item: 'gets',
    lose: 'hands over',
    spell: 'learns',
    skill: 'learns',
    boss: 'reconciles',
    container: 'finds a container',
    life: 'finds a näverdocka',
    key: 'finds a key',
    door: 'unlocks a door',
    burn: 'sets fire to',
    scene: 'scene:',
  };
  const waves = [...new Set(r.steps.map((s) => s.wave))];
  for (const w of waves) {
    out.push(`## ${w}`, '');
    const here = r.steps.filter((s) => s.wave === w && s.kind !== 'flag' && s.kind !== 'hear');
    const places = [...new Set(here.map((s) => s.where))];
    for (const p of places) {
      const at = here.filter((s) => s.where === p);
      const talks = at.filter((s) => s.kind === 'talk').map(name);
      const did = at.filter((s) => label[s.kind]).map((s) => `${label[s.kind]} ${s.kind === 'container' || s.kind === 'life' || s.kind === 'key' || s.kind === 'door' ? '' : name(s)}`.trim());
      const parts = [talks.length ? `meets ${talks.join(', ')}` : '', ...did].filter(Boolean);
      out.push(`- **${AREAS[p]?.name ?? p}**${parts.length ? ': ' + parts.join('; ') : ''}`);
    }
    out.push('');
  }
  out.push(r.finished ? 'The credits roll.' : '**The game cannot be finished.**', '');
  return out.join('\n');
}
