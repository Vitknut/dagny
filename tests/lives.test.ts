import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { ENEMIES } from '../src/data/enemies';
import { TEMPLES } from '../src/data/temples';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import type { ProjectileInit, WorldApi } from '../src/entities/types';
import type { Game } from '../src/game/game';
import { LAST_TEMPLE, gameOver, retryRoom } from '../src/game/flow';
import { GameOverOverlay } from '../src/game/menus';
import { deserialize, serialize } from '../src/game/save';
import { MAX_LIVES, START_LIVES, hpMax, mpMax, newGame, type GameState } from '../src/game/state';

/** Just enough of a Game for the Game Over screen and flow (scene changes are skipped). */
function fakeGame(state: GameState): Game {
  return {
    state,
    audio: { play: () => undefined, playMusic: () => undefined },
    transition: () => undefined,
    save: () => undefined,
  } as unknown as Game;
}

describe('lives', () => {
  it('a new game starts with three', () => {
    expect(newGame().lives).toBe(START_LIVES);
    expect(START_LIVES).toBe(3);
  });

  it('are saved, and older saves get a full set', () => {
    const s = newGame();
    s.lives = 5;
    expect(deserialize(serialize(s))!.state.lives).toBe(5);
    const old = JSON.parse(serialize(newGame()));
    delete old.state.lives;
    expect(deserialize(JSON.stringify(old))!.state.lives).toBe(START_LIVES);
    old.state.lives = 99;
    expect(deserialize(JSON.stringify(old))!.state.lives).toBe(MAX_LIVES);
  });

  it('each defeat costs one; the last one is Game Over', () => {
    const s = newGame();
    new GameOverOverlay(fakeGame(s), null);
    expect(s.lives).toBe(2);
    new GameOverOverlay(fakeGame(s), 'krypta');
    expect(s.lives).toBe(1);
    new GameOverOverlay(fakeGame(s), null);
    expect(s.lives).toBe(0);
  });

  it('Game Over starts over at Mormor’s with full lives, unspent XP lost', () => {
    const s = newGame();
    s.lives = 0;
    s.xp = 321;
    s.hp = 1;
    s.lastVillage = 'kyrkbyn';
    s.checkpoint = { area: 'krypta_2', x: 10, y: 10 };
    let to = '';
    const g = { ...fakeGame(s), transition: () => (to = 'moved') } as unknown as Game;
    gameOver(g, 'krypta');
    expect(to).toBe('moved');
    expect(s.lives).toBe(START_LIVES);
    expect(s.xp).toBe(0);
    expect(s.hp).toBe(hpMax(s));
    expect(s.checkpoint).toBeNull();
  });

  it('a lost life keeps the XP; only Game Over takes it', () => {
    const s = newGame();
    s.xp = 50;
    new GameOverOverlay(fakeGame(s), null, { area: 'bjorkhagen', entry: 'W' });
    expect(s.xp).toBe(50);
  });

  it('the Game Over screen is silent but for Bergakungen laughing', () => {
    const s = newGame();
    s.lives = 1;
    const heard: Array<string | null> = [];
    const g = { ...fakeGame(s), input: {}, audio: { play: (id: string) => heard.push(id), playMusic: (id: string | null) => heard.push(id) } } as unknown as Game;
    const o = new GameOverOverlay(g, null);
    for (let i = 0; i < 100; i++) o.update();
    expect(heard).toEqual([null, 'laugh']);
  });

  it('in Trollberget Game Over puts every candle on the mountain out', () => {
    const s = newGame();
    s.lives = 0;
    s.opened = ['cp:troll_2:39,9', 'cp:krypta_1:13,9', 'troll_1:46,3'];
    s.checkpoint = { area: 'troll_2', x: 1, y: 1 };
    gameOver(fakeGame(s), LAST_TEMPLE);
    expect(s.opened).toEqual(['cp:krypta_1:13,9', 'troll_1:46,3']);
    expect(s.checkpoint).toBeNull();
    expect(s.lives).toBe(START_LIVES);
  });

  it('with lives left in a temple, the retry is in the same room – at the guardian in its hall', () => {
    const s = newGame();
    const o = new GameOverOverlay(fakeGame(s), 'krypta', { area: 'krypta_4', entry: 'A' });
    const labels = (o as unknown as { menu: { items: Array<{ label: string }> } }).menu.items.map((i) => i.label);
    expect(labels[0]).toBe('Försök igen');
    expect(labels).toHaveLength(2); // or wake in the village
  });

  it('a retry fills Dagny up again – health and magic – and moves her', () => {
    const s = newGame();
    s.hp = 0;
    s.mp = 0;
    let moved = false;
    const g = { ...fakeGame(s), transition: () => (moved = true) } as unknown as Game;
    retryRoom(g, 'krypta_4', 'A');
    expect(moved).toBe(true);
    expect(s.hp).toBe(hpMax(s));
    expect(s.mp).toBe(mpMax(s));
  });

  it('outside temples too, a lost life means trying again in the same place (or waking in the village)', () => {
    const o = new GameOverOverlay(fakeGame(newGame()), null, { area: 'bjorkhagen', entry: 'W' });
    const labels = (o as unknown as { menu: { items: Array<{ label: string }> } }).menu.items.map((i) => i.label);
    expect(labels).toEqual(['Försök igen', 'Vakna hos mormor']);
  });

  it('every temple has a door to retry at (entry marker A)', () => {
    for (const t of TEMPLES) {
      const a = AREAS[t.entryArea ?? ''];
      expect(a, t.id).toBeDefined();
      expect(a.tiles.some((r) => r.includes('A')), t.id).toBe(true);
    }
  });
});

describe('näverdockor (extra lives)', () => {
  const dolls = Object.values(AREAS).flatMap((a) => a.tiles.flatMap((r, y) => [...r].flatMap((ch, x) => (ch === '+' ? [{ a, x, y }] : []))));

  it('are hidden in at least six places, one per room', () => {
    expect(dolls.length).toBeGreaterThanOrEqual(6);
    expect(new Set(dolls.map((d) => d.a.id)).size).toBe(dolls.length);
  });

  it('one can be found before the first temple', () => {
    // On the ledge at the old churchyard, in the home valley.
    expect(dolls.some((d) => d.a.id === 'kyrkogarden')).toBe(true);
  });

  it('rest on something solid', () => {
    for (const d of dolls) {
      const below = d.a.tiles[d.y + 1][d.x];
      expect('#=?'.includes(below), `${d.a.id} ${d.x},${d.y}`).toBe(true);
    }
  });
});

describe('Trollberget', () => {
  const rooms = Object.values(AREAS).filter((a) => a.temple === 'trollberget');

  it('is the longest temple, and every room in it is hard', () => {
    for (const t of TEMPLES.filter((x) => x.id !== 'trollberget')) {
      expect(rooms.length).toBeGreaterThan(Object.values(AREAS).filter((a) => a.temple === t.id).length);
    }
    for (const a of rooms.filter((r) => r.id !== 'troll_4')) expect(a.hard, a.id).toBe(true);
  });

  it('Trollgångarna: one door in each maze room goes on, the others lead back', () => {
    for (const id of ['troll_gangar_1', 'troll_gangar_2']) {
      const doors = Object.values(AREAS[id].doors ?? {});
      expect(doors.length, id).toBe(3);
      const on = doors.filter((d) => !d.to.startsWith('troll_gangar_1'));
      expect(on.length, id).toBe(1);
      for (const d of doors.filter((x) => x !== on[0])) expect(d.dialog, id).toBeDefined();
    }
  });

  it('the path runs through the maze and Skuggan’s hall to the Bergakung', () => {
    const order = ['troll_1', 'troll_2', 'troll_gangar_1', 'troll_gangar_2', 'troll_3', 'troll_skugga', 'troll_4'];
    const next = (id: string): string | undefined => {
      const a = AREAS[id];
      const ways = [a.right?.to, ...Object.values(a.doors ?? {}).filter((d) => !d.dialog).map((d) => d.to)];
      return ways.find((w) => w && w !== id && w !== 'overworld');
    };
    for (let i = 0; i < order.length - 1; i++) expect(next(order[i]), order[i]).toBe(order[i + 1]);
    expect(AREAS.troll_skugga.sealed).toBeDefined();
    expect(AREAS.troll_skugga.tiles.join('')).toContain('*');
  });
});

describe('Skuggan', () => {
  function world(ducking: () => boolean, shots: ProjectileInit[]): WorldApi {
    const w = 30;
    const h = 12;
    const kinds = new Uint8Array(w * h);
    for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
    const grid: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
    const player = { x: 100, y: 165 };
    return {
      grid,
      frame: 0,
      playerCenter: () => player,
      playerBox: () => ({ x: player.x - 5, y: player.y - 11, w: 10, h: 22 }),
      playerDucking: ducking,
      spawnProjectile: (p) => shots.push(p),
      puff: () => undefined,
      sparks: () => undefined,
      sfx: () => undefined,
      shake: () => undefined,
      gust: () => undefined,
      spawnEnemy: () => false,
      minions: () => 0,
      lit: () => false,
    };
  }

  it('mirrors Dagny’s guard and parries strikes there', () => {
    let duck = false;
    const wd = world(() => duck, []);
    const sk = new Enemy(ENEMIES.skuggan, 200, 176);
    for (let i = 0; i < 20; i++) sk.update(wd);
    expect(sk.guard).toBe('high');
    expect(sk.takeHit(5, 100, 'high', wd)).toBe('blocked');
    duck = true;
    for (let i = 0; i < 20; i++) sk.update(wd);
    expect(sk.guard).toBe('low');
    sk.iframes = 0;
    expect(sk.takeHit(5, 100, 'low', wd)).toBe('blocked');
  });

  it('a thrust from above gets through her guard', () => {
    const wd = world(() => false, []);
    const sk = new Enemy(ENEMIES.skuggan, 200, 176);
    for (let i = 0; i < 20; i++) sk.update(wd);
    expect(sk.takeHit(5, 100, 'down', wd)).toBe('hit');
  });

  it('throws cuts from a distance, then stands open', () => {
    const shots: ProjectileInit[] = [];
    const wd = world(() => false, shots);
    const sk = new Enemy(ENEMIES.skuggan, 230, 176);
    let opened = false;
    for (let i = 0; i < 400; i++) {
      sk.update(wd);
      if (shots.length && sk.frame === 1) {
        opened = true;
        break;
      }
    }
    expect(shots.length).toBeGreaterThan(0);
    expect(opened).toBe(true);
    sk.iframes = 0;
    expect(sk.takeHit(5, 100, 'high', wd)).toBe('hit');
  });
});
