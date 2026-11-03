import { VIEW_W, VIEW_H } from '../engine/screen';
import { drawSprite } from '../engine/sprites';
import { drawText } from '../engine/text';
import { Act } from '../engine/input';
import { PALETTE } from '../data/palettes';
import { STR } from '../data/strings';
import { drawBackdrop } from './backdrop';
import type { Game, Overlay, Scene } from './game';
import { hasSave } from './save';
import { ListMenu, drawPostcard } from './ui';
import { SettingsOverlay } from './menus';
import * as flow from './flow';

class ConfirmOverlay implements Overlay {
  hideHud = true;
  private menu: ListMenu;
  private open = true;
  constructor(private readonly game: Game, private readonly text: string, onYes: () => void) {
    this.menu = new ListMenu(
      [
        { label: STR.no, onSelect: () => (this.open = false) },
        { label: STR.yes, onSelect: () => { this.open = false; onYes(); } },
      ],
      game.audio,
    );
  }
  update(): boolean {
    if (this.menu.update(this.game.input) === 'back') return false;
    return this.open;
  }
  render(ctx: CanvasRenderingContext2D): void {
    drawPostcard(ctx, 40, 60, VIEW_W - 80, 64);
    drawText(ctx, this.text, VIEW_W / 2, 70, 'k', { align: 'center' });
    this.menu.render(ctx, VIEW_W / 2 - 30, 88, 60, { text: 'k', dim: 'G', hi: 'r' });
  }
}

/** Title screen: "Nytt spel / Fortsätt". The first tap also unlocks audio (iOS). */
export class TitleScene implements Scene {
  private t = 0;
  private started = false;
  private menu: ListMenu;

  constructor(private readonly game: Game) {
    const g = game;
    this.menu = new ListMenu(
      [
        { label: STR.continue, onSelect: () => flow.continueGame(g), disabled: () => !hasSave(g.store) },
        {
          label: STR.newGame,
          onSelect: () => {
            if (hasSave(g.store)) g.pushOverlay(new ConfirmOverlay(g, STR.confirmNew, () => flow.startNewGame(g)));
            else flow.startNewGame(g);
          },
        },
        { label: STR.settings, onSelect: () => g.pushOverlay(new SettingsOverlay(g)) },
      ],
      game.audio,
    );
    if (!hasSave(g.store)) this.menu.cursor = 1;
  }

  music(): string | null {
    return 'titel';
  }

  update(): void {
    this.t++;
    const i = this.game.input;
    if (!this.started) {
      if (i.confirm() || i.taps.length || i.pressed(Act.Sword) || i.pressed(Act.Magic) || i.pressed(Act.Pause)) {
        this.started = true;
        this.game.audio.unlock();
        this.game.audio.playMusic('titel');
        this.game.audio.play('select');
        i.consume();
      }
      return;
    }
    if (this.game.transitioning) return;
    this.menu.update(i);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const camX = this.t * 0.4;
    drawBackdrop(ctx, 'outdoor', 'midnattssol', camX, 0);
    // Ground strip with Dagny looking out over the land.
    ctx.fillStyle = PALETTE.m;
    ctx.fillRect(0, VIEW_H - 22, VIEW_W, 22);
    ctx.fillStyle = PALETTE.M;
    ctx.fillRect(0, VIEW_H - 22, VIEW_W, 2);
    const breathe = Math.floor(this.t / 40) % 2;
    drawSprite(ctx, 'dagny', breathe, 52, VIEW_H - 46);
    drawSprite(ctx, 'shield', 0, 63, VIEW_H - 37);
    drawSprite(ctx, 'radio', Math.floor(this.t / 20) % 2, 74, VIEW_H - 32);
    if (Math.floor(this.t / 25) % 2 === 0) drawSprite(ctx, 'note', 0, 84 + Math.sin(this.t / 15) * 3, VIEW_H - 48 - (this.t % 50) / 4);
    this.game.applyTone(ctx, 'midnattssol', true);

    // Studio and title.
    drawText(ctx, STR.presents, VIEW_W / 2, 8, 'C', { align: 'center', outline: 'k' });
    const ty = 26;
    drawText(ctx, STR.title, VIEW_W / 2, ty, 'W', { align: 'center', outline: 'k' });
    ctx.fillStyle = PALETTE.y;
    ctx.fillRect(VIEW_W / 2 - 54, ty + 13, 108, 1);
    drawText(ctx, STR.subtitle, VIEW_W / 2, ty + 17, 'Y', { align: 'center', outline: 'k' });
    drawText(ctx, STR.tagline, VIEW_W / 2, ty + 29, 'C', { align: 'center', outline: 'k' });

    if (!this.started) {
      if (Math.floor(this.t / 30) % 2 === 0) {
        const touch = this.game.input.lastSource === 'touch' || this.game.touch.visible;
        drawText(ctx, touch ? STR.tapToStart : STR.pressToStart, VIEW_W / 2, 112, 'W', { align: 'center', outline: 'k' });
      }
    } else {
      const w = 110;
      const x = VIEW_W / 2 + 30;
      const y = 82;
      drawPostcard(ctx, x - 10, y - 8, w + 20, this.menu.items.length * 13 + 14);
      this.menu.render(ctx, x, y, w, { text: 'k', dim: 'w', hi: 'r' });
    }
    drawText(ctx, STR.version, VIEW_W - 4, VIEW_H - 12, 'W', { align: 'right', shadow: 'k' });
    if (this.game.store.available) drawText(ctx, STR.studio, 4, VIEW_H - 12, 'W', { shadow: 'k' });
    if (!this.game.store.available) drawText(ctx, STR.noStorage, VIEW_W / 2, VIEW_H - 12, 'Y', { align: 'center', outline: 'k' });
  }
}
