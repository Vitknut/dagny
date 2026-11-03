import { VILLAGES } from '../data/temples';
import { VIEW_W, VIEW_H } from '../engine/screen';
import { drawSprite, getSprite } from '../engine/sprites';
import { drawText, measure, wrap, LINE_HEIGHT } from '../engine/text';
import { Act } from '../engine/input';
import { ITEMS, ITEM_ORDER } from '../data/items';
import { AREAS } from '../data/areas';
import { OVERWORLD } from '../data/overworld';
import { TERRAIN } from '../data/terrain';
import { PALETTE } from '../data/palettes';
import { MAX_LEVEL, STAT_NAMES } from '../data/progression';
import { SKILLS, SPELLS, SPELL_ORDER } from '../data/spells';
import { STR } from '../data/strings';
import { TEMPLES } from '../data/temples';
import { VASEN } from '../data/vasen';
import { BOSSES, ENEMIES } from '../data/enemies';
import type { StatId } from '../data/types';
import type { Game, Overlay } from './game';
import { nextCost, raise } from './progression';
import { hasFlag, hasItem, hpMax, mpMax, spellCost } from './state';
import { exploredBounds, isExplored } from './explored';
import { ListMenu, drawPanel, drawPostcard, P } from './ui';
import * as flow from './flow';

function dim(ctx: CanvasRenderingContext2D, a = 0.55): void {
  ctx.globalAlpha = a;
  ctx.fillStyle = PALETTE.k;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.globalAlpha = 1;
}

/** Pause menu: Fortsätt, Läsningar, Föremål, Karta, Inställningar, Spara och avsluta. */
export class PauseOverlay implements Overlay {
  hideHud = false;
  private menu: ListMenu;
  private open = true;

  constructor(private readonly game: Game, private readonly onOverworld = false) {
    const g = game;
    this.menu = new ListMenu(
      [
        { label: STR.resume, onSelect: () => (this.open = false) },
        { label: STR.spells, onSelect: () => g.pushOverlay(new SpellsOverlay(g)) },
        { label: STR.items, onSelect: () => g.pushOverlay(new ItemsOverlay(g)) },
        { label: STR.map, onSelect: () => g.pushOverlay(new MapOverlay(g)) },
        { label: STR.vasen, onSelect: () => g.pushOverlay(new VasenOverlay(g)) },
        { label: STR.settings, onSelect: () => g.pushOverlay(new SettingsOverlay(g)) },
        {
          label: STR.saveQuit,
          onSelect: () => {
            g.save(true);
            flow.toTitle(g);
            this.open = false;
          },
        },
      ],
      game.audio,
    );
    void this.onOverworld;
  }

  update(): boolean {
    if (!this.open) return false;
    if (this.menu.update(this.game.input) === 'back') {
      this.game.audio.play('cancel');
      return false;
    }
    return this.open;
  }

  render(ctx: CanvasRenderingContext2D): void {
    dim(ctx);
    const w = 150;
    const h = this.menu.items.length * 13 + 30;
    const x = Math.round((VIEW_W - w) / 2);
    const y = Math.round((VIEW_H - h) / 2) + 6;
    drawPanel(ctx, x, y, w, h);
    drawText(ctx, STR.paused, VIEW_W / 2, y + 6, 'Y', { align: 'center' });
    this.menu.render(ctx, x + 12, y + 22, w - 24);
    const s = this.game.state;
    if (s) {
      const t = Math.floor(s.playTime);
      const txt = `${Math.floor(t / 3600)}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}`;
      drawText(ctx, txt, x + w - 8, y + 6, 'G', { align: 'right' });
    }
  }
}

/** Generic paged info overlay with a "back" behaviour. */
abstract class SubOverlay implements Overlay {
  hideHud = true;
  protected closed = false;
  constructor(protected readonly game: Game) {}
  protected abstract tick(): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  update(): boolean {
    const i = this.game.input;
    if (i.back() || i.pressed(Act.Pause)) {
      this.game.audio.play('cancel');
      return false;
    }
    this.tick();
    return !this.closed;
  }
  protected frame(ctx: CanvasRenderingContext2D, title: string): { x: number; y: number; w: number; h: number } {
    dim(ctx, 0.7);
    const x = 16, y = 12, w = VIEW_W - 32, h = VIEW_H - 24;
    drawPanel(ctx, x, y, w, h);
    drawText(ctx, title, x + 10, y + 6, 'Y');
    drawText(ctx, `${STR.back}: X / B`, x + w - 8, y + 6, 'G', { align: 'right' });
    return { x, y, w, h };
  }
}

export class SpellsOverlay extends SubOverlay {
  private menu: ListMenu;
  constructor(game: Game) {
    super(game);
    const s = game.state!;
    this.menu = new ListMenu(
      SPELL_ORDER.map((id) => ({
        label: () => (s.spells.includes(id) ? SPELLS[id].name : '? ? ?'),
        value: () => {
          if (!s.spells.includes(id)) return '';
          const c = spellCost(s, id);
          return `${s.selectedSpell === id ? '★ ' : ''}${c}`;
        },
        disabled: () => !s.spells.includes(id),
        onSelect: () => {
          s.selectedSpell = id;
        },
      })),
      game.audio,
    );
    const first = SPELL_ORDER.findIndex((id) => id === s.selectedSpell);
    this.menu.cursor = Math.max(0, first);
  }
  protected tick(): void {
    this.menu.update(this.game.input);
  }
  render(ctx: CanvasRenderingContext2D): void {
    const f = this.frame(ctx, STR.spells);
    const s = this.game.state!;
    this.menu.render(ctx, f.x + 10, f.y + 22, 110);
    const id = SPELL_ORDER[this.menu.cursor];
    const def = SPELLS[id];
    const tx = f.x + 140;
    if (!s.spells.length) {
      wrap(STR.noSpells, f.w - 150).forEach((l, i) => drawText(ctx, l, tx, f.y + 22 + i * LINE_HEIGHT, 'W'));
    } else if (s.spells.includes(id)) {
      drawText(ctx, def.name, tx, f.y + 22, 'Y');
      wrap(def.description, f.w - 150).forEach((l, i) => drawText(ctx, l, tx, f.y + 36 + i * LINE_HEIGHT, 'W'));
      drawText(ctx, `${STR.costMp} ${spellCost(s, id)} magi`, tx, f.y + 80, 'c');
    } else {
      wrap(`Lärs ut i ${def.village}.`, f.w - 150).forEach((l, i) => drawText(ctx, l, tx, f.y + 22 + i * LINE_HEIGHT, 'G'));
    }
    // Skills
    let y = f.y + 22 + 8 * 13;
    drawText(ctx, STR.skillsHeading, f.x + 10, y, 'Y');
    y += 12;
    for (const sk of Object.values(SKILLS)) {
      const known = s.skills.includes(sk.id);
      drawText(ctx, known ? sk.name : '? ? ?', f.x + 18, y, known ? 'W' : 'G');
      if (known) drawText(ctx, sk.description, f.x + 90, y, 'w');
      y += 11;
    }
  }
}

export class ItemsOverlay extends SubOverlay {
  private cursor = 0;
  protected tick(): void {
    const i = this.game.input;
    const owned = this.owned();
    if (!owned.length) return;
    if (i.pressed(Act.Right) || i.pressed(Act.Down)) this.cursor = (this.cursor + 1) % owned.length;
    if (i.pressed(Act.Left) || i.pressed(Act.Up)) this.cursor = (this.cursor - 1 + owned.length) % owned.length;
    for (const t of i.taps) {
      const idx = Math.floor((t.x - 34) / 34);
      if (t.y > 36 && t.y < 70 && idx >= 0 && idx < owned.length) this.cursor = idx;
    }
  }
  private owned(): string[] {
    const s = this.game.state!;
    return ITEM_ORDER.filter((id) => s.items.includes(id));
  }
  render(ctx: CanvasRenderingContext2D): void {
    const f = this.frame(ctx, STR.items);
    const owned = this.owned();
    const s = this.game.state!;
    if (!owned.length) {
      drawText(ctx, STR.noItems, f.x + 12, f.y + 30, 'G');
    }
    owned.forEach((id, k) => {
      const x = f.x + 18 + k * 34;
      const y = f.y + 26;
      ctx.fillStyle = k === this.cursor ? P.y : P.k;
      ctx.fillRect(x - 2, y - 2, 30, 26);
      ctx.fillStyle = P.K;
      ctx.fillRect(x, y, 26, 22);
      const it = ITEMS[id];
      drawSprite(ctx, it.sprite, 0, x + 13 - 8, y + 3);
    });
    const sel = owned[this.cursor];
    if (sel) {
      const it = ITEMS[sel];
      drawText(ctx, it.name, f.x + 14, f.y + 62, 'Y');
      wrap(it.description, f.w - 28).forEach((l, i) => drawText(ctx, l, f.x + 14, f.y + 76 + i * LINE_HEIGHT, 'W'));
    }
    // Stats summary.
    const y = f.y + f.h - 36;
    drawText(ctx, `${STAT_NAMES.styrka} ${s.levels.styrka}   ${STAT_NAMES.magi} ${s.levels.magi}   ${STAT_NAMES.liv} ${s.levels.liv}`, f.x + 14, y, 'c');
    drawText(ctx, `Liv ${s.hp}/${hpMax(s)}   Magi ${s.mp}/${mpMax(s)}   XP ${s.xp}`, f.x + 14, y + 12, 'w');
  }
}

/**
 * Väsensboken: every creature Dagny has beaten or reconciled, with what folk
 * belief said about it and how it fits her story. Up/down picks, left/right
 * (or a tap on the text) turns between the two pages.
 */
export class VasenOverlay extends SubOverlay {
  private cursor = 0;
  private page = 0;
  private scroll = 0;
  /** Pages Dagny has opened first, so a new one is never hidden below the fold. */
  private readonly ids = [...Object.keys(VASEN)].sort((a, b) => Number(this.known(b)) - Number(this.known(a)));
  private known(id: string): boolean {
    return hasFlag(this.game.state!, `vasen_${id}`);
  }
  protected tick(): void {
    const i = this.game.input;
    const n = this.ids.length;
    const move = (d: number): void => {
      this.cursor = (this.cursor + d + n) % n;
      this.page = 0;
      this.game.audio.play('menu');
    };
    if (i.pressed(Act.Down)) move(1);
    if (i.pressed(Act.Up)) move(-1);
    if (i.pressed(Act.Left) || i.pressed(Act.Right) || i.pressed(Act.Jump)) {
      this.page = 1 - this.page;
      this.game.audio.play('menu');
    }
    for (const t of i.taps) {
      if (t.x < 16 + 104) {
        const row = Math.floor((t.y - 34) / ROW);
        if (row >= 0 && row < VISIBLE && this.scroll + row < n) {
          this.cursor = this.scroll + row;
          this.page = 0;
        }
      } else this.page = 1 - this.page;
    }
    if (this.cursor < this.scroll) this.scroll = this.cursor;
    if (this.cursor >= this.scroll + VISIBLE) this.scroll = this.cursor - VISIBLE + 1;
  }
  render(ctx: CanvasRenderingContext2D): void {
    const f = this.frame(ctx, STR.vasen);
    const found = this.ids.filter((id) => this.known(id)).length;
    drawText(ctx, `${found}/${this.ids.length}`, f.x + 74, f.y + 6, 'G');
    for (let r = 0; r < VISIBLE; r++) {
      const k = this.scroll + r;
      const id = this.ids[k];
      if (!id) break;
      const y = f.y + 22 + r * ROW;
      if (k === this.cursor) {
        ctx.fillStyle = P.K;
        ctx.fillRect(f.x + 6, y - 1, 96, ROW);
      }
      drawText(ctx, this.known(id) ? vasenName(id) : '? ? ?', f.x + 10, y, this.known(id) ? (k === this.cursor ? 'Y' : 'W') : 'G');
    }
    const tx = f.x + 110;
    const tw = f.w - 118;
    const id = this.ids[this.cursor];
    if (!found) {
      wrap(STR.vasenEmpty, tw).forEach((l, i) => drawText(ctx, l, tx, f.y + 22 + i * LINE_HEIGHT, 'G'));
      return;
    }
    if (!this.known(id)) {
      drawText(ctx, '? ? ?', tx, f.y + 22, 'G');
      return;
    }
    const e = VASEN[id];
    drawText(ctx, vasenName(id), tx, f.y + 22, 'Y');
    drawText(ctx, `${this.page ? STR.vasenBerattelse : STR.vasenFolktro}  (${this.page + 1}/2)`, tx, f.y + 34, 'c');
    wrap(this.page ? e.berattelse : e.folktro, tw).forEach((l, i) => drawText(ctx, l, tx, f.y + 48 + i * LINE_HEIGHT, 'W'));
  }
}

/** A creature's name, guardians included. */
function vasenName(id: string): string {
  return (ENEMIES[id] ?? BOSSES[id])?.name ?? id;
}

/** Rows in Väsensboken's list. */
const ROW = 11;
const VISIBLE = 12;

/** Overworld map with the places and the temples' state. */
export class MapOverlay extends SubOverlay {
  private t = 0;
  protected tick(): void {
    this.t++;
  }
  render(ctx: CanvasRenderingContext2D): void {
    const f = this.frame(ctx, STR.map);
    const s = this.game.state!;
    const tiles = OVERWORLD.tiles;
    // Only what Dagny has seen; the map zooms in on it (bigger tiles early on).
    const seen = exploredBounds(s) ?? { x0: s.ow.x, y0: s.ow.y, x1: s.ow.x, y1: s.ow.y };
    // Places Dagny has heard of (rykte_<area>) are on the map before she has seen them.
    const rumours = OVERWORLD.places.filter((p) => p.area && hasFlag(s, `rykte_${p.area}`) && !isExplored(s, p.x, p.y));
    const box = { ...seen };
    for (const p of rumours) {
      box.x0 = Math.min(box.x0, p.x); box.y0 = Math.min(box.y0, p.y);
      box.x1 = Math.max(box.x1, p.x); box.y1 = Math.max(box.y1, p.y);
    }
    const pad = 1;
    const x0 = Math.max(0, box.x0 - pad);
    const y0 = Math.max(0, box.y0 - pad);
    const bw = Math.min(tiles[0].length - 1, box.x1 + pad) - x0 + 1;
    const bh = Math.min(tiles.length - 1, box.y1 + pad) - y0 + 1;
    const areaW = 168;
    const areaH = f.h - 32;
    // Whole pixels per tile while they fit; a large seen area gets uneven tiles rather than overflowing.
    const fit = Math.min(areaW / bw, areaH / bh);
    const cell = fit >= 2 ? Math.min(7, Math.floor(fit)) : fit;
    const ox = f.x + 10 + Math.floor((areaW - bw * cell) / 2);
    const oy = f.y + 22 + Math.floor((areaH - bh * cell) / 2);
    const at = (n: number): number => Math.floor(n * cell);
    ctx.fillStyle = P.k;
    ctx.fillRect(ox - 2, oy - 2, at(bw) + 4, at(bh) + 4);
    const radio = hasItem(s, 'radio');
    for (let y = y0; y < y0 + bh; y++) {
      for (let x = x0; x < x0 + bw; x++) {
        const px = ox + at(x - x0);
        const py = oy + at(y - y0);
        const cw = at(x - x0 + 1) - at(x - x0);
        const chh = at(y - y0 + 1) - at(y - y0);
        if (!isExplored(s, x, y)) {
          // Unseen: fog.
          ctx.fillStyle = (x + y) % 2 ? P.K : P.k;
          ctx.fillRect(px, py, cw, chh);
          continue;
        }
        const ch = tiles[y][x];
        // The hidden path and the cliff door look like their surroundings until the radio finds them.
        const shown = (ch === 'H' || ch === 'E') && radio ? 'W' : TERRAIN[ch]?.map ?? 'M';
        ctx.fillStyle = P[shown] ?? P.M;
        ctx.fillRect(px, py, cw, chh);
      }
    }
    // Places Dagny has seen: temples yellow, villages red, small places pale (hidden places stay hidden).
    const m = Math.max(3, cell);
    for (const pl of OVERWORLD.places) {
      if (pl.hidden || pl.radio || !isExplored(s, pl.x, pl.y) || pl.x < x0 || pl.y < y0 || pl.x >= x0 + bw || pl.y >= y0 + bh) continue;
      const temple = TEMPLES.find((tt) => tt.entryArea === pl.area);
      const village = AREAS[pl.area ?? '']?.kind === 'village';
      const col = temple ? (hasFlag(s, `${temple.id}_klar`) ? P.W : P.Y) : village ? P.R : P.C;
      const px = ox + at(pl.x - x0 + 0.5) - Math.floor(m / 2);
      const py = oy + at(pl.y - y0 + 0.5) - Math.floor(m / 2);
      ctx.fillStyle = P.k;
      ctx.fillRect(px - 1, py - 1, m + 2, m + 2);
      ctx.fillStyle = col;
      ctx.fillRect(px, py, m, m);
      if (temple && cell >= 4) drawText(ctx, `${temple.number}`, px + m + 1, py - 2, 'Y', { outline: 'k' });
    }
    // Heard of, not yet seen: a question mark.
    for (const pl of rumours) {
      const px = ox + at(pl.x - x0 + 0.5);
      const py = oy + at(pl.y - y0 + 0.5);
      drawText(ctx, '?', px - 2, py - 5, 'Y', { outline: 'k' });
    }
    // Dagny, blinking.
    if (Math.floor(this.t / 15) % 2 === 0) {
      const px = ox + at(s.ow.x - x0 + 0.5) - Math.floor(m / 2);
      const py = oy + at(s.ow.y - y0 + 0.5) - Math.floor(m / 2);
      ctx.fillStyle = P.W;
      ctx.fillRect(px - 1, py - 1, m + 2, m + 2);
      ctx.fillStyle = P.r;
      ctx.fillRect(px, py, m, m);
    }
    // The temples: names only once their place has been seen.
    let y = f.y + 22;
    const lx = f.x + 10 + areaW + 8;
    drawText(ctx, STR.templesHeading, lx, y, 'Y');
    y += 13;
    for (const tt of TEMPLES) {
      const place = OVERWORLD.places.find((p) => p.area === tt.entryArea);
      const known = !!place && isExplored(s, place.x, place.y);
      const done = hasFlag(s, `${tt.id}_klar`);
      const label = known ? `${tt.number}. ${tt.short}` : `${tt.number}. ???`;
      drawText(ctx, label, lx, y, done ? 'Y' : known ? 'W' : 'G');
      if (done) drawText(ctx, '★', lx + measure(label) + 3, y, 'Y');
      y += 10;
    }
    // A small key.
    y += 3;
    if (rumours.length) {
      drawText(ctx, '?', lx, y - 1, 'Y', { outline: 'k' });
      drawText(ctx, STR.mapKeyRumour, lx + 7, y, 'G');
      y += 9;
    }
    for (const [col, txt] of [[P.Y, STR.mapKeyTemple], [P.R, STR.mapKeyVillage], [P.C, STR.mapKeyPlace]] as const) {
      ctx.fillStyle = P.k;
      ctx.fillRect(lx - 1, y + 1, 5, 5);
      ctx.fillStyle = col;
      ctx.fillRect(lx, y + 2, 3, 3);
      drawText(ctx, txt, lx + 7, y, 'G');
      y += 9;
    }
  }
}

export class SettingsOverlay extends SubOverlay {
  private menu: ListMenu;
  constructor(game: Game) {
    super(game);
    const st = game.settings;
    const apply = (): void => game.applySettings();
    const onOff = (b: boolean): string => (b ? STR.on : STR.off);
    const step = (v: number, d: number, lo: number, hi: number, by: number): number =>
      Math.round(Math.max(lo, Math.min(hi, v + d * by)) * 100) / 100;
    this.menu = new ListMenu(
      [
        { label: STR.music, value: () => `${st.music}`, onAdjust: (d) => { st.music = step(st.music, d, 0, 10, 1); apply(); } },
        { label: STR.sfx, value: () => `${st.sfx}`, onAdjust: (d) => { st.sfx = step(st.sfx, d, 0, 10, 1); apply(); game.audio.play('sword'); } },
        { label: STR.calmMode, value: () => onOff(st.calm), onAdjust: () => { st.calm = !st.calm; apply(); } },
        { label: STR.stickMode, value: () => (st.stickMode === 'stick' ? STR.stick : STR.dpad), onAdjust: () => { st.stickMode = st.stickMode === 'stick' ? 'dpad' : 'stick'; apply(); } },
        { label: STR.controlSize, value: () => `${Math.round(st.controlScale * 100)}%`, onAdjust: (d) => { st.controlScale = step(st.controlScale, d, 0.75, 1.6, 0.15); apply(); } },
        { label: STR.controlOpacity, value: () => `${Math.round((1 - st.controlOpacity) * 100)}%`, onAdjust: (d) => { st.controlOpacity = step(st.controlOpacity, -d, 0.15, 0.9, 0.15); apply(); } },
        { label: STR.controlPlacement, value: () => STR.placementNames[st.placement], onAdjust: (d) => { st.placement = (st.placement + d + 3) % 3; apply(); } },
        { label: STR.lowButton, value: () => onOff(st.lowButton), onAdjust: () => { st.lowButton = !st.lowButton; apply(); } },
        { label: STR.vibration, value: () => onOff(st.vibration), onAdjust: () => { st.vibration = !st.vibration; apply(); if (st.vibration) game.vibrate(30); } },
        { label: STR.showFps, value: () => onOff(st.showFps), onAdjust: () => { st.showFps = !st.showFps; apply(); } },
        { label: STR.back, onSelect: () => (this.closed = true) },
      ],
      game.audio,
    );
    this.menu.rowHeight = 11;
  }
  protected tick(): void {
    this.menu.update(this.game.input);
  }
  render(ctx: CanvasRenderingContext2D): void {
    const f = this.frame(ctx, STR.settings);
    this.menu.render(ctx, f.x + 14, f.y + 19, 200);
    const cur = this.menu.cursor;
    if (cur === 2) drawText(ctx, STR.calmHelp, f.x + 14, f.y + f.h - 12, 'G');
    else if (cur === 7) drawText(ctx, STR.lowButtonHelp, f.x + 14, f.y + f.h - 12, 'G');
    else drawText(ctx, '< > ändrar', f.x + 14, f.y + f.h - 12, 'G');
  }
}

/** "Nivå upp!" – the player chooses Styrka, Magi or Liv. */
export class LevelUpOverlay implements Overlay {
  hideHud = true;
  private menu: ListMenu;
  private open = true;

  constructor(private readonly game: Game, onChange?: () => void) {
    const s = game.state!;
    const stats: StatId[] = ['styrka', 'magi', 'liv'];
    this.menu = new ListMenu(
      [
        ...stats.map((st) => ({
          label: () => `${STAT_NAMES[st]} ${s.levels[st]}${s.levels[st] < MAX_LEVEL ? ` ▶ ${s.levels[st] + 1}` : ''}`,
          value: () => {
            const c = nextCost(st, s.levels[st]);
            return c === null ? STR.levelMax : `${c} ${STR.needXp}`;
          },
          disabled: () => {
            const c = nextCost(st, s.levels[st]);
            return c === null || s.xp < c;
          },
          onSelect: () => {
            s.xp = raise(s.xp, s.levels, st);
            // Raising Liv / Magi fills the new capacity.
            if (st === 'liv') s.hp = hpMax(s);
            if (st === 'magi') s.mp = mpMax(s);
            game.audio.jingle('lara');
            game.vibrate([20, 40, 20]);
            onChange?.();
            game.save();
            this.open = false;
          },
        })),
        { label: STR.levelUpLater, onSelect: () => (this.open = false) },
      ],
      game.audio,
    );
  }

  update(): boolean {
    if (!this.open) return false;
    if (this.menu.update(this.game.input) === 'back') return false;
    return this.open;
  }

  render(ctx: CanvasRenderingContext2D): void {
    dim(ctx, 0.5);
    const w = 220;
    const h = 100;
    const x = Math.round((VIEW_W - w) / 2);
    const y = 36;
    drawPostcard(ctx, x, y, w, h);
    drawText(ctx, STR.levelUpTitle, VIEW_W / 2, y + 7, 'r', { align: 'center' });
    drawText(ctx, STR.levelUpHelp, x + 12, y + 20, 'g');
    this.menu.render(ctx, x + 12, y + 35, w - 34, { text: 'k', dim: 'G', hi: 'r' });
    const s = this.game.state!;
    drawText(ctx, `XP ${s.xp}`, x + w - 12, y + 7, 'u', { align: 'right' });
  }
}

/** Shown when Dagny falls asleep (is defeated). */
export class GameOverOverlay implements Overlay {
  hideHud = true;
  private menu: ListMenu;
  private t = 0;
  /** True when this defeat used up the last life. */
  private readonly over: boolean;
  private readonly temple: string | null;

  /**
   * `room` is where a retry starts: the room Dagny fell in and the door she
   * came in by (null = the room's default entry).
   */
  constructor(private readonly game: Game, temple: string | null, room?: { area: string; entry: string | null }) {
    const s = game.state!;
    this.temple = temple;
    s.lives = Math.max(0, s.lives - 1);
    this.over = s.lives === 0;
    const items = [];
    if (this.over) {
      const label = temple === flow.LAST_TEMPLE ? STR.restartMountain : STR.restartHome;
      items.push({ label, onSelect: () => flow.gameOver(game, temple) });
    } else {
      // Try again from the door of the room she fell in – in temples and outside them alike.
      if (room) items.push({ label: STR.retryRoom, onSelect: () => flow.retryRoom(game, room.area, room.entry) });
      // Wake where Dagny last rested (the button names the village).
      const village = VILLAGES.find((v) => v.area === s.lastVillage) ?? VILLAGES[0];
      const label = village.id === 'mormors_by' ? STR.wakeHome : `${STR.wakeIn} ${village.name}`;
      items.push({ label, onSelect: () => flow.wakeAtVillage(game) });
    }
    this.menu = new ListMenu(items, game.audio);
    // The real end: the music stops, and out of the dark Bergakungen laughs.
    if (this.over) game.audio.playMusic(null);
  }

  update(): boolean {
    this.t++;
    if (this.over && this.t === LAUGH_AT) this.game.audio.play('laugh');
    if (this.t < (this.over ? LAUGH_AT + LAUGH_LEN : 40)) return true;
    const before = this.game.transitioning;
    this.menu.update(this.game.input);
    // Close once a choice started the transition.
    return !(this.game.transitioning && !before);
  }

  render(ctx: CanvasRenderingContext2D): void {
    dim(ctx, Math.min(this.over ? 1 : 0.85, this.t / 40));
    if (this.t < 30) return;
    const s = this.game.state!;
    if (this.over) {
      this.renderShadow(ctx);
      if (this.t < LAUGH_AT + LAUGH_LEN) return;
      let y = 112;
      drawText(ctx, STR.gameOverEnd, VIEW_W / 2, y, 'R', { align: 'center' });
      if (this.temple === flow.LAST_TEMPLE) drawText(ctx, STR.gameOverMountain, VIEW_W / 2, (y += 10), 'W', { align: 'center' });
      drawText(ctx, STR.gameOverEndText, VIEW_W / 2, y + 10, 'G', { align: 'center' });
      const w = this.menu.width() + 10;
      this.menu.render(ctx, Math.round((VIEW_W - w) / 2), y + 26, w);
      return;
    } else {
      drawText(ctx, STR.gameOverTitle, VIEW_W / 2, 44, 'W', { align: 'center' });
      // The lives still left, as little doll heads.
      const label = s.lives === 1 ? STR.lastLife : STR.livesLeft;
      const lw = measure(label);
      const total = lw + (s.lives === 1 ? 0 : 4 + s.lives * 9);
      const x0 = Math.round((VIEW_W - total) / 2);
      drawText(ctx, label, x0, 62, s.lives === 1 ? 'Y' : 'G');
      if (s.lives > 1) for (let i = 0; i < s.lives; i++) drawSprite(ctx, 'hudLife', 0, x0 + lw + 4 + i * 9, 62);
    }
    const w = this.menu.width() + 10;
    this.menu.render(ctx, Math.round((VIEW_W - w) / 2), 96, w);
  }

  /**
   * Bergakungen's shadow, twice his size, rising out of the dark with his
   * arms raised. He shakes with every "ha", and the words drift up round him.
   */
  private renderShadow(ctx: CanvasRenderingContext2D): void {
    const rise = Math.min(1, (this.t - 30) / 24);
    const lt = this.t - LAUGH_AT;
    const laughing = lt >= 0 && lt < LAUGH_LEN - 20;
    const shake = laughing && lt % LAUGH_STEP < LAUGH_STEP / 2 ? 2 : 0;
    const f = getSprite('bergakungSkugga', 1);
    const x = Math.round(VIEW_W / 2 - f.w);
    const y = Math.round(6 + (1 - rise) * 20) - shake;
    ctx.globalAlpha = rise;
    ctx.drawImage(f.image, f.sx, f.sy, f.w, f.h, x, y, f.w * 2, f.h * 2);
    ctx.globalAlpha = 1;
    // His lower half sinks back into the dark.
    const fade = ctx.createLinearGradient(0, 64, 0, 104);
    fade.addColorStop(0, 'rgba(43,34,51,0)');
    fade.addColorStop(1, PALETTE.k);
    ctx.fillStyle = fade;
    ctx.fillRect(0, 64, VIEW_W, 40);
    ctx.fillStyle = PALETTE.k;
    ctx.fillRect(0, 104, VIEW_W, VIEW_H - 104);
    // "HA" for every laugh so far, alternating sides, drifting upwards and fading.
    if (lt < 0) return;
    for (let i = 0; i < LAUGH_HAS; i++) {
      const age = lt - i * LAUGH_STEP;
      if (age < 0 || age > 50) continue;
      ctx.globalAlpha = 1 - age / 50;
      const side = i % 2 ? 1 : -1;
      drawText(ctx, 'HA', VIEW_W / 2 + side * (60 + (i % 3) * 14), 34 - age / 3 + (i % 3) * 12, 'R', { align: 'center' });
    }
    ctx.globalAlpha = 1;
  }
}

/** The laugh on the Game Over screen: when it starts, how many "ha"s, frames between them, and how long it all lasts. */
const LAUGH_AT = 60;
const LAUGH_HAS = 7;
const LAUGH_STEP = 12;
const LAUGH_LEN = LAUGH_HAS * LAUGH_STEP + 40;
