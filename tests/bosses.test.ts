import { describe, expect, it } from 'vitest';
import { BOSSES } from '../src/data/enemies';
import { Enemy } from '../src/entities/enemy';
import { stubWorld } from './helpers/world';

/**
 * Every guardian, run for a long while in each phase with Dagny standing
 * left, right or below it: it must be open to the blade a fair share of the
 * time, and it must change what it does. (Bäckahästen once stayed in the
 * water spitting for ever; this would have caught it.)
 */
const STEPS = 3000;

describe('every guardian can be fought over time', () => {
  for (const def of Object.values(BOSSES)) {
    for (const phase of [0, 1]) {
      for (const [where, px] of [['left', 60], ['right', 400], ['below', 240]] as const) {
        // Two starting beats: a choice hung on an even step count once hid the bug half the time.
        for (const beat of [0, 1]) it(`${def.id}, phase ${phase + 1}, Dagny ${where}, beat ${beat}`, () => {
          const w = stubWorld({ w: 30, h: 12, pond: [12, 18], player: { x: px, y: 165 } });
          const b = new Enemy(def, 240, 176);
          b.update(w);
          b.awake = true;
          b.t += beat;
          if (phase === 1) b.hp = Math.floor(b.maxHp * 0.4);
          let open = 0;
          const modes = new Set<number>();
          for (let i = 0; i < STEPS; i++) {
            b.iframes = 0;
            b.update(w);
            if (b.dead) break;
            if (!b.untouchable && !b.veiled) open++;
            modes.add(b.mode);
          }
          expect(open / STEPS, `${def.id}: open share`).toBeGreaterThan(0.15);
          expect(modes.size, `${def.id}: changes what it does`).toBeGreaterThan(1);
        });
      }
    }
  }
});
