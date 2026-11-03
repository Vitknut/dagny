import { DIALOG } from '../data/dialog';
import type { DialogDef } from '../data/types';
import { Act } from '../engine/input';
import { VIEW_W } from '../engine/screen';
import { drawText, wrap, LINE_HEIGHT } from '../engine/text';
import type { Game, Overlay } from './game';
import { ListMenu, drawPostcard, drawStamp } from './ui';

const BOX_X = 14;
const BOX_Y = 8;
const BOX_W = VIEW_W - 28;
const TEXT_W = BOX_W - 20;
const LINES = 4;

/**
 * Runs a dialog chain: typewriter text on a postcard, optional choices,
 * actions at the end. Text supports å, ä and ö through the bitmap font.
 */
export class DialogOverlay implements Overlay {
  hideHud = true;
  private def: DialogDef;
  private page = 0;
  private lines: string[] = [];
  private shown = 0;
  private total = 0;
  private menu: ListMenu | null = null;
  private done = false;
  private blink = 0;

  constructor(private readonly game: Game, id: string, private readonly onDone?: () => void) {
    this.def = DialogOverlay.get(id);
    this.layout();
  }

  static get(id: string): DialogDef {
    return DIALOG[id] ?? { pages: [`[saknar dialog: ${id}]`] };
  }

  private layout(): void {
    const text = this.def.pages[this.page] ?? '';
    this.lines = wrap(text, TEXT_W).slice(0, LINES + 1);
    this.total = this.lines.reduce((a, l) => a + [...l].length, 0);
    this.shown = 0;
    this.menu = null;
  }

  private finishPage(): void {
    const last = this.page >= this.def.pages.length - 1;
    if (!last) {
      this.page++;
      this.layout();
      return;
    }
    // Last page done: run actions, then choices or the next dialog.
    for (const a of this.def.actions ?? []) this.game.runAction(a);
    if (this.def.choices && this.def.choices.length) {
      this.menu = new ListMenu(
        this.def.choices.map((c) => ({
          label: c.text,
          onSelect: () => {
            for (const a of c.actions ?? []) this.game.runAction(a);
            if (c.next) this.goto(c.next);
            else this.done = true;
          },
        })),
        this.game.audio,
      );
      return;
    }
    if (this.def.next) this.goto(this.def.next);
    else this.done = true;
  }

  private goto(id: string): void {
    this.def = DialogOverlay.get(id);
    this.page = 0;
    this.layout();
  }

  update(): boolean {
    if (this.done) {
      this.onDone?.();
      return false;
    }
    const input = this.game.input;
    this.blink++;
    if (this.menu) {
      this.menu.update(input);
      return true;
    }
    // Up too: it is what started the talk, so it is what players press to go on.
    const advance = input.confirm() || input.pressed(Act.Sword) || input.pressed(Act.Up) || input.taps.length > 0;
    if (this.shown < this.total) {
      const fast = input.held(Act.Jump) || input.held(Act.Sword);
      const before = Math.floor(this.shown);
      this.shown = Math.min(this.total, this.shown + (fast ? 3 : 0.9));
      if (Math.floor(this.shown) !== before && before % 3 === 0) this.game.audio.play('dialog');
      if (advance && this.shown > 2) this.shown = this.total;
    } else if (advance) {
      this.finishPage();
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const h = 16 + LINES * LINE_HEIGHT;
    drawPostcard(ctx, BOX_X, BOX_Y, BOX_W, h);
    if (this.def.speaker) drawStamp(ctx, this.def.speaker, BOX_X + 10, BOX_Y - 5);
    let left = Math.floor(this.shown);
    let y = BOX_Y + 8;
    for (const line of this.lines.slice(0, LINES)) {
      const n = [...line].length;
      drawText(ctx, line, BOX_X + 10, y, 'k', { limit: Math.max(0, left) });
      left -= n;
      y += LINE_HEIGHT;
    }
    if (this.shown >= this.total && !this.menu && Math.floor(this.blink / 20) % 2 === 0) {
      drawText(ctx, '▶', BOX_X + BOX_W - 14, BOX_Y + h - 13, 'r');
    }
    if (this.menu) {
      const w = Math.max(120, this.menu.width());
      const mh = this.menu.items.length * this.menu.rowHeight + 10;
      const mx = VIEW_W - w - 24;
      const my = BOX_Y + h + 6;
      drawPostcard(ctx, mx - 8, my - 4, w + 16, mh);
      this.menu.render(ctx, mx, my + 1, w, { text: 'k', dim: 'G', hi: 'r' });
    }
  }
}
