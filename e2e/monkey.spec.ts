import { expect, test, type Page } from '@playwright/test';
import { AREAS } from '../src/data/areas';

/**
 * A random player in every room: 2 000 steps of random buttons, once as a
 * girl and once as a bird (Hamn), with a fixed seed per room so a failure can
 * be run again. Every tenth step Dagny must stand clear of walls and have a
 * real position, and the page must never throw.
 *
 * Every spell and item is held, and guardians are woken. Leaving the room or
 * falling puts Dagny back at the room's first entry.
 */
const STEPS = 2000;
const SEED = Number(process.env.MONKEY_SEED ?? 1);

async function boot(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => 'dagny' in window);
  return errors;
}

for (const id of Object.keys(AREAS)) {
  for (const form of ['girl', 'bird'] as const) {
    test(`${id} (${form})`, async ({ page }) => {
      const errors = await boot(page);
      const bad = await page.evaluate(
        async ({ id, form, steps, seed }) => {
          const { SideScene } = await import('/src/game/sidescene.ts');
          const { newGame, hpMax, mpMax } = await import('/src/game/state.ts');
          const { rectHitsSolid } = await import('/src/engine/collision.ts');
          const { SPELLS } = await import('/src/data/spells.ts');
          const { ITEMS } = await import('/src/data/items.ts');
          type G = {
            state: ReturnType<typeof newGame> | null;
            scene: unknown;
            overlays: unknown[];
            input: { keyboard: boolean[]; consume(): void };
            setScene(s: unknown): void;
            update(): void;
          };
          const g = (window as unknown as { dagny: G }).dagny;
          const s = newGame();
          s.flags.push('intro_done');
          s.spells = Object.keys(SPELLS) as typeof s.spells;
          s.items = Object.keys(ITEMS);
          s.levels = { styrka: 6, magi: 6, liv: 6 };
          g.state = s;
          // A small fixed-seed random (mulberry32).
          let r = (seed * 2654435761 + [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) >>> 0;
          const rnd = (): number => {
            r = (r + 0x6d2b79f5) >>> 0;
            let t = r;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
          type Sc = InstanceType<typeof SideScene>;
          const enter = (): Sc => {
            const gg = g as unknown as { fadeDir: number; fade: number; fadeCb: unknown };
            gg.fadeDir = 0;
            gg.fade = 0;
            gg.fadeCb = null;
            g.overlays.length = 0;
            const sc = new SideScene(g as never, id, { entry: 'A' });
            g.setScene(sc);
            for (const e of sc.enemies) if (e.boss) e.awake = true;
            if (form === 'bird') {
              sc.player.enterBird();
              sc.spell.hamn = 1e6;
            }
            return sc;
          };
          let sc = enter();
          // Buttons the monkey may hold: no pause, and the bird keeps its form.
          const buttons = form === 'bird' ? [0, 1, 2, 3, 4, 5, 8] : [0, 1, 2, 3, 4, 5, 6, 8];
          const kb = g.input.keyboard;
          // The last steps, to tell what happened when something goes wrong.
          const trail: string[] = [];
          for (let i = 0; i < steps; i++) {
            // Hold a button for a while, let go of another now and then.
            if (rnd() < 0.15) kb[buttons[Math.floor(rnd() * buttons.length)]] = true;
            if (rnd() < 0.12) kb[buttons[Math.floor(rnd() * buttons.length)]] = false;
            s.hp = hpMax(s);
            s.mp = mpMax(s);
            g.update();
            const q = sc.player;
            trail.push(`${i}:${Math.round(q.x)},${Math.round(q.y)} ${q.w}x${q.h} ${q.state} [${kb.map((b, k) => (b ? k : '')).join('')}]`);
            if (trail.length > 12) trail.shift();
            if (g.scene !== sc || (g as unknown as { fadeDir: number }).fadeDir !== 0) sc = enter();
            if (i % 10 === 0) {
              const p = sc.player;
              if (!Number.isFinite(p.x + p.y + p.vx + p.vy)) return `step ${i}: NaN at ${p.x},${p.y}`;
              if (rectHitsSolid(sc.grid, p)) return `step ${i}: inside a wall at ${Math.round(p.x)},${Math.round(p.y)} (${p.state})\n${trail.join('\n')}`;
              for (const e of sc.enemies) if (!e.dead && !Number.isFinite(e.x + e.y)) return `step ${i}: ${e.def.id} NaN`;
            }
          }
          kb.fill(false);
          return null;
        },
        { id, form, steps: STEPS, seed: SEED },
      );
      expect(bad, `${id} (${form}), seed ${SEED}`).toBeNull();
      expect(errors, 'page errors').toEqual([]);
    });
  }
}
