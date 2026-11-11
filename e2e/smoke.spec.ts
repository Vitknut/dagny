import { expect, test, type Page } from '@playwright/test';

/**
 * A short play on an emulated phone held sideways, with the on-screen
 * controls: title → new game → the intro → Hulda → walk → strike → pause and
 * back → out of the village onto the map. Also the stuck stick from
 * 9 November: a finger whose "up" never comes, the window losing focus, and
 * a new finger that must take the stick.
 */

interface Peek {
  scene: string;
  overlays: number;
  fading: boolean;
  x: number;
  state: string;
}

const peek = (page: Page): Promise<Peek> =>
  page.evaluate(() => {
    const g = (window as unknown as { dagny: Record<string, never> }).dagny as unknown as {
      scene: { constructor: { name: string }; player?: { x: number; state: string } } | null;
      overlays: unknown[];
      transitioning: boolean;
    };
    return {
      scene: g.scene?.constructor.name ?? '',
      overlays: g.overlays.length,
      fading: g.transitioning,
      x: g.scene?.player?.x ?? NaN,
      state: g.scene?.player?.state ?? '',
    };
  });

/** A finger on one of the controls (by class), by pointer id; `dx`/`dy` from its centre. */
async function finger(page: Page, sel: string, type: 'pointerdown' | 'pointermove' | 'pointerup', id: number, dx = 0, dy = 0): Promise<void> {
  await page.evaluate(
    ({ sel, type, id, dx, dy }) => {
      const el = document.querySelector(sel) as HTMLElement;
      const r = el.getBoundingClientRect();
      el.dispatchEvent(
        new PointerEvent(type, {
          pointerId: id, pointerType: 'touch', isPrimary: id === 1, bubbles: true, cancelable: true,
          clientX: r.left + r.width / 2 + dx * r.width, clientY: r.top + r.height / 2 + dy * r.height,
        }),
      );
    },
    { sel, type, id, dx, dy },
  );
}

/** Press the jump button (it also says yes in menus) until `done` holds: the title, cards, dialogs. */
async function confirmUntil(page: Page, done: (p: Peek) => boolean, what: string): Promise<void> {
  for (let i = 0; i < 120; i++) {
    const p = await peek(page);
    if (done(p)) return;
    if (!p.fading) {
      await finger(page, '.ctl-jump', 'pointerdown', 90);
      await page.waitForTimeout(60);
      await finger(page, '.ctl-jump', 'pointerup', 90);
    }
    await page.waitForTimeout(150);
  }
  throw new Error(`gave up waiting for ${what}: ${JSON.stringify(await peek(page))}`);
}

const STICK = '.ctl-stick';

test('a first play on a phone', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => 'dagny' in window);
  await expect(page.locator(STICK)).toBeVisible();

  // Title → new game → the intro cards → the village, nothing open.
  await confirmUntil(page, (p) => p.scene === 'SideScene' && p.overlays === 0 && !p.fading, 'the village');

  // Hulda stands beside Dagny: the stick pushed up talks to her (once the
  // presses that closed the intro have settled, as for a player).
  await page.waitForTimeout(1500);
  await finger(page, STICK, 'pointerdown', 1, 0, -0.45);
  await expect.poll(async () => (await peek(page)).overlays, { message: 'Hulda answers' }).toBeGreaterThan(0);
  await finger(page, STICK, 'pointerup', 1);
  await confirmUntil(page, (p) => p.overlays === 0 && !p.fading, 'the end of her words');

  // Walk right with the stick.
  const x0 = (await peek(page)).x;
  await finger(page, STICK, 'pointerdown', 2, 0.45, 0);
  await expect.poll(async () => (await peek(page)).x, { message: 'walks right' }).toBeGreaterThan(x0 + 16);
  await finger(page, STICK, 'pointerup', 2);

  // Strike.
  await finger(page, '.ctl-sword', 'pointerdown', 3);
  await expect.poll(async () => (await peek(page)).state, { message: 'strikes' }).toBe('attack');
  await finger(page, '.ctl-sword', 'pointerup', 3);

  // Pause, and back with the jump button (the cursor stands on "Fortsätt").
  await page.waitForTimeout(300);
  await finger(page, '.ctl-pause', 'pointerdown', 4);
  await expect.poll(async () => (await peek(page)).overlays, { message: 'the pause menu opens' }).toBe(1);
  await finger(page, '.ctl-jump', 'pointerdown', 5);
  await finger(page, '.ctl-jump', 'pointerup', 5);
  await expect.poll(async () => (await peek(page)).overlays, { message: 'the pause menu closes' }).toBe(0);

  // The stuck stick: one finger right whose "up" never comes, the window
  // loses focus, then a new finger to the left must take the stick.
  await page.waitForTimeout(300);
  await finger(page, STICK, 'pointerdown', 6, 0.45, 0);
  await page.waitForTimeout(200);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const x1 = (await peek(page)).x;
  await finger(page, STICK, 'pointerdown', 7, -0.45, 0);
  await expect.poll(async () => (await peek(page)).x, { message: 'the new finger walks her left' }).toBeLessThan(x1 - 16);

  // Keep going left, out of the village and onto the map.
  await expect
    .poll(async () => (await peek(page)).scene, { message: 'out onto the map', timeout: 20_000 })
    .toBe('OverworldScene');
  await finger(page, STICK, 'pointerup', 7);

  expect(errors, 'page errors').toEqual([]);
});
