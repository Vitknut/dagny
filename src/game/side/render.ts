import { TILE } from '../../engine/collision';
import { VIEW_W, VIEW_H } from '../../engine/screen';
import { drawSprite, spriteSize } from '../../engine/sprites';
import { ring } from '../../engine/draw';
import { drawText, measure } from '../../engine/text';
import { PALETTE } from '../../data/palettes';
import { FURNITURE } from '../../data/furniture';
import { SPELLS } from '../../data/spells';
import type { SpellId } from '../../data/types';
import { Particles } from '../../entities/misc';
import { drawBackdrop } from '../backdrop';
import { drawHud } from '../hud';
import { hasItem } from '../state';
import { squareActive, stepsToSwap } from '../beat';
import { lightDisc } from './shared';
import type { SideScene } from '../sidescene';

/** Drawing a side-view scene: backdrop, tiles, creatures, Dagny, light and darkness, and the overlays on top. */


/** Furniture that gives light: where the light sits in the sprite (px) and its radius. */
const GLOWS: Readonly<Record<string, [number, number, number]>> = {
  kryptaLamm: [16, 24, 30],
  gruvOffer: [5, 3, 26],
  fyrLogg: [11, 3, 22],
  fyrLins: [16, 16, 46],
  skogOffersten: [24, 4, 24],
  skogHaltrad: [16, 24, 14],
  trollKittel: [16, 28, 36],
  trollSkatt: [15, 10, 22],
  trollAnsikte: [16, 14, 20],
};
export function renderScene(sc: SideScene, ctx: CanvasRenderingContext2D): void {
  let camX = sc.camX;
  let camY = sc.camY;
  if (sc.shakeT > 0) {
    camX += (Math.random() - 0.5) * sc.shakeS * 2;
    camY += (Math.random() - 0.5) * sc.shakeS * 2;
  }
  camX = Math.round(camX);
  camY = Math.round(camY);
  const f = sc.frame;
  drawBackdrop(ctx, sc.area.backdrop, sc.area.tone, camX, camY);

  // Static tiles and decor.
  ctx.drawImage(sc.staticLayer, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
  renderGrass(sc, ctx, camX, camY);

  // Animated tiles.
  for (const a of sc.anim) {
    if (a.x + TILE < camX || a.x > camX + VIEW_W || a.y + TILE < camY || a.y > camY + VIEW_H) continue;
    drawSprite(ctx, a.sprite, Math.floor((f + a.offset * 7) / 20), a.x - camX, a.y - camY);
  }
  // Dance-floor squares.
  if (sc.beatCells.length && sc.area.beat) {
    const period = sc.area.beat.period;
    const warn = stepsToSwap(sc.frame, period) < 24;
    for (const c of sc.beatCells) {
      const x = c.tx * TILE - camX;
      const y = c.ty * TILE - camY;
      if (x < -TILE || x > VIEW_W || y < -TILE || y > VIEW_H) continue;
      const on = sc.beatAwake() && squareActive(c.group, sc.frame, period);
      const id = !on ? 'beatOff' : warn && Math.floor(f / 4) % 2 === 0 ? 'beatWarn' : 'beatOn';
      drawSprite(ctx, id, (c.tx + c.ty) % 2, x, y);
    }
  }
  // The cave-in's rubble behind its front.
  if (sc.caveX !== null) {
    const front = sc.caveX - camX;
    ctx.fillStyle = PALETTE.k;
    ctx.fillRect(0, 0, Math.max(0, front - 6), VIEW_H);
    for (let y = 0; y < VIEW_H; y += 6) {
      const jag = ((y * 37 + Math.floor(sc.frame / 3) * 11) % 13) - 6;
      ctx.fillStyle = (y / 6) % 2 ? PALETTE.K : PALETTE.g;
      ctx.fillRect(Math.max(0, front - 10 + jag), y, 10, 6);
    }
  }
  // Checkpoint candles.
  // Lamp light catches something: a slow twinkle.
  for (const gl of sc.lampGlints) {
    const tw = (f + gl.x) % 90;
    if (tw > 30) continue;
    const r = tw < 15 ? tw / 5 : (30 - tw) / 5;
    ctx.fillStyle = PALETTE.W;
    ctx.fillRect(Math.round(gl.x - camX - r), Math.round(gl.y - camY), Math.round(r * 2) + 1, 1);
    ctx.fillRect(Math.round(gl.x - camX), Math.round(gl.y - camY - r), 1, Math.round(r * 2) + 1);
  }
  for (const cp of sc.checkpoints) {
    drawSprite(ctx, cp.lit ? 'candle' : 'candleOff', Math.floor((f + cp.tx * 5) / 18), cp.tx * TILE - camX, cp.ty * TILE - camY);
  }

  renderProps(sc, ctx, camX, camY, false);
  for (const pl of sc.platforms) pl.render(ctx, camX, camY);
  for (const pl of sc.platforms) pl.renderHub(ctx, camX, camY);
  for (const pk of sc.pickups) pk.render(ctx, camX, camY);
  for (const n of sc.npcs) n.render(ctx, camX, camY);
  for (const e of sc.enemies) e.render(ctx, camX, camY);
  renderPlayerAura(sc, ctx, camX, camY);
  for (const h of sc.helpers) {
    if (h.life > 90 || Math.floor(h.life / 4) % 2 === 0) drawSprite(ctx, 'vatte', Math.floor(f / 10) % 2, h.x - 3 - camX, h.y - 4 - camY, h.facing === -1);
  }
  sc.player.render(ctx, camX, camY, f);
  for (const pr of sc.projectiles) pr.render(ctx, camX, camY);
  renderParticles(ctx, sc.particles, camX, camY);
  renderProps(sc, ctx, camX, camY, true);
  if (sc.frontLayer) {
    ctx.globalAlpha = 0.9;
    ctx.drawImage(sc.frontLayer, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = 1;
  }

  if (sc.dark) renderDarkness(sc, ctx, camX, camY);
  renderParticles(ctx, sc.ambient, camX, camY);

  const outdoor = sc.area.backdrop === 'outdoor' || sc.area.backdrop === 'forest';
  sc.game.applyTone(ctx, sc.area.tone, outdoor);

  if (sc.flashT > 0) {
    ctx.globalAlpha = Math.min(0.7, sc.flashT / 30);
    ctx.fillStyle = PALETTE.W;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = 1;
  }

  if (sc.prompt && !sc.game.modal) {
    const bob = Math.round(Math.sin(f / 8) * 1.5);
    drawText(ctx, '▲', sc.prompt.x - camX - 2, sc.prompt.y - camY - 8 + bob, 'Y', { outline: 'k' });
  }

  if (!sc.game.hudHidden && sc.game.state) {
    drawHud(ctx, sc.game.state, { keys: sc.area.temple ? sc.s.keys[sc.area.temple] ?? 0 : undefined, frame: f });
    renderSpellIcons(sc, ctx);
  }
  renderBossBar(sc, ctx);
  if (sc.nameT > 0) renderName(sc, ctx);
}

export function renderGrass(sc: SideScene, ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  if (sc.area.theme !== 'meadow') return;
  const { w } = sc.grid;
  const x0 = Math.max(0, Math.floor(camX / TILE));
  const x1 = Math.min(w - 1, Math.floor((camX + VIEW_W) / TILE));
  ctx.fillStyle = PALETTE.l;
  for (let ty = 0; ty < sc.grid.h; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (sc.tileSprite[ty * w + tx] !== 'grass') continue;
      const by = ty * TILE - camY;
      for (let k = 0; k < 3; k++) {
        const gx = tx * TILE + 3 + k * 5 - camX;
        const sway = Math.round(Math.sin(sc.frame / 25 + tx + k) * 1);
        ctx.fillRect(gx + sway, by - 2, 1, 2);
        ctx.fillRect(gx, by - 1, 1, 1);
      }
    }
  }
}

export function renderProps(sc: SideScene, ctx: CanvasRenderingContext2D, camX: number, camY: number, front: boolean): void {
  for (const pr of [...(sc.area.props ?? []), ...(FURNITURE[sc.area.id] ?? [])]) {
    if (!pr.sprite || !!pr.front !== front) continue;
    const sz = spriteSize(pr.sprite);
    const x = pr.tx * TILE + (pr.dx ?? 0);
    const y = (pr.ty + 1) * TILE - sz.h + (pr.dy ?? 0);
    if (x + sz.w < camX || x > camX + VIEW_W) continue;
    const frame = pr.anim ? Math.floor(sc.frame / (pr.anim * 60)) : 0;
    drawSprite(ctx, pr.sprite, frame, x - camX, y - camY);
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D, ps: Particles, camX: number, camY: number): void {
  for (const p of ps.list) {
    const x = Math.round(p.x - camX);
    const y = Math.round(p.y - camY);
    if (p.sprite) {
      const fr = Math.min(p.frames - 1, Math.floor((1 - p.life / p.max) * p.frames));
      drawSprite(ctx, p.sprite, fr, x, y);
    } else if (p.text) {
      drawText(ctx, p.text, x, y, 'Y', { outline: 'k' });
    } else {
      const a = Math.min(1, p.life / 20);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      // Fireflies blink.
      if (p.color === PALETTE.Y && p.size === 1 && Math.floor((p.life + p.x) / 20) % 3 === 0) {
        ctx.globalAlpha = 1;
        continue;
      }
      if (p.frames < 0) ctx.fillRect(x, y, -p.frames, 1);
      else if (p.frames > 1) ctx.fillRect(x, y, 1, p.frames);
      else ctx.fillRect(x, y, p.size, p.size > 4 ? Math.max(2, p.size / 4): p.size);
      ctx.globalAlpha = 1;
    }
  }
}

export function renderPlayerAura(sc: SideScene, ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const p = sc.player;
  if (sc.spell.skydd > 0) {
    const t = sc.frame;
    ctx.fillStyle = PALETTE.c;
    ctx.globalAlpha = 0.5 + Math.sin(t / 6) * 0.2;
    ring(ctx, p.x + p.w / 2 - camX, p.y + p.h / 2 - camY, 15);
    ctx.globalAlpha = 1;
  }
  if (sc.spell.eld > 0 && sc.frame % 6 === 0) {
    sc.particles.spawn({ x: p.x + (p.facing === 1 ? p.w + 6 : -6), y: p.y + 8, vy: -0.4, life: 14, color: PALETTE.o });
  }
}

export function renderDarkness(sc: SideScene, ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  const d = sc.dark as HTMLCanvasElement;
  const dc = d.getContext('2d') as CanvasRenderingContext2D;
  dc.globalCompositeOperation = 'source-over';
  dc.clearRect(0, 0, VIEW_W, VIEW_H);
  dc.fillStyle = `rgba(22,16,30,${sc.area.darkness ?? 0.93})`;
  dc.fillRect(0, 0, VIEW_W, VIEW_H);
  dc.globalCompositeOperation = 'destination-out';
  // One pre-rendered soft disc, scaled per light: no gradient objects per frame.
  const disc = lightDisc();
  const light = (x: number, y: number, r: number): void => {
    if (r <= 0) return;
    dc.drawImage(disc, x - r, y - r, r * 2, r * 2);
  };
  const pc = sc.playerCenter();
  const flicker = Math.sin(sc.frame / 7) * 2;
  const base = hasItem(sc.s, 'karbidlampa') ? 92 : 46;
  light(pc.x - camX, pc.y - camY, sc.spell.lyse > 0 ? 150 : base + flicker);
  // The signal flashlight throws a beam ahead of Dagny.
  if (hasItem(sc.s, 'ficklampa')) light(pc.x + sc.player.facing * 70 - camX, pc.y - camY, 46);
  for (const pr of sc.projectiles) if (pr.sprite === 'bolt' && pr.delay === 0) light(pr.x + 4 - camX, pr.y + pr.h - 10 - camY, 70);
  for (const cp of sc.checkpoints) if (cp.lit) light(cp.tx * TILE + 8 - camX, cp.ty * TILE + 4 - camY, 40 + flicker);
  for (const a of sc.anim) {
    if (a.x + TILE + 80 < camX || a.x - 80 > camX + VIEW_W || a.y + TILE + 80 < camY || a.y - 80 > camY + VIEW_H) continue;
    if (a.sprite === 'bulbs') light(a.x + 8 - camX, a.y + 5 - camY, 36);
    else if (a.sprite === 'candle') light(a.x + 8 - camX, a.y + 4 - camY, 34 + flicker);
    else if (a.sprite === 'lantern') light(a.x + 8 - camX, a.y + 6 - camY, 44 + flicker);
    else if (a.sprite === 'crystal') light(a.x + 8 - camX, a.y + 7 - camY, 40 + flicker);
    else if (a.sprite === 'lens') light(a.x + 8 - camX, a.y + 8 - camY, 64 + flicker * 2);
  }
  for (const e of sc.enemies) {
    if (e.dead) continue;
    if (e.def.id === 'lyktgubbe') light(e.x + e.w / 2 - camX, e.y + e.h / 2 - camY, 26);
    // Gruvrået carries her own carbide lantern.
    else if (e.def.behavior === 'boss_bergakung' && e.phase === 1) light(e.x + e.w / 2 - camX, e.y + 8 - camY, 50);
    else if (e.def.behavior === 'boss_spelman') light(e.x + e.w / 2 - camX, e.y + 10 - camY, 60);
    else if (e.def.behavior === 'boss_gruvra' && e.alpha > 0.05) light(e.x + e.w / 2 - camX, e.y + 6 - camY, 56 * e.alpha);
  }
  // Lit dance-floor squares glow.
  if (sc.area.beat) {
    const period = sc.area.beat.period;
    for (const c of sc.beatCells) {
      if ((c.tx & 1) === 0 || !sc.beatAwake() || !squareActive(c.group, sc.frame, period)) continue;
      const x = c.tx * TILE - camX;
      if (x < -30 || x > VIEW_W + 30) continue;
      light(x, c.ty * TILE + 2 - camY, 22);
    }
  }
  // Furniture with a flame or a glow of its own lights its corner of a dark room.
  for (const pr of FURNITURE[sc.area.id] ?? []) {
    const glow = GLOWS[pr.sprite ?? ''];
    if (glow) light(pr.tx * TILE + glow[0] - camX, (pr.ty + 1) * TILE - spriteSize(pr.sprite!).h + glow[1] + (pr.dy ?? 0) - camY, glow[2] + flicker);
  }
  for (const pr of sc.area.props ?? []) if (pr.sprite === 'irrbloss') light(pr.tx * TILE + 4 + (pr.dx ?? 0) - camX, (pr.ty + 1) * TILE - 4 + (pr.dy ?? 0) - camY, 34 + flicker);
  for (const pr of sc.projectiles) if (pr.sprite === 'noteShot') light(pr.x + 4 - camX, pr.y + 4 - camY, 12);
  for (const pk of sc.pickups) if (pk.kind === 'container' || pk.kind === 'treasure') light(pk.x + 6 - camX, pk.y + 6 - camY, 24 + flicker);
  for (const n of sc.npcs) if (n.def.id === 'dagmar') light(n.x + 8 - camX, n.y + 10 - camY, 60 + flicker);
  for (const pr of sc.projectiles) if (pr.sprite === 'stone') light(pr.x + 4 - camX, pr.y + 4 - camY, 12);
  for (const pr of sc.projectiles) if (pr.sprite === 'fireball') light(pr.x + 4 - camX, pr.y + 4 - camY, 24);
  dc.globalCompositeOperation = 'source-over';
  ctx.drawImage(d, 0, 0);
  // Warm glow on top of the lights.
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = PALETTE.o;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

export function renderSpellIcons(sc: SideScene, ctx: CanvasRenderingContext2D): void {
  let x = 14;
  const y = 33;
  for (const [k, t] of Object.entries(sc.spell)) {
    if (t <= 0) continue;
    // It lasts the room out: just the name, no countdown.
    const txt = SPELLS[k as SpellId].name;
    drawText(ctx, txt, x, y, 'c', { shadow: 'k' });
    x += measure(txt) + 6;
  }
}

export function renderBossBar(sc: SideScene, ctx: CanvasRenderingContext2D): void {
  const b = sc.boss;
  if (!b || !b.awake || b.dead || sc.game.hudHidden) return;
  const w = 160;
  const x = (VIEW_W - w) / 2;
  const y = VIEW_H - 16;
  drawText(ctx, b.def.name, VIEW_W / 2, y - 12, 'W', { align: 'center', outline: 'k' });
  ctx.fillStyle = PALETTE.k;
  ctx.fillRect(x - 1, y - 1, w + 2, 6);
  ctx.fillStyle = PALETTE.d;
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = b.phase === 0 ? PALETTE.W : PALETTE.P;
  ctx.fillRect(x, y, Math.round((w * Math.max(0, b.hp)) / b.maxHp), 4);
}

export function renderName(sc: SideScene, ctx: CanvasRenderingContext2D): void {
  const a = Math.min(1, sc.nameT / 30, (150 - sc.nameT) / 20);
  ctx.globalAlpha = Math.max(0, a);
  const name = sc.area.name;
  const w = measure(name) + 24;
  const x = Math.round((VIEW_W - w) / 2);
  const y = 46;
  ctx.fillStyle = PALETTE.k;
  ctx.fillRect(x, y, w, 17);
  ctx.fillStyle = PALETTE.y;
  ctx.fillRect(x + 2, y + 2, w - 4, 1);
  ctx.fillRect(x + 2, y + 14, w - 4, 1);
  drawText(ctx, name, VIEW_W / 2, y + 4, 'W', { align: 'center' });
  ctx.globalAlpha = 1;
}
