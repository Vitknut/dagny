import { expect, test, type Page } from '@playwright/test';

/**
 * The rule of three's new obstacles, played in the real game (fas 3):
 * rotten boards break to a thrust from above, a fireball burns dry roots,
 * thunder opens a lantern gate, and the light path is there only in Lyse.
 * Runs with the monkey (nightly): each case is a few hundred steps.
 */

type Result = { open: boolean[]; opened: boolean; note: string };

/** Puts Dagny in `room` at tile (tx, ty) with every ability, runs `steps` steps of `keys`, and reports on `cells`. */
async function play(page: Page, room: string, tx: number, ty: number, facing: 1 | -1, setup: string, keys: number[], steps: number, cells: Array<[number, number]>): Promise<Result> {
  return page.evaluate(
    async ({ room, tx, ty, facing, setup, keys, steps, cells }) => {
      const { SideScene } = await import('/src/game/sidescene.ts');
      const { newGame } = await import('/src/game/state.ts');
      const { SPELLS } = await import('/src/data/spells.ts');
      const { castSpell } = await import('/src/game/side/spells.ts');
      const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
        state: ReturnType<typeof newGame>;
        overlays: unknown[];
        input: { keyboard: boolean[] };
        setScene(s: unknown): void;
        update(): void;
      };
      const s = newGame();
      s.flags.push('intro_done');
      s.spells = Object.keys(SPELLS) as typeof s.spells;
      s.skills = ['nedatstot', 'uppatstot'];
      s.levels = { styrka: 6, magi: 8, liv: 6 };
      s.mp = 99;
      g.state = s;
      g.overlays.length = 0;
      const sc = new SideScene(g as never, room, { x: tx * 16 + 3, y: (ty + 1) * 16 - 22, facing });
      g.setScene(sc);
      // No creatures in the way: this is about the room.
      for (const e of sc.enemies) e.dead = true;
      if (setup === 'eld') sc.spell.eld = 600;
      if (setup === 'lyse') sc.spell.lyse = 600;
      if (setup === 'aska') {
        s.selectedSpell = 'aska';
        castSpell(sc);
      }
      const kb = g.input.keyboard;
      kb.fill(false);
      for (let i = 0; i < steps; i++) {
        // Keys are held, except the sword and jump, which are tapped every 20 steps.
        for (const k of keys) kb[k] = k === 4 || k === 5 ? i % 20 < 2 : true;
        g.update();
        g.overlays.length = 0;
      }
      kb.fill(false);
      const w = sc.grid.w;
      return {
        open: cells.map(([x, y]) => sc.grid.kinds[y * w + x] !== 1),
        opened: cells.some(([x, y]) => s.opened.includes(sc.pid(x, y))),
        note: `${Math.round(sc.player.x)},${Math.round(sc.player.y)} ${sc.player.state}`,
      };
    },
    { room, tx, ty, facing, setup, keys, steps, cells },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => 'dagny' in window);
});

test('rotten boards break to a thrust from above (krypta_3)', async ({ page }) => {
  // Above the lid at (38..39, 7), falling with Down held: Nedåtstöt.
  const r = await play(page, 'krypta_3', 38, 4, 1, '', [3, 4], 90, [[38, 7], [39, 7]]);
  expect(r.open.some(Boolean), r.note).toBe(true);
  expect(r.opened, r.note).toBe(true);
});

test('dry roots burn to a fireball (gruvan_1)', async ({ page }) => {
  // Right of the roots at (39, 8..9), facing them, striking with Eld burning.
  const r = await play(page, 'gruvan_1', 42, 9, -1, 'eld', [5], 60, [[39, 8], [39, 9]]);
  expect(r.open, r.note).toEqual([true, true]);
});

test('thunder opens a gate of dead lanterns (fyren_3)', async ({ page }) => {
  const r = await play(page, 'fyren_3', 27, 9, -1, 'aska', [], 5, [[24, 8], [24, 9]]);
  expect(r.open, r.note).toEqual([true, true]);
});

test('the light path is there only in the light (kvarnen_2)', async ({ page }) => {
  const dark = await play(page, 'kvarnen_2', 40, 9, 1, '', [], 5, [[42, 8], [45, 6]]);
  expect(dark.open, 'dark').toEqual([true, true]);
  const lit = await page.evaluate(() => {
    const sc = (window as unknown as { dagny: { scene: { spell: { lyse: number }; grid: { w: number; kinds: Uint8Array } } ; update(): void } }).dagny;
    sc.scene.spell.lyse = 600;
    sc.update();
    const g = sc.scene.grid;
    return [g.kinds[8 * g.w + 42], g.kinds[6 * g.w + 45]];
  });
  // Kind.OneWay is 2.
  expect(lit).toEqual([2, 2]);
});

test('on the map, Eld burns the dry thicket beside Dagny, and nothing else does', async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { OverworldScene } = await import('/src/game/overworld.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      input: { keyboard: boolean[] };
      setScene(s: unknown): void;
      update(): void;
    };
    const s = newGame();
    s.flags.push('intro_done');
    s.spells = ['eld', 'lyse'];
    s.mp = 20;
    // Beside the thicket at (18, 28), standing below it.
    s.ow = { x: 18, y: 29 };
    s.loc = { area: 'overworld', x: 18, y: 29 };
    g.state = s;
    g.overlays.length = 0;
    g.setScene(new OverworldScene(g as never));
    const press = (): void => {
      g.input.keyboard[6] = true;
      g.update();
      g.input.keyboard[6] = false;
      for (let i = 0; i < 10; i++) g.update();
    };
    for (let i = 0; i < 30; i++) g.update();
    s.selectedSpell = 'lyse';
    press();
    const wrong = s.flags.includes('snar_1_brant');
    s.selectedSpell = 'eld';
    press();
    return { wrong, right: s.flags.includes('snar_1_brant'), mp: s.mp, dialog: g.overlays.length };
  });
  expect(r.wrong).toBe(false);
  expect(r.right).toBe(true);
  expect(r.mp).toBeLessThan(20);
  expect(r.dialog).toBe(1);
});

test('the mine lifts stand still without the crank, and run with it (gruvan_2)', async ({ page }) => {
  const moved = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      setScene(s: unknown): void;
      update(): void;
    };
    const out: boolean[] = [];
    for (const crank of [false, true]) {
      const s = newGame();
      s.flags.push('intro_done');
      if (crank) s.items.push('hissvev');
      g.state = s;
      g.overlays.length = 0;
      const sc = new SideScene(g as never, 'gruvan_2', { entry: 'A' });
      g.setScene(sc);
      const y0 = sc.platforms.map((p) => p.y);
      for (let i = 0; i < 200; i++) {
        g.update();
        g.overlays.length = 0;
      }
      out.push(sc.platforms.some((p, i) => p.y !== y0[i]));
    }
    return out;
  });
  expect(moved).toEqual([false, true]);
});

test('the workshop opens when the ore giant falls, and the crank lies there (gruvan_verkstad)', async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      setScene(s: unknown): void;
      update(): void;
    };
    const s = newGame();
    s.flags.push('intro_done');
    g.state = s;
    g.overlays.length = 0;
    const sc = new SideScene(g as never, 'gruvan_verkstad', { x: 8 * 16, y: 10 * 16 - 22 });
    g.setScene(sc);
    const step = (n: number): void => {
      for (let i = 0; i < n; i++) {
        g.update();
        g.overlays.length = 0;
        s.hp = 99;
      }
    };
    step(30);
    const shut = sc.grid.kinds[8 * sc.grid.w] === 1;
    const crankBefore = sc.pickups.some((p) => p.pid === 'hissvev');
    for (const e of sc.enemies) e.dead = true;
    step(30);
    return { shut, crankBefore, cleared: s.flags.includes('gruvan_verkstad_rensad'), crankAfter: sc.pickups.some((p) => p.pid === 'hissvev') };
  });
  expect(r).toEqual({ shut: true, crankBefore: false, cleared: true, crankAfter: true });
});

test('loose stones come down to a blow with the crowbar in the pack, not without it (krypta_hall)', async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      input: { keyboard: boolean[] };
      setScene(s: unknown): void;
      update(): void;
    };
    const out: boolean[] = [];
    for (const bar of [false, true]) {
      const s = newGame();
      s.flags.push('intro_done');
      if (bar) s.items.push('spett');
      g.state = s;
      g.overlays.length = 0;
      // Just left of the wall at column 40, facing it.
      const sc = new SideScene(g as never, 'krypta_hall', { x: 38 * 16 + 4, y: 10 * 16 - 22, facing: 1 });
      g.setScene(sc);
      for (const e of sc.enemies) e.dead = true;
      for (let i = 0; i < 80; i++) {
        // Walk up to the wall and strike, as a player would.
        g.input.keyboard[1] = i < 40;
        g.input.keyboard[5] = i >= 40 && i % 20 < 2;
        g.update();
        g.overlays.length = 0;
      }
      g.input.keyboard.fill(false);
      out.push(sc.grid.kinds[8 * sc.grid.w + 40] !== 1);
    }
    return out;
  });
  expect(r).toEqual([false, true]);
});

test('the sacristy opens when the bell-ringer falls, and the crowbar lies there (krypta_sakristia)', async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      setScene(s: unknown): void;
      update(): void;
    };
    const s = newGame();
    s.flags.push('intro_done');
    g.state = s;
    g.overlays.length = 0;
    const sc = new SideScene(g as never, 'krypta_sakristia', { x: 8 * 16, y: 10 * 16 - 22 });
    g.setScene(sc);
    const step = (n: number): void => {
      for (let i = 0; i < n; i++) {
        g.update();
        g.overlays.length = 0;
        s.hp = 99;
      }
    };
    step(30);
    const shut = sc.grid.kinds[8 * sc.grid.w] === 1;
    for (const e of sc.enemies) e.dead = true;
    step(30);
    return { shut, crank: sc.pickups.some((p) => p.pid === 'spett'), cleared: s.flags.includes('krypta_sakristia_rensad') };
  });
  expect(r).toEqual({ shut: true, crank: true, cleared: true });
});

test('the hush before a guardian: quiet way in, the waiting tune, then it steps out and the way back shuts (krypta_4)', async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      input: { keyboard: boolean[] };
      setScene(s: unknown): void;
      update(): void;
    };
    const s = newGame();
    s.flags.push('intro_done');
    s.skills = ['nedatstot'];
    g.state = s;
    g.overlays.length = 0;
    const sc = new SideScene(g as never, 'krypta_4', { entry: 'A' });
    g.setScene(sc);
    const before = { music: sc.music(), awake: !!sc.boss?.awake, creatures: sc.enemies.filter((e) => !e.boss).length };
    // Walk right until the guardian wakes (or give up).
    let steps = 0;
    for (; steps < 900 && !sc.boss?.awake; steps++) {
      g.input.keyboard[1] = true;
      g.update();
      g.overlays.length = 0;
    }
    g.input.keyboard.fill(false);
    const hush = sc.area.hush ?? 0;
    const woke = {
      wokeAt: Math.floor(sc.player.x / 16),
      hush,
      after: sc.music(),
      shut: sc.grid.kinds[8 * sc.grid.w + hush] === 1,
      grille: sc.gateShut,
      tunnel: sc.grid.kinds[5 * sc.grid.w + 12] === 1,
    };
    // The guardian falls: the grille goes up again.
    const { killEnemy } = await import('/src/game/side/combat.ts');
    killEnemy(sc as never, sc.boss! as never);
    for (let i = 0; i < 120; i++) {
      g.update();
      g.overlays.length = 0;
    }
    return { before, ...woke, reopened: sc.grid.kinds[8 * sc.grid.w + hush] !== 1 && !sc.gateShut };
  });
  expect(r.before).toEqual({ music: 'vantan', awake: false, creatures: 0 });
  expect(r.wokeAt).toBeGreaterThanOrEqual(r.hush + 5);
  expect(r.after).toBe('boss');
  expect(r.shut).toBe(true);
  expect(r.grille, 'the grille is seen').toBe(true);
  expect(r.tunnel, 'the way in is a low tunnel').toBe(true);
  expect(r.reopened, 'the way back opens after the fight').toBe(true);
});

test("Prosten's candles light with Up, and walking past one does nothing (prastgardens_vind)", async ({ page }) => {
  const r = await page.evaluate(async () => {
    const { SideScene } = await import('/src/game/sidescene.ts');
    const { newGame } = await import('/src/game/state.ts');
    const g = (window as unknown as { dagny: Record<string, unknown> }).dagny as unknown as {
      state: ReturnType<typeof newGame>;
      overlays: unknown[];
      input: { keyboard: boolean[] };
      setScene(s: unknown): void;
      update(): void;
    };
    const s = newGame();
    s.flags.push('intro_done', 'eld_prov');
    g.state = s;
    g.overlays.length = 0;
    // On the lower floor at the start, walk right past the heart candle (7, 9).
    const sc = new SideScene(g as never, 'prastgardens_vind', { x: 3 * 16, y: 10 * 16 - 22, facing: 1 });
    g.setScene(sc);
    const step = (n: number, keys: number[] = []): void => {
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < 10; k++) g.input.keyboard[k] = keys.includes(k);
        g.update();
        g.overlays.length = 0;
      }
    };
    step(40);
    step(60, [1]);
    const pastHeart = sc.trial!.candles.filter((c) => c.lit).length;
    // Up at the sun candle (19, 4) on the upper floor.
    sc.player.place(19 * 16 + 3, 5 * 16 - 22);
    step(40);
    step(1, [2]);
    step(5);
    return { pastHeart, sun: sc.trial!.candles.find((c) => c.sign === 'sol')!.lit };
  });
  expect(r).toEqual({ pastHeart: 0, sun: true });
});
