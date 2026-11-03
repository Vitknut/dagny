import { drawSprite } from '../engine/sprites';
import { drawText } from '../engine/text';
import { SPELLS } from '../data/spells';
import { STR } from '../data/strings';
import { hpMax, mpMax, type GameState } from './state';
import { nextTarget } from './progression';
import { P, drawBar } from './ui';

/**
 * HUD: life, magic, levels (S/M/L) and XP along the top edge, clear of the
 * touch controls (which live in the bottom corners and the top-right corner).
 */
export function drawHud(ctx: CanvasRenderingContext2D, s: GameState, opts: { keys?: number; frame: number; lowHpBlink?: boolean }): void {
  const mh = hpMax(s);
  const mm = mpMax(s);
  // Life
  drawSprite(ctx, 'hudHeart', 0, 5, 5);
  const blink = s.hp <= 2 && Math.floor(opts.frame / 15) % 2 === 0;
  drawBar(ctx, 14, 6, s.hp, mh, blink ? P.Y : P.R, P.d, 2);
  // Magic
  drawSprite(ctx, 'hudCup', 0, 5, 14);
  drawBar(ctx, 14, 15, s.mp, mm, P.U, P.n, 1);
  if (s.selectedSpell) {
    drawText(ctx, SPELLS[s.selectedSpell].name, 14, 22, 'W', { shadow: 'k' });
  }
  // Levels and XP
  const lx = 120;
  // Levels as the same pictures as the bars: a blade for strength, the cup for
  // magic, the heart for life – clearer than letters.
  let x = lx;
  drawBlade(ctx, x, 5);
  x += 9 + drawText(ctx, `${s.levels.styrka}`, x + 9, 4, 'Y', { shadow: 'k' }) + 5;
  drawSprite(ctx, 'hudCup', 0, x, 5);
  x += 9 + drawText(ctx, `${s.levels.magi}`, x + 9, 4, 'c', { shadow: 'k' }) + 5;
  drawSprite(ctx, 'hudHeart', 0, x, 5);
  x += 9 + drawText(ctx, `${s.levels.liv}`, x + 9, 4, 'i', { shadow: 'k' }) + 8;
  const target = nextTarget(s.levels);
  const xpText = target === null ? `${STR.xp} ${s.xp}` : `${STR.xp} ${s.xp}/${target}`;
  drawText(ctx, xpText, x, 4, target !== null && s.xp >= target ? 'Y' : 'W', { shadow: 'k' });
  // Lives (näverdockor), then keys beside them.
  drawSprite(ctx, 'hudLife', 0, lx, 16);
  drawText(ctx, `×${s.lives}`, lx + 9, 15, s.lives <= 1 ? 'Y' : 'W', { shadow: 'k' });
  if (opts.keys !== undefined && opts.keys > 0) {
    drawSprite(ctx, 'key', 0, lx + 26, 16);
    drawText(ctx, `×${opts.keys}`, lx + 36, 15, 'W', { shadow: 'k' });
  }
}

/** A small blade, the picture for strength in the HUD. */
function drawBlade(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // A dark shadow under it, like the text's.
  ctx.fillStyle = '#2b2233';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 3 + i, y + 5 - i, 1, 1);
  ctx.fillRect(x + 2, y + 5, 3, 1);
  ctx.fillStyle = '#f3e6c8';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 2 + i, y + 4 - i, 1, 1);
  ctx.fillStyle = '#d6a046';
  ctx.fillRect(x + 1, y + 4, 2, 1);
  ctx.fillRect(x + 2, y + 3, 1, 3);
}
