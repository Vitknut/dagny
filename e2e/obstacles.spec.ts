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
